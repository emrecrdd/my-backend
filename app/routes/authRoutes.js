const express = require("express");
const router = express.Router();
const { forgotPassword, resetPassword } = require("../controllers/authController");

// Şifre sıfırlama işlemleri için route'lar
router.post("/forgot-password", forgotPassword);  // Şifre sıfırlama isteği
router.post("/reset-password/:token", resetPassword);  // Şifre sıfırlama (token ile)

module.exports = (app) => {
  app.use("/api/auth", router);  // Rotaları /api/auth altında tanımlıyoruz
};
