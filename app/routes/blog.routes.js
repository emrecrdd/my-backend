module.exports = app => {
    const blogs = require("../controllers/blog.controller.js");
  
    var router = require("express").Router();
  
    // Yeni bir Blog oluştur
    router.post("/", blogs.create);
  
    // Tüm Blog'ları getir
    router.get("/", blogs.findAll);
  
    // Belirtilen ID'ye sahip Blog'u getir
    router.get("/:id", blogs.findOne);
  
    // Belirtilen ID'ye sahip Blog'u güncelle
    router.put("/:id", blogs.update);
  
    // Belirtilen ID'ye sahip Blog'u sil
    router.delete("/:id", blogs.delete);
  
    // Tüm Blog'ları sil
    router.delete("/", blogs.deleteAll);
  
    app.use("/api/blogs", router);
  };
  