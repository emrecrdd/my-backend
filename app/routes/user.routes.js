module.exports = app => {
    const users = require("../controllers/user.controller.js");
  
    var router = require("express").Router();
  
    // Kullanıcı kaydı (Register)
    router.post("/register", users.create);
   
    // Kullanıcı girişi (Login)
    router.post("/login", users.login); 
    router.post("/forgot-password", users.forgotPassword);

// Yeni şifre kaydetme (şifre sıfırlama linkinden sonra)
// Yeni şifre kaydetme (şifre sıfırlama linkinden sonra)
router.post("/reset-password/:token", users.resetPassword);
   // Kullanıcı Profili Alma (GET /api/users/:id)
    router.get("/:id", users.getUserProfile);
     // Kullanıcı Bilgilerini Güncelleme (PUT /api/users/:id)
     router.put("/:id", users.updateUserProfile);
     // Kullanıcılar Listesi
    router.get("/", users.getUsers);
// Şifremi unuttum (şifre sıfırlama isteği)




    // /api/users yoluna yönlendir
    app.use("/api/users", router);
  };
  
