const cron = require('node-cron');
const Item = require('../models/Item');
const { sendExpiryEmail } = require('./emailService');

async function checkExpiryAndSendAlert() {
  try {
    console.log('\n--- 🔍 Auto Scanning Database For Expiries ---');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next3Days = new Date();
    next3Days.setDate(today.getDate() + 3);
    next3Days.setHours(23, 59, 59, 999);

    const urgentItems = await Item.find({ expiryDate: { $lte: next3Days } });

    if (urgentItems.length === 0) {
      console.log('✅ Stock Safe: Koi urgent expiry nahi mili.');
      return;
    }

    console.log(`⚠️ Urgency Detected: ${urgentItems.length} items dhyan mang rahe hain.`);
    await sendExpiryEmail(urgentItems);
  } catch (err) {
    console.error('Cron Scanner Error:', err.message);
  }
}

function initCronJobs() {
  cron.schedule('0 9 * * *', () => {
    console.log('⏰ [Daily 9:00 AM Cron Triggered]');
    checkExpiryAndSendAlert();
  });
}

module.exports = { initCronJobs, checkExpiryAndSendAlert };