const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ======================== PRODUCTS ========================
router.get('/products', (req, res) => {
  try {
    const { category, search } = req.query;
    const products = db.getProducts(category, search);
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/products/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/products', (req, res) => {
  try {
    const { name, category, prices, description, image } = req.body;
    if (!name || !category || !prices) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đủ tên, phân loại và giá' });
    }
    const created = db.createProduct(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/products/:id', (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/products/:id', (req, res) => {
  try {
    const deleted = db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để xóa' });
    }
    res.json({ success: true, message: 'Đã xóa sản phẩm thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ======================== ORDERS ========================
// Tạo đơn hàng mới
router.post('/orders', (req, res) => {
  try {
    const { customer, items, paymentMethod, voucherCode } = req.body;
    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ tên, số điện thoại và địa chỉ giao hàng' });
    }
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng không có sản phẩm nào' });
    }

    // Tính toán subtotal & discount
    let subtotal = 0;
    items.forEach(item => {
      subtotal += (Number(item.price) || 0) * (Number(item.qty) || 1);
    });

    let discount = 0;
    if (voucherCode) {
      const voucher = db.getVoucher(voucherCode);
      if (voucher) {
        if (voucher.type === 'percent') {
          discount = Math.min(Math.round(subtotal * (voucher.value / 100)), voucher.maxDiscount || Infinity);
        } else if (voucher.type === 'fixed') {
          discount = Math.min(voucher.value, subtotal);
        }
      }
    }

    const shippingFee = subtotal >= 300000 ? 0 : 20000;
    const total = Math.max(0, subtotal - discount + shippingFee);

    const order = db.createOrder({
      customer,
      items,
      paymentMethod,
      voucherCode,
      subtotal,
      discount,
      shippingFee,
      total
    });

    // Tạo link VietQR chuẩn nếu chọn phương thức chuyển khoản
    let paymentInfo = null;
    if (paymentMethod === 'vietqr') {
      const settings = db.getSettings();
      const bank = settings.bank || { bankId: 'MB', accountNo: '090812345688', accountName: 'AN CANDLE STUDIO' };
      const transferContent = `AN ${order.id.replace('AN-', '').replace('-', '')}`;
      const qrUrl = `https://img.vietqr.io/image/${bank.bankId}-${bank.accountNo}-compact2.png?amount=${total}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bank.accountName)}`;
      paymentInfo = {
        qrUrl,
        bankName: bank.bankName,
        accountNo: bank.accountNo,
        accountName: bank.accountName,
        amount: total,
        transferContent
      };
    }

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      data: order,
      paymentInfo
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tra cứu đơn hàng (cho khách hàng)
router.get('/orders/track', (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã đơn hàng hoặc số điện thoại' });
    }
    const order = db.trackOrderByQuery(query);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng phù hợp' });
    }

    // Generate VietQR link if pending payment
    let paymentInfo = null;
    if (order.paymentMethod === 'vietqr') {
      const settings = db.getSettings();
      const bank = settings.bank || { bankId: 'MB', accountNo: '090812345688', accountName: 'AN CANDLE STUDIO' };
      const transferContent = `AN ${order.id.replace('AN-', '').replace('-', '')}`;
      paymentInfo = {
        qrUrl: `https://img.vietqr.io/image/${bank.bankId}-${bank.accountNo}-compact2.png?amount=${order.total}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bank.accountName)}`,
        bankName: bank.bankName,
        accountNo: bank.accountNo,
        accountName: bank.accountName,
        amount: order.total,
        transferContent
      };
    }

    res.json({ success: true, data: order, paymentInfo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Lấy danh sách tất cả đơn hàng
router.get('/orders', (req, res) => {
  try {
    const { status, search } = req.query;
    const orders = db.getOrders(status, search);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Chi tiết đơn hàng
router.get('/orders/:id', (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Cập nhật trạng thái đơn hàng
router.patch('/orders/:id/status', (req, res) => {
  try {
    const { status, message } = req.body;
    const validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }
    const updated = db.updateOrderStatus(req.params.id, status, message);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    res.json({ success: true, message: 'Cập nhật trạng thái thành công', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ======================== VOUCHERS ========================
router.post('/vouchers/verify', (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Chưa nhập mã giảm giá' });
    }
    const voucher = db.getVoucher(code);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    }
    if (voucher.minOrder && subtotal && subtotal < voucher.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu cần ${voucher.minOrder.toLocaleString('vi-VN')}đ để sử dụng mã này`
      });
    }

    let discountAmount = 0;
    const orderSubtotal = Number(subtotal) || 0;
    if (voucher.type === 'percent') {
      discountAmount = Math.min(Math.round(orderSubtotal * (voucher.value / 100)), voucher.maxDiscount || Infinity);
    } else if (voucher.type === 'fixed') {
      discountAmount = Math.min(voucher.value, orderSubtotal);
    } else if (voucher.type === 'shipping') {
      discountAmount = Math.min(voucher.value, 30000);
    }

    res.json({
      success: true,
      data: {
        code: voucher.code,
        description: voucher.description,
        type: voucher.type,
        value: voucher.value,
        discountAmount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/vouchers', (req, res) => {
  try {
    const vouchers = db.getAllVouchers();
    res.json({ success: true, data: vouchers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ======================== REVIEWS ========================
router.get('/reviews', (req, res) => {
  try {
    const { productId } = req.query;
    const reviews = db.getReviews(productId);
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/reviews', (req, res) => {
  try {
    const { productId, name, rating, comment } = req.body;
    if (!productId || !name || !comment) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ tên, đánh giá và cảm nhận' });
    }
    const created = db.addReview({
      productId: Number(productId),
      name,
      rating: Number(rating) || 5,
      comment
    });
    res.status(201).json({ success: true, message: 'Cảm ơn bạn đã gửi đánh giá!', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ======================== AI CHATBOT ========================
router.post('/chat', (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Nội dung tin nhắn trống' });
    }

    const q = message.toLowerCase();
    let reply = '';
    let suggestions = [];

    if (q.includes('4 dòng') || q.includes('calm') || q.includes('focus') || q.includes('cozy') || q.includes('memory')) {
      reply = `AN CANDLE STUDIO có 4 bộ sưu tập hương đặc trưng được phối từ tinh dầu tự nhiên:<br/>
      • <strong>CALM (Hoa & Gỗ nhẹ):</strong> AN Tĩnh, AN Nhiên — Giúp thư giãn sâu, ngủ ngon và thiền định.<br/>
      • <strong>FOCUS (Citrus & Thảo mộc):</strong> AN Tỉnh, AN Tuệ — Tỉnh táo, tăng tập trung làm việc và đọc sách.<br/>
      • <strong>COZY (Vanilla & Gỗ ấm):</strong> AN Ấm, AN Mộc — Hương thơm ngọt ấm, sưởi ấm không gian tối se lạnh.<br/>
      • <strong>MEMORY:</strong> Hộp quà thủ công in thiệp cá nhân hóa lưu giữ kỷ niệm.`;
      suggestions = ['Xem bảng giá các dòng', 'Làm quiz chọn nến', 'Cách cắt bấc an toàn'];
    } else if (q.includes('giá') || q.includes('90g') || q.includes('180g') || q.includes('299') || q.includes('bao nhiêu')) {
      reply = `Bảng giá niêm yết chuẩn tại <strong>AN CANDLE STUDIO</strong>:<br/>
      • <strong>Hũ Mini 90g:</strong> 139.000đ (Thời gian cháy 20–25 giờ).<br/>
      • <strong>Hũ Tiêu chuẩn 180g:</strong> 229.000đ (Thời gian cháy 40–45 giờ).<br/>
      • <strong>Set Quà MEMORY:</strong> 299.000đ (Gồm 2 hũ Mini 90g + Hộp quà + Thiệp in lời chúc).<br/>
      🎁 Nhập mã <strong>ANCHAO20</strong> để được giảm ngay 20% cho đơn hàng đầu tiên nhé!`;
      suggestions = ['Áp dụng mã ANCHAO20', 'Đặt set quà tặng', 'Tra cứu đơn hàng'];
    } else if (q.includes('an toàn') || q.includes('đốt') || q.includes('bấc') || q.includes('cháy')) {
      reply = `⚠️ <strong>4 Quy tắc vàng để đốt nến an toàn & thơm lâu:</strong><br/>
      1. Cắt ngắn bấc còn khoảng <strong>1/4 inch (~6mm)</strong> trước mỗi lần thắp để tránh khói đen.<br/>
      2. Trong lần đốt đầu tiên, hãy để nến cháy từ <strong>1.5 – 2 giờ</strong> cho sáp tan đều tới mép hũ (tránh hiện tượng lõm hũ nến).<br/>
      3. Đặt hũ nến trên bề mặt phẳng chịu nhiệt, cách xa vật dễ bắt lửa.<br/>
      4. Không bao giờ đốt nến khi ngủ quên hoặc ra khỏi phòng.`;
      suggestions = ['Xem hướng dẫn chi tiết', 'Tư vấn mùi phòng ngủ'];
    } else if (q.includes('tra cứu') || q.includes('đơn hàng') || q.includes('vận chuyển') || q.includes('giao')) {
      reply = `Bạn có thể tra cứu tình trạng đơn hàng ngay tại website bằng cách bấm nút <strong>"Tra cứu đơn hàng"</strong> ở góc trên menu hoặc truy cập đường dẫn <a href="/track-order.html" class="underline text-wood font-bold">Tra Cứu Đơn Hàng</a> rồi nhập mã đơn (ví dụ <code>#AN-2611-982415</code>) hoặc Số điện thoại đặt hàng nhé!`;
      suggestions = ['Mở trang tra cứu đơn', 'Phí vận chuyển bao nhiêu?'];
    } else {
      reply = `Cảm ơn bạn đã nhắn tin cho <strong>AN Care</strong>! Mình là trợ lý tư vấn hương thơm thông minh của AN. Bạn cần mình gợi ý mùi nến phù hợp cho phòng ngủ, bàn làm việc, hay tư vấn set quà tặng thiệp in tên người thương?`;
      suggestions = ['Tư vấn nến phòng ngủ', 'Tư vấn nến làm việc', 'Set quà tặng sinh nhật', 'Xem bảng giá'];
    }

    res.json({
      success: true,
      reply,
      suggestions
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ======================== STATS & SETTINGS ========================
router.get('/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/settings', (req, res) => {
  try {
    const settings = db.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
