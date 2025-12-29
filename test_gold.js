const YahooFinance = require('yahoo-finance2').default;

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

async function testSymbols() {
    const symbols = ['XAUUSD=X', 'GC=F', 'GLD'];
    console.log('Testing Gold Symbols...');

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

testSymbols();
