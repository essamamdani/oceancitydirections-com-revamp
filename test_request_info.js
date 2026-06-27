require('dotenv').config({ path: '.env.local' });
const { POST } = require('./src/app/api/request-info/route.js');

async function run() {
  const req = {
    headers: new Map([['host', 'www.longislanddirections.com']]),
    json: async () => ({
      name: "Test",
      email: "test@test.com",
      phone: "1231231234",
      remarks: "Test remarks",
      businessTitle: "Test Biz",
      businessUrl: "http://test.com",
      type: "information",
      businessId: "12345",
      source_state: "md"
    })
  };
  
  try {
     const res = await POST(req);
     console.log('Status:', res.status);
     const json = await res.json();
     console.log('Response JSON:', json);
  } catch(e) {
     console.error('Error:', e);
  }
}
run();
