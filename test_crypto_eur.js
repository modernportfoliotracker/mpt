const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

async function checkCurrency() {
    const symbols = ['BTC-EUR', 'ETH-EUR'];
    console.log('Checking Currencies...');

    for (const sym of symbols) {
        try {
            const quote = await yahooFinance.quote(sym);
            if (quote) {
                console.log(`[SUCCESS] ${sym}: ${quote.regularMarketPrice} ${quote.currency}`);
            } else {
                console.log(`[EMPTY] ${sym}`);
            }
        } catch (e) {
            console.log(`[FAILED] ${sym}: ${e.message}`);
        }
    }
}

checkCurrency();
