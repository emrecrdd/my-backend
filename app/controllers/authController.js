const { User, Auth } = require("../models"); // Auth modelini de dahil ettik
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// Şifre sıfırlama isteği (mail gönderme)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 3600000; // 1 saat geçerli

    // Yeni Auth kaydını oluşturuyoruz
    await Auth.create({
      token,
      email,
      expires: new Date(expires),
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

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
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası." });
  }
};

// Şifre sıfırlama (yeni şifre belirleme)
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const resetToken = await Auth.findOne({ where: { token } });

  if (!resetToken) {
    return res.status(400).json({ error: "Geçersiz veya süresi dolmuş token." });
  }

  // Token'ın süresi dolmuş mu?
  if (resetToken.expires < Date.now()) {
    return res.status(400).json({ error: "Geçersiz veya süresi dolmuş token." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOne({ where: { email: resetToken.email } });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    user.password = hashedPassword;
    await user.save();

    // Token bir kez kullanıldığında, onu veritabanından sil
    await resetToken.destroy();

    res.status(200).json({ message: "Şifre başarıyla güncellendi." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası." });
  }
};
