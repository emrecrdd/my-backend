module.exports = (app) => {
    const orderController = require("../controllers/orderController");
    const router = require("express").Router();

 // 📦 Sipariş oluştur (kullanıcı)
router.post("/", orderController.create);

// 📋 Tüm siparişleri getir (admin)
router.get("/", orderController.findAll);

// 🔍 Tek bir siparişi getir
router.get("/:id", orderController.findOne);

// 🔁 Sipariş durumunu güncelle (admin veya ödeme sonrası)
router.patch("/:id/status", orderController.updateStatus);


    app.use("/api/orders", router);
};
