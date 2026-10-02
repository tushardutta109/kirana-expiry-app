const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully! 📦');
    // Server start hote hi test email trigger hoga
    checkExpiryAndSendAlert();
  })
  .catch((err) => console.log('MongoDB Connection Error: ', err));

// Models Import
const Item = require('./models/Item');

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email bhejne ka function
async function sendExpiryEmail(items) {
  let itemsListHtml = items.map(item => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;"><b>${item.name}</b></td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.category || '-'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 8px; border: 1px solid #ddd; color: #d9534f;"><b>${new Date(item.expiryDate).toLocaleDateString('en-GB')}</b></td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Kirana Stock Alert" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `⚠️ Kirana Alert: ${items.length} Items Expire Hone Wale Hain!`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #dc2626;">🛒 Kirana Expiry Alert Report</h2>
        <p>Namaste! Aapki dukan ke yeh items ya toh expire ho chuke hain ya agle 3 dino mein expire hone wale hain:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; text-align: left;">
          <thead>
            <tr style="background-color: #0f172a; color: white;">
              <th style="padding: 8px; border: 1px solid #ddd;">Item Name</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Category</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
        </table>
        <p style="margin-top: 20px; font-size: 13px; color: #666;">Kripya shelf se in items ko check karke discount par nikalein ya hata dein.</p>
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

// Routes
app.post('/api/items', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { quantity: req.body.quantity },
      { new: true }
    );
    res.status(200).json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Item delete ho gaya!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Scan aur Email alert logic
async function checkExpiryAndSendAlert() {
  try {
    console.log('\n--- 🔍 Checking Database For Urgent Expiries ---');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next3Days = new Date();
    next3Days.setDate(today.getDate() + 3);
    next3Days.setHours(23, 59, 59, 999);

    const urgentItems = await Item.find({
      expiryDate: { $lte: next3Days }
    });

    if (urgentItems.length === 0) {
      console.log('✅ Sab Safe: Agle 3 dino mein koi bhi item expire nahi ho raha.');
      console.log('--------------------------------------------------\n');
      return;
    }

    console.log(`⚠️ ACTION REQUIRED: ${urgentItems.length} items dhyan mang rahe hain!`);
    await sendExpiryEmail(urgentItems);
    console.log('--------------------------------------------------\n');

  } catch (error) {
    console.error('Scan Error:', error.message);
  }
}

// ⏰ Roz subah 9:00 AM Cron Schedule
cron.schedule('0 9 * * *', () => {
  console.log('⏰ [Daily 9:00 AM Job Triggered]');
  checkExpiryAndSendAlert();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});