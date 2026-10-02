const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendExpiryEmail(items) {
  const itemsListHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border: 1px solid #e2e8f0;"><b>${item.name}</b></td>
      <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.category || '-'}</td>
      <td style="padding: 10px; border: 1px solid #e2e8f0;">${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #e2e8f0; color: #dc2626; font-weight: bold;">
        ${new Date(item.expiryDate).toLocaleDateString('en-GB')}
      </td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Kirana Stock Alert" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `⚠️ Kirana Alert: ${items.length} Items Expire Hone Wale Hain!`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; color: #1e293b;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="color: #dc2626; margin-top: 0;">🛒 Daily Kirana Expiry Alert</h2>
          <p>Namaste! Aapki dukan ke yeh items agle 3 dino mein expire hone wale hain ya ho chuke hain:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
            <thead>
              <tr style="background-color: #0f172a; color: white;">
                <th style="padding: 10px; border: 1px solid #334155;">Product</th>
                <th style="padding: 10px; border: 1px solid #334155;">Category</th>
                <th style="padding: 10px; border: 1px solid #334155;">Stock</th>
                <th style="padding: 10px; border: 1px solid #334155;">Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
            </tbody>
          </table>
          <p style="margin-top: 20px; font-size: 12px; color: #64748b;">
            Tip: In items ko shelf se discount par nikalein ya clearance section mein dalein.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Alert Email kamyabi ke sath inbox mein bhej diya gaya!');
  } catch (error) {
    console.error('Email bhejne mein error aaya:', error.message);
  }
}

module.exports = { sendExpiryEmail };