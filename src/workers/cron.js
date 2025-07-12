const cron = require('node-cron');
const axios = require('axios');

let jobScheduled = false;

const pingURL = (URL_TO_PING) => {
  if (jobScheduled) return;

  console.log("Starting cron to ping URL every 10 minutes:", URL_TO_PING);

  cron.schedule('*/10 * * * *', async () => {
    try {
      const response = await axios.get(URL_TO_PING);
      console.log(`[${new Date().toISOString()}] Pinged ${URL_TO_PING} - Status: ${response.status}`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Failed to ping ${URL_TO_PING}:`, error.message);
    }
  });

  jobScheduled = true;
};

module.exports = pingURL;
