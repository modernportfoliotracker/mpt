import { prisma } from "@/lib/prisma";

export interface RatesMap {
    [currency: string]: number;
}

export async function getExchangeRates(): Promise<RatesMap> {
    const requiredCurrencies = ['USD', 'TRY']; // Minimal set we care about ensuring logic for
    // EUR is base 1 always.

    // 1. Check DB
    const storedRates = await prisma.exchangeRate.findMany();

    let rates: RatesMap = { EUR: 1 };
    let needsUpdate = false;

    // Populate rates from DB
    storedRates.forEach(r => {
        rates[r.currency] = r.rate;
    });

    // Helper to determine if rates are stale based on CET schedule (08:00 and 17:00)
    const isStale = (lastUpdateUTC: Date) => {
        try {
            const timeZone = 'Europe/Berlin';
            // Create "Zonal" dates (Wall clock time in Berlin)
            // Note: toLocaleString returns a string we immediately parse back to a Date.
            // This Date object will have the "Wall Clock" time of Berlin but in the local system's timezone context/UTC components.
            // effectively allowing us to use .getHours() to see the Berlin hour.
            const nowZ = new Date(new Date().toLocaleString('en-US', { timeZone }));
            const lastZ = new Date(lastUpdateUTC.toLocaleString('en-US', { timeZone }));

            // Define Checkpoints in Wall Clock Time
            const cp17 = new Date(nowZ);
            cp17.setHours(17, 0, 0, 0); // Today 17:00

            const cp8 = new Date(nowZ);
            cp8.setHours(8, 0, 0, 0);   // Today 08:00

            const cpY17 = new Date(nowZ);
            cpY17.setDate(cpY17.getDate() - 1);
            cpY17.setHours(17, 0, 0, 0); // Yesterday 17:00

            // Logic:
            // If now is past 17:00, we need data from after 17:00 today.
            if (nowZ >= cp17) return lastZ < cp17;

            // If now is past 08:00 (but before 17:00), we need data from after 08:00 today.
            if (nowZ >= cp8) return lastZ < cp8;

            // If now is before 08:00, we need data from after yesterday 17:00.
            return lastZ < cpY17;
        } catch (e) {
            console.warn("Timezone check failed, falling back to 12h expiry", e);
            // Fallback for environments without ICU: 12 hour expiry
            const hoursSince = (Date.now() - lastUpdateUTC.getTime()) / (1000 * 60 * 60);
            return hoursSince > 12;
        }
    }

    // Check freshness
    if (storedRates.length === 0) {
        needsUpdate = true;
    } else {
        // Check if any required currency is missing or stale
        for (const cur of requiredCurrencies) {
            const r = storedRates.find(x => x.currency === cur);
            if (!r) {
                needsUpdate = true;
                break;
            }
            if (isStale(r.updatedAt)) {
                console.log(`Exchange Rates (${cur}) stale based on 08:00/17:00 CET schedule. Last update: ${r.updatedAt.toLocaleString()}`);
                needsUpdate = true;
                break;
            }
        }
    }

    if (needsUpdate) {
        try {
            console.log("Fetching new exchange rates from Frankfurter...");
            // Fetch all rates (default)
            const res = await fetch('https://api.frankfurter.app/latest?from=EUR');
            if (!res.ok) throw new Error("Failed to fetch rates");
            const data = await res.json();

            // data.rates is { USD: 1.05, TRY: 35.2, ... }
            const newRates = data.rates;

            // Update DB in parallel for speed
            await Promise.all(Object.entries(newRates).map(async ([currency, rate]) => {
                if (typeof rate === 'number') {
                    await prisma.exchangeRate.upsert({
                        where: { currency },
                        create: { currency, rate },
                        update: { rate } // updatedAt updates automatically
                    });
                    rates[currency] = rate;
                }
            }));

            console.log("Exchange rates updated successfully.");
        } catch (e) {
            console.error("Error updating rates:", e);
            // Fallback to existing rates or hardcoded defaults if DB empty
            if (Object.keys(rates).length <= 1) {
                // Emergency fallbacks
                console.warn("Using emergency fallback rates");
                rates['USD'] = 1.09;
                rates['TRY'] = 37.5;
            }
        }
    }

    return rates;
}
