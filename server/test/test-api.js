const http = require('http');
const app = require('../src/server');

const PORT = 3001;
const server = app.listen(PORT, async () => {
  console.log(`[TEST] Server started on port ${PORT}`);

  try {
    // 1. Test GET /api/products
    console.log('[TEST 1] Testing GET /api/products...');
    const productsRes = await request(`/api/products`);
    assert(productsRes.success === true, 'Products response success is true');
    assert(productsRes.data.length >= 8, 'Has at least 8 seeded products');
    console.log(`✓ Products API OK (${productsRes.data.length} products found)`);

    // 2. Test POST /api/vouchers/verify
    console.log('[TEST 2] Testing POST /api/vouchers/verify...');
    const voucherRes = await request('/api/vouchers/verify', 'POST', {
      code: 'ANCHAO20',
      subtotal: 229000
    });
    assert(voucherRes.success === true, 'Voucher verification succeeded');
    assert(voucherRes.data.discountAmount > 0, 'Discount amount calculated');
    console.log(`✓ Voucher API OK (Discount: ${voucherRes.data.discountAmount}đ)`);

    // 3. Test POST /api/orders
    console.log('[TEST 3] Testing POST /api/orders...');
    const orderRes = await request('/api/orders', 'POST', {
      customer: {
        name: 'Kiểm Thử Viên',
        phone: '0988776655',
        email: 'test@ancandle.vn',
        address: '123 Đường Hoa Hồng, P. Bến Nghé, Quận 1, TP.HCM',
        notes: 'Kiểm thử đơn hàng tự động'
      },
      items: [
        {
          id: 1,
          name: 'AN Tĩnh — Gỗ Đàn Hương & Oải Hương',
          sizeKey: '180g',
          qty: 1,
          price: 229000,
          cardWish: 'Chúc một ngày an lành.'
        }
      ],
      paymentMethod: 'vietqr',
      voucherCode: 'ANCHAO20'
    });
    assert(orderRes.success === true, 'Order created successfully');
    assert(orderRes.data.id.startsWith('AN-'), 'Order code generated with AN- prefix');
    assert(orderRes.paymentInfo && orderRes.paymentInfo.qrUrl, 'VietQR link generated');
    const createdOrderId = orderRes.data.id;
    console.log(`✓ Order creation OK (Order ID: ${createdOrderId}, Total: ${orderRes.data.total}đ, QR: Generated)`);

    // 4. Test GET /api/orders/track
    console.log('[TEST 4] Testing GET /api/orders/track...');
    const trackRes = await request(`/api/orders/track?query=${createdOrderId}`);
    assert(trackRes.success === true, 'Order tracking succeeded');
    assert(trackRes.data.customer.name === 'Kiểm Thử Viên', 'Tracking returns correct customer');
    console.log(`✓ Order tracking OK (Status: ${trackRes.data.status})`);

    // 5. Test PATCH /api/orders/:id/status
    console.log('[TEST 5] Testing PATCH /api/orders/:id/status...');
    const statusRes = await request(`/api/orders/${createdOrderId}/status`, 'PATCH', {
      status: 'confirmed',
      message: 'Đã nhận thanh toán qua VietQR và duyệt đơn.'
    });
    assert(statusRes.success === true, 'Status updated');
    assert(statusRes.data.status === 'confirmed', 'Status matches confirmed');
    console.log(`✓ Order status update OK (New status: ${statusRes.data.status})`);

    // 6. Test GET /api/stats
    console.log('[TEST 6] Testing GET /api/stats...');
    const statsRes = await request('/api/stats');
    assert(statsRes.success === true, 'Stats retrieved');
    assert(statsRes.data.totalOrders > 0, 'Total orders counted');
    console.log(`✓ Stats API OK (Total revenue: ${statsRes.data.totalRevenue}đ, Total orders: ${statsRes.data.totalOrders})`);

    // 7. Test POST /api/chat
    console.log('[TEST 7] Testing POST /api/chat...');
    const chatRes = await request('/api/chat', 'POST', {
      message: 'Cho mình hỏi bảng giá nến 90g và 180g?'
    });
    assert(chatRes.success === true, 'Chat bot responded');
    assert(chatRes.reply.length > 20, 'Reply is informative');
    console.log(`✓ Chat AI API OK`);

    console.log('\n========================================');
    console.log('🎉 TẤT CẢ 7/7 KIỂM THỬ BACKEND ĐỀU THÀNH CÔNG!');
    console.log('========================================\n');
  } catch (err) {
    console.error('❌ Kiểm thử thất bại:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

function request(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
        }
      },
      res => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${body}`));
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}
