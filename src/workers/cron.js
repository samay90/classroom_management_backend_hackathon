const cron = require('node-cron');
const axios = require('axios');

const pingURL = (URL_TO_PING) =>{
  cron.schedule('*/10 * * * *', async () => {
  try {
    const response = await axios.get(URL_TO_PING);
    console.log(`[${new Date().toISOString()}] Pinged ${URL_TO_PING} - Status: ${response.status}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to ping ${URL_TO_PING}:`, error.message);
  }
});
}
module.exports = pingURL;