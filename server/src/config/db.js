const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Default initial data
const initialData = {
  products: [
    {
      id: 1,
      name: "AN Tĩnh — Gỗ Đàn Hương & Oải Hương",
      category: "CALM",
      categoryTag: "CALM • Hoa & Gỗ nhẹ",
      isGiftSet: false,
      defaultSize: "180g",
      batchCode: "Lô #AN-CALM-2611A",
      rating: 4.9,
      reviews: 412,
      inStock: true,
      stockQty: 85,
      prices: { "90g": 139000, "180g": 229000 },
      image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=700&q=80",
      description: "Sự hòa quyện êm dịu giữa gỗ đàn hương nhẹ và hoa oải hương Pháp, dành trọn cho những phút giây nghỉ ngơi, thiền định và tái tạo năng lượng cuối ngày.",
      topNote: "Cam Bergamot nhẹ, Lá oải hương tươi",
      heartNote: "Hoa oải hương Pháp, Hoa cúc La Mã",
      baseNote: "Gỗ đàn hương nhẹ, Xạ hương trắng",
      jarStyle: "from-[#6B4226] via-[#4A2B16] to-[#2E190C]",
      shortLabel: "AN TĨNH"
    },
    {
      id: 2,
      name: "AN Nhiên — Trà Trắng & Hoa Nhài",
      category: "CALM",
      categoryTag: "CALM • Hoa & Gỗ nhẹ",
      isGiftSet: false,
      defaultSize: "180g",
      batchCode: "Lô #AN-CALM-2611B",
      rating: 4.9,
      reviews: 358,
      inStock: true,
      stockQty: 60,
      prices: { "90g": 139000, "180g": 229000 },
      image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=80",
      description: "Hương trà trắng thanh khiết quyện cùng cánh hoa nhài đẫm sương và gỗ tuyết tùng dịu nhẹ, mang lại cảm giác bình yên tự tại trong từng hơi thở.",
      topNote: "Lá trà trắng, Chanh vàng thanh",
      heartNote: "Hoa nhài Tây, Hoa linh lan",
      baseNote: "Gỗ tuyết tùng nhẹ, Cỏ vetiver",
      jarStyle: "from-[#EAE3D9] via-[#DCD2C4] to-[#C8BBAE]",
      shortLabel: "AN NHIÊN"
    },
    {
      id: 3,
      name: "AN Tỉnh — Cam Ngọt & Bạc Hà Thảo Mộc",
      category: "FOCUS",
      categoryTag: "FOCUS • Citrus & Thảo mộc",
      isGiftSet: false,
      defaultSize: "180g",
      batchCode: "Lô #AN-FOCS-2611A",
      rating: 4.8,
      reviews: 294,
      inStock: true,
      stockQty: 110,
      prices: { "90g": 139000, "180g": 229000 },
      image: "https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&w=700&q=80",
      description: "Nốt hương Citrus tươi sáng từ vỏ cam ngọt Địa Trung Hải kết hợp lá bạc hà mát lạnh, giúp đầu óc minh mẫn khi làm việc và đọc sách cuối tuần.",
      topNote: "Cam ngọt chín mọng, Bưởi hồng",
      heartNote: "Bạc hà thảo mộc, Lá húng quế",
      baseNote: "Gỗ đàn hương trắng, Trà xanh",
      jarStyle: "from-[#E6DFD3] via-[#D8CFC0] to-[#C4B8A5]",
      shortLabel: "AN TỈNH"
    },
    {
      id: 4,
      name: "AN Tuệ — Sả Chanh & Hương Thảo",
      category: "FOCUS",
      categoryTag: "FOCUS • Citrus & Thảo mộc",
      isGiftSet: false,
      defaultSize: "90g",
      batchCode: "Lô #AN-FOCS-2611B",
      rating: 4.9,
      reviews: 231,
      inStock: true,
      stockQty: 45,
      prices: { "90g": 139000, "180g": 229000 },
      image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?auto=format&fit=crop&w=700&q=80",
      description: "Tinh dầu hương thảo (Rosemary) và sả chanh hữu cơ kích thích khả năng tập trung, thanh lọc không gian bàn học và giữ tinh thần sảng khoái.",
      topNote: "Chanh vàng, Cam Bergamot",
      heartNote: "Lá hương thảo, Sả chanh hữu cơ",
      baseNote: "Rêu sồi, Gỗ thông xanh",
      jarStyle: "from-[#EFE9E0] via-[#E2D9CC] to-[#CFC3B2]",
      shortLabel: "AN TUỆ"
    },
    {
      id: 5,
      name: "AN Ấm — Vani Madagascar & Hổ Phách",
      category: "COZY",
      categoryTag: "COZY • Vanilla & Gỗ ấm",
      isGiftSet: false,
      defaultSize: "180g",
      batchCode: "Lô #AN-COZY-2611A",
      rating: 5.0,
      reviews: 389,
      inStock: true,
      stockQty: 95,
      prices: { "90g": 139000, "180g": 229000 },
      image: "https://images.unsplash.com/photo-1608181831718-c9ffd8685576?auto=format&fit=crop&w=700&q=80",
      description: "Vị ngọt ấm áp của đậu Vani Madagascar hòa quyện nhựa hổ phách vàng và gỗ guaiac, biến buổi tối se lạnh thành không gian quây quần ấm cúng.",
      topNote: "Hạnh nhân rang, Quế chi nhẹ",
      heartNote: "Vani Madagascar, Hoa phong lan",
      baseNote: "Nhựa hổ phách, Gỗ guaiac ấm",
      jarStyle: "from-[#7A4928] via-[#593319] to-[#3B200E]",
      shortLabel: "AN ẤM"
    },
    {
      id: 6,
      name: "AN Mộc — Quế Hồi & Gỗ Tuyết Tùng",
      category: "COZY",
      categoryTag: "COZY • Vanilla & Gỗ ấm",
      isGiftSet: false,
      defaultSize: "180g",
      batchCode: "Lô #AN-COZY-2611B",
      rating: 4.8,
      reviews: 215,
      inStock: true,
      stockQty: 50,
      prices: { "90g": 139000, "180g": 229000 },
      image: "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=700&q=80",
      description: "Hương gỗ tuyết tùng trầm ấm ôm lấy chút cay dịu của vỏ quế và vani kem béo, gợi cảm giác như đang ngồi bên lò sưởi gỗ thông.",
      topNote: "Vỏ cam khô, Hạt nhục đậu khấu",
      heartNote: "Quế hồi dịu, Kem vani ấm",
      baseNote: "Gỗ tuyết tùng đỏ, Đậu Tonka",
      jarStyle: "from-[#6B4226] via-[#4A2B16] to-[#2E190C]",
      shortLabel: "AN MỘC"
    },
    {
      id: 7,
      name: "Set Quà Tặng MEMORY — Ký Ức Bình Yên",
      category: "MEMORY",
      categoryTag: "MEMORY • Set quà cá nhân hóa",
      isGiftSet: true,
      defaultSize: "set",
      batchCode: "Lô #AN-MEMO-2611A",
      rating: 5.0,
      reviews: 445,
      inStock: true,
      stockQty: 35,
      prices: { "set": 299000 },
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=700&q=80",
      description: "Hộp quà mỹ thuật thắt ruy băng lụa gồm 2 hũ Mini 90g (AN Tĩnh & AN Ấm), lọ diêm gỗ đầu vàng và thiệp in lời chúc cá nhân hóa lưu giữ kỷ niệm.",
      topNote: "Combo 2 hũ Mini 90g (CALM + COZY)",
      heartNote: "Thiệp mỹ thuật in lời chúc riêng",
      baseNote: "Hộp quà cứng + Diêm gỗ thủ công",
      jarStyle: "from-[#6B4226] via-[#4A2B16] to-[#2E190C]",
      shortLabel: "MEMORY"
    },
    {
      id: 8,
      name: "Set Quà Tặng MEMORY — Gửi Người Thương",
      category: "MEMORY",
      categoryTag: "MEMORY • Set quà cá nhân hóa",
      isGiftSet: true,
      defaultSize: "set",
      batchCode: "Lô #AN-MEMO-2611B",
      rating: 5.0,
      reviews: 312,
      inStock: true,
      stockQty: 40,
      prices: { "set": 299000 },
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80",
      description: "Món quà tinh tế dành tặng sinh nhật, kỷ niệm hoặc tri ân với 2 hũ Mini 90g (AN Nhiên & AN Tỉnh), đế lót gỗ thông và thiệp khắc tên người nhận.",
      topNote: "Combo 2 hũ Mini 90g (CALM + FOCUS)",
      heartNote: "Đế lót gỗ tự nhiên + Thiệp cá nhân",
      baseNote: "Túi giấy kraft thân thiện môi trường",
      jarStyle: "from-[#7A4928] via-[#593319] to-[#3B200E]",
      shortLabel: "MEMORY"
    }
  ],
  orders: [
    {
      id: "AN-2611-982415",
      createdAt: "2026-11-24T08:30:00.000Z",
      customer: {
        name: "Nguyễn Thu Hà",
        phone: "0908123456",
        email: "thuha.candle@gmail.com",
        address: "Căn hộ 12B, Landmark 81, P.22, Bình Thạnh, TP. Hồ Chí Minh",
        notes: "Giao giờ hành chính, gọi trước 15 phút giúp mình nhé."
      },
      items: [
        {
          id: 1,
          name: "AN Tĩnh — Gỗ Đàn Hương & Oải Hương",
          sizeKey: "180g",
          qty: 1,
          price: 229000,
          cardWish: "Chúc bạn luôn bình yên và dịu dàng với chính mình.",
          image: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=700&q=80"
        }
      ],
      paymentMethod: "vietqr",
      paymentStatus: "paid",
      subtotal: 229000,
      discount: 45800,
      voucherCode: "ANCHAO20",
      shippingFee: 20000,
      total: 203200,
      status: "shipping",
      timeline: [
        { status: "pending", time: "2026-11-24T08:30:00.000Z", message: "Đơn hàng đã được tạo thành công." },
        { status: "confirmed", time: "2026-11-24T09:15:00.000Z", message: "Studio đã xác nhận đơn & chuẩn bị nến thơm." },
        { status: "shipping", time: "2026-11-24T14:00:00.000Z", message: "Đã bàn giao cho đơn vị vận chuyển Viettel Post (Mã vận đơn: VTP892301)." }
      ]
    },
    {
      id: "AN-2611-741982",
      createdAt: "2026-11-23T15:20:00.000Z",
      customer: {
        name: "Trần Minh Quân",
        phone: "0912345678",
        email: "quan.tm@techcorp.vn",
        address: "Tòa nhà Keangnam Landmark 72, Mễ Trì, Nam Từ Liêm, Hà Nội",
        notes: "Đóng gói cẩn thận làm quà tặng sếp."
      },
      items: [
        {
          id: 7,
          name: "Set Quà Tặng MEMORY — Ký Ức Bình Yên",
          sizeKey: "set",
          qty: 1,
          price: 299000,
          cardWish: "Kính chúc Anh luôn an yên và vững bước trên hành trình mới.",
          image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=700&q=80"
        }
      ],
      paymentMethod: "vietqr",
      paymentStatus: "paid",
      subtotal: 299000,
      discount: 0,
      voucherCode: "",
      shippingFee: 0,
      total: 299000,
      status: "completed",
      timeline: [
        { status: "pending", time: "2026-11-23T15:20:00.000Z", message: "Đơn hàng đã được tạo." },
        { status: "confirmed", time: "2026-11-23T15:45:00.000Z", message: "Đã kiểm tra và in thiệp viết tay theo yêu cầu." },
        { status: "shipping", time: "2026-11-23T17:00:00.000Z", message: "Đang giao hàng hỏa tốc." },
        { status: "completed", time: "2026-11-24T10:30:00.000Z", message: "Khách hàng đã nhận kiện hàng nguyên vẹn." }
      ]
    }
  ],
  vouchers: [
    {
      code: "ANCHAO20",
      description: "Giảm 20% cho đơn hàng đầu tiên chào mừng bạn đến với AN Candle Studio",
      type: "percent",
      value: 20,
      minOrder: 0,
      maxDiscount: 100000,
      active: true
    },
    {
      code: "ANFREESHIP",
      description: "Miễn phí vận chuyển toàn quốc cho đơn từ 300.000đ",
      type: "shipping",
      value: 30000,
      minOrder: 300000,
      active: true
    },
    {
      code: "BINHYEN50K",
      description: "Giảm ngay 50.000đ cho đơn hàng từ 500.000đ",
      type: "fixed",
      value: 50000,
      minOrder: 500000,
      active: true
    }
  ],
  reviews: [
    {
      id: 1,
      productId: 1,
      name: "Lê Phương Thảo",
      rating: 5,
      date: "2026-11-20",
      comment: "Mùi đàn hương rất sâu, không bị nồng gắt. Thắp khoảng 30 phút là hương lan tỏa khắp phòng 20m2. Thiệp in chữ rất đẹp và ấm lòng!",
      verified: true
    },
    {
      id: 2,
      productId: 5,
      name: "Hoàng Nam",
      rating: 5,
      date: "2026-11-18",
      comment: "Hũ nến AN Ấm làm mùa đông Hà Nội dễ chịu hơn hẳn. Vani ngọt dịu kết hợp hổ phách tạo cảm giác rất thư thái.",
      verified: true
    }
  ],
  settings: {
    studioName: "AN CANDLE STUDIO",
    phone: "0908 123 456",
    email: "contact@ancandlestudio.vn",
    address: "28/4 Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh",
    bank: {
      accountNo: "090812345688",
      accountName: "AN CANDLE STUDIO",
      bankName: "MBBANK",
      bankId: "MB"
    }
  }
};

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      this.write(initialData);
    }
  }

  read() {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading database, using fallback in-memory:', err);
      return initialData;
    }
  }

  write(data) {
    try {
      const tmpFile = DATA_FILE + '.tmp';
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tmpFile, DATA_FILE);
      return true;
    } catch (err) {
      console.error('Error writing database:', err);
      return false;
    }
  }

  // PRODUCTS
  getProducts(category, search) {
    const db = this.read();
    let list = db.products || [];
    if (category && category !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.topNote && p.topNote.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getProductById(id) {
    const db = this.read();
    return db.products.find(p => p.id === Number(id));
  }

  createProduct(product) {
    const db = this.read();
    const newId = db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      rating: 5.0,
      reviews: 0,
      inStock: true,
      stockQty: 50,
      ...product
    };
    db.products.push(newProduct);
    this.write(db);
    return newProduct;
  }

  updateProduct(id, updates) {
    const db = this.read();
    const idx = db.products.findIndex(p => p.id === Number(id));
    if (idx === -1) return null;
    db.products[idx] = { ...db.products[idx], ...updates, id: Number(id) };
    this.write(db);
    return db.products[idx];
  }

  deleteProduct(id) {
    const db = this.read();
    const idx = db.products.findIndex(p => p.id === Number(id));
    if (idx === -1) return false;
    db.products.splice(idx, 1);
    this.write(db);
    return true;
  }

  // ORDERS
  getOrders(status, search) {
    const db = this.read();
    let list = [...(db.orders || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (status && status !== 'all') {
      list = list.filter(o => o.status === status);
    }
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        o.customer.email.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getOrderById(id) {
    const db = this.read();
    return db.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
  }

  trackOrderByQuery(query) {
    const db = this.read();
    const clean = (query || '').trim().toUpperCase();
    return db.orders.find(o =>
      o.id.toUpperCase() === clean ||
      o.customer.phone === query.trim() ||
      o.id.replace('#', '').toUpperCase() === clean.replace('#', '')
    );
  }

  createOrder(orderInput) {
    const db = this.read();
    const now = new Date();
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderId = `AN-${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}-${randomSuffix}`;

    const newOrder = {
      id: orderId,
      createdAt: now.toISOString(),
      customer: {
        name: orderInput.customer.name,
        phone: orderInput.customer.phone,
        email: orderInput.customer.email || '',
        address: orderInput.customer.address,
        notes: orderInput.customer.notes || ''
      },
      items: orderInput.items || [],
      paymentMethod: orderInput.paymentMethod || 'vietqr',
      paymentStatus: orderInput.paymentMethod === 'vietqr' ? 'pending_payment' : 'pending',
      subtotal: Number(orderInput.subtotal) || 0,
      discount: Number(orderInput.discount) || 0,
      voucherCode: orderInput.voucherCode || '',
      shippingFee: Number(orderInput.shippingFee) || 0,
      total: Number(orderInput.total) || 0,
      status: 'pending',
      timeline: [
        {
          status: 'pending',
          time: now.toISOString(),
          message: 'Đơn hàng mới được khởi tạo từ website.'
        }
      ]
    };

    db.orders.unshift(newOrder);
    this.write(db);
    return newOrder;
  }

  updateOrderStatus(id, newStatus, message) {
    const db = this.read();
    const order = db.orders.find(o => o.id.toUpperCase() === id.toUpperCase());
    if (!order) return null;

    order.status = newStatus;
    if (newStatus === 'completed') {
      order.paymentStatus = 'paid';
    }
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: newStatus,
      time: new Date().toISOString(),
      message: message || `Trạng thái đơn hàng cập nhật: ${newStatus}`
    });

    this.write(db);
    return order;
  }

  // VOUCHERS
  getVoucher(code) {
    const db = this.read();
    if (!code) return null;
    return (db.vouchers || []).find(v => v.code.toUpperCase() === code.trim().toUpperCase() && v.active);
  }

  getAllVouchers() {
    const db = this.read();
    return db.vouchers || [];
  }

  createVoucher(voucher) {
    const db = this.read();
    const existing = db.vouchers.findIndex(v => v.code.toUpperCase() === voucher.code.toUpperCase());
    if (existing >= 0) {
      db.vouchers[existing] = { ...db.vouchers[existing], ...voucher };
    } else {
      db.vouchers.push({ active: true, ...voucher });
    }
    this.write(db);
    return voucher;
  }

  // REVIEWS
  getReviews(productId) {
    const db = this.read();
    if (productId) {
      return (db.reviews || []).filter(r => r.productId === Number(productId));
    }
    return db.reviews || [];
  }

  addReview(review) {
    const db = this.read();
    const newId = (db.reviews || []).length > 0 ? Math.max(...db.reviews.map(r => r.id)) + 1 : 1;
    const newReview = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      verified: true,
      ...review
    };
    if (!db.reviews) db.reviews = [];
    db.reviews.unshift(newReview);
    this.write(db);
    return newReview;
  }

  // METRICS & STATS FOR ADMIN
  getStats() {
    const db = this.read();
    const orders = db.orders || [];
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const shippingOrders = orders.filter(o => o.status === 'shipping').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    // Scent/Category popularity
    const categoryCount = {};
    orders.forEach(o => {
      (o.items || []).forEach(item => {
        const p = (db.products || []).find(prod => prod.id === item.id);
        const cat = p ? p.category : 'Khác';
        categoryCount[cat] = (categoryCount[cat] || 0) + item.qty;
      });
    });

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      shippingOrders,
      completedOrders,
      categoryDistribution: categoryCount,
      recentOrders: orders.slice(0, 5),
      settings: db.settings
    };
  }

  getSettings() {
    const db = this.read();
    return db.settings || {};
  }
}

module.exports = new Database();
