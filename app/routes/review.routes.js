module.exports = app => {
    const reviews = require("../controllers/review.controller.js");
    const products = require("../controllers/product.controller.js");
  
    var router = require("express").Router();
   
    // Yeni yorum ekle
    router.post("/", reviews.create);
  
    // Belirli bir ürünün yorumlarını getir
    router.get("/product/:productId", reviews.findByProduct);
  
    // Belirli bir yorumu getir
    router.get("/:id", reviews.findOne);
  // Ürün ortalama puanını getir
  router.get("/:productId/rating", products.getProductRating);
    // Yorumu sil
    router.delete("/:id", reviews.delete);
  
    // Tüm yorumları sil (isteğe bağlı)
    router.delete("/", reviews.deleteAll);
    
  
    app.use("/api/reviews", router);
  };
  