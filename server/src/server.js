const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static frontend files
app.use(express.static(PUBLIC_DIR));

// API Routes
app.use('/api', apiRouter);

// Convenient HTML shortcuts
app.get('/admin', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

app.get('/track', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'track-order.html'));
});

app.get('/track-order', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'track-order.html'));
});

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌿 AN CANDLE STUDIO Backend & Frontend Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`✦ Trang chủ cửa hàng: http://localhost:${PORT}`);
    console.log(`✦ Quản trị đơn hàng (Admin): http://localhost:${PORT}/admin`);
    console.log(`✦ Tra cứu đơn hàng: http://localhost:${PORT}/track`);
    console.log(`✦ REST API Docs: http://localhost:${PORT}/api/products`);
  });
}

module.exports = app;
