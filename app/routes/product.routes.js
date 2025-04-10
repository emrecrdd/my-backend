module.exports = app => {
  const products = require("../controllers/product.controller.js");  // Importing the product controller
  
  var router = require("express").Router();

  // Yeni bir Ürün oluştur
  router.post("/", products.create);
  router.get("/:productId/rating", products.getProductRating);  // Buradaki fonksiyon
  
  // Ürün puanını güncelleme endpoint'i ekleyin
router.put("/:id/rate", products.updateRating);

  // Tüm Ürün'leri getir
  router.get("/", products.findAll);

  // Belirtilen ID'ye sahip Ürün'ü getir
  router.get("/:id", products.findOne);

  // Belirtilen ID'ye sahip Ürün'ü güncelle
  router.put("/:id", products.update);

  // Belirtilen ID'ye sahip Ürün'ü sil
  router.delete("/:id", products.delete);

  // Tüm Ürün'leri sil
  router.delete("/", products.deleteAll);

  // API rotası '/api/products' olarak ayarlanacak
  app.use("/api/products", router);
};
