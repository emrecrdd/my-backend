const { User, Auth } = require("../models");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// Şifre sıfırlama isteği (mail gönderme)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Kullanıcıyı email ile sorgula
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Token üret
    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 3600000; // 1 saat geçerli

    // Auth tablosuna token ekle
    await Auth.create({
      token,
      email,
      expires: new Date(expires),
    });

    // Şifre sıfırlama linki
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Mail gönder
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Şifre Sıfırlama",
      html: `<p>Şifrenizi sıfırlamak için <a href="${resetLink}">buraya tıklayın</a>.</p>`,
    });

    res.status(200).json({ message: "Şifre sıfırlama bağlantısı e-postayla gönderildi." });
  } catch (err) {
    console.error("Hata:", err);
    res.status(500).json({ error: "Sunucu hatası." });
  }
};

// Şifre sıfırlama (yeni şifre belirleme)
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Token'ı bul
    const resetToken = await Auth.findOne({ where: { token } });

    if (!resetToken) {
      return res.status(400).json({ error: "Geçersiz veya süresi dolmuş token." });
    }

    // Token'ın süresi dolmuş mu?
    if (resetToken.expires < Date.now()) {
      return res.status(400).json({ error: "Geçersiz veya süresi dolmuş token." });
    }

    // Şifreyi güvenli bir şekilde hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı token'dan email ile bul
    const user = await User.findOne({ where: { email: resetToken.email } });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Yeni şifreyi kaydet
    user.password = hashedPassword;
    await user.save();

    // Token kullanıldı, veritabanından sil
    await resetToken.destroy();

    res.status(200).json({ message: "Şifre başarıyla güncellendi." });
  } catch (err) {
    console.error("Hata:", err);
    res.status(500).json({ error: "Sunucu hatası." });
  }
};
