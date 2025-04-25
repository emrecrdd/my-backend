const { Sequelize, Op } = require("sequelize");
const db = require("../models");
const Order = db.Order;
const User = db.User;  // User modelini dahil et
const OrderItem = db.OrderItem;
const Product = db.Product;
const { v4: uuidv4 } = require("uuid");

exports.create = async (req, res) => {
  const { userId, items, discountPrice, paymentId } = req.body;

  // Eksik verileri kontrol et
  if (!userId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Eksik sipariş verisi!" });
  }

  const transaction = await db.sequelize.transaction(); // Yeni bir işlem başlat

  try {
    const orderNumber = `ORD-${uuidv4().split("-")[0].toUpperCase()}`;

    let totalPrice = 0;
    const validatedItems = [];

    // Ürünleri kontrol et ve toplam fiyatı hesapla
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (!product) {
        return res.status(400).json({ message: `Ürün bulunamadı: ${item.productId}` });
      }

      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      validatedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Kupon indirimi varsa kontrol et
    if (discountPrice && discountPrice > totalPrice) {
      return res.status(400).json({ message: "İndirim toplam tutardan fazla olamaz!" });
    }

    // Siparişi oluştur
    const newOrder = await Order.create(
      {
        orderNumber,
        userId,
        totalPrice,
        discountPrice: discountPrice || null,
        status: "pending", // Başlangıç durumu
        paymentId,
        OrderItems: validatedItems
      },
      {
        include: [OrderItem],
        transaction // Transaction'ı dahil et
      }
    );

    // Sipariş sonrası stok güncelle
    for (const item of validatedItems) {
      await Product.decrement("stock", {
        by: item.quantity,
        where: { id: item.productId },
        transaction // Transaction'ı dahil et
      });
    }

    // Eğer tüm işlemler başarılıysa transaction'ı commit et
    await transaction.commit();

    res.status(201).json({
      message: "Sipariş başarıyla oluşturuldu",
      order: newOrder
    });
  } catch (error) {
    // Bir hata oluşursa işlemi geri al
    await transaction.rollback();
    console.error("Sipariş oluşturma hatası:", error.message);
    res.status(500).json({ message: "Sipariş kaydedilirken hata oluştu." });
  }
};


exports.findAll = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [Product] // Ürün detaylarını dahil et
        },
        {
          model: User,
          attributes: ["id", "username", "email"]
        }
      ],
      order: [["createdAt", "DESC"]] // Siparişleri tarihe göre sırala
    });

    res.json(orders);
  } catch (error) {
    console.error("Siparişler çekilemedi:", error.message);
    res.status(500).json({ message: "Siparişler getirilirken hata oluştu." });
  }
};

exports.findOne = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        {
          model: User,
          attributes: ["id", "username", "email"]
        }
      ]
    });

    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı." });
    res.json(order);
  } catch (error) {
    console.error("Sipariş detay hatası:", error.message);
    res.status(500).json({ message: "Sipariş detayları alınamadı." });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Geçerli durumları kontrol et
  const validStatuses = ["pending", "paid", "shipped", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Geçersiz sipariş durumu!" });
  }

  try {
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı." });

    // Durumu güncelle
    order.status = status;
    await order.save();

    res.json({
      message: "Sipariş durumu güncellendi",
      order: {
        orderNumber: order.orderNumber,
        status: order.status
      }
    });
  } catch (error) {
    console.error("Sipariş güncelleme hatası:", error.message);
    res.status(500).json({ message: "Sipariş durumu güncellenemedi." });
  }
};
