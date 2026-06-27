require('dotenv').config({ path: '.env.local' });
const { getAnswerRealtyObject } = require('./src/lib/actions.js');

async function run() {
  try {
     console.log('Testing getAnswerRealtyObject...');
     const realty = await getAnswerRealtyObject({ ask: '2 beds in usd 500000', lat: null, long: null });
     console.log('Result:', realty);
  } catch(e) {
     console.error('Error in getAnswerRealtyObject:', e);
  }
}
run();
