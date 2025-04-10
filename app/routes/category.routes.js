  module.exports = app => {
      const categories = require("../controllers/category.controller.js");
    
      var router = require("express").Router();
    
      // Yeni bir kategori oluştur
      router.post("/", categories.create);
    
      // Tüm kategorileri getir
      router.get("/", categories.findAll);
    
      // Belirtilen ID'ye sahip kategoriyi getir
      router.get("/:id", categories.findOne);
    
      // Belirtilen ID'ye sahip kategoriyi güncelle
      router.put("/:id", categories.update);
    
      // Belirtilen ID'ye sahip kategoriyi sil
      router.delete("/:id", categories.delete);
    
      // Tüm kategorileri sil
      router.delete("/", categories.deleteAll);
    
      // /api/categories yoluna yönlendir
      app.use("/api/categories", router);
    };
    