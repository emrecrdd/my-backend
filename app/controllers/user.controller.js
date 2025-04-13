const db = require("../models");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = db.User;
const bcrypt = require("bcryptjs");

const resetTokens = {}; // Geçici token belleği (1 saat süreli)

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
    resetTokens[token] = { email, expires };

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

  const resetInfo = resetTokens[token];
  if (!resetInfo || resetInfo.expires < Date.now()) {
    return res.status(400).json({ error: "Geçersiz veya süresi dolmuş token." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findOne({ where: { email: resetInfo.email } });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    user.password = hashedPassword;
    await user.save();

    // Token bir kez kullanılabilir olsun
    delete resetTokens[token];

    res.status(200).json({ message: "Şifre başarıyla güncellendi." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası." });
  }
};
// Kullanıcı Oluşturma (Create - Register)
exports.create = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const defaultAvatar = generateRandomAvatar();

    // Email kontrolü, var mı diye bakıyoruz
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered." });
    }

    // Şifreyi güvenli bir şekilde hash'liyoruz
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcıyı oluşturuyoruz
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      avatar: defaultAvatar,
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error." });
  }
};

// Kullanıcı girişi (Login)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı email'e göre buluyoruz
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Şifreyi kontrol ediyoruz
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Başarılı girişte kullanıcı bilgilerini döndürüyoruz
    res.status(200).json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error." });
  }
};
// Kullanıcı Profili Getirme (GET /api/users/:id)
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;  // URL'den id alıyoruz

    // Kullanıcıyı ID'ye göre buluyoruz
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Kullanıcı bilgilerini döndürüyoruz
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error." });
  }
};
// Kullanıcı Bilgilerini Güncelleme (PUT /api/users/:id)
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Eğer yeni bir şifre gelirse, hash'leyerek güncelle
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // Yeni username veya email geldiyse güncelle
    user.username = username || user.username;
    user.email = email || user.email;

    // Güncellemeyi kaydet
    await user.save();

    res.status(200).json({
      message: "Bilgiler başarıyla güncellendi.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};
// Kullanıcıları Listeleme (GET /api/users)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();  // Tüm kullanıcıları getir
    res.status(200).json(users);  // Kullanıcıları JSON formatında döndür
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};


// Random avatar generator
const generateRandomAvatar = () => {
  const randomAvatar = Math.floor(Math.random() * 71);
  return `https://i.pravatar.cc/300?img=${randomAvatar}`;
};
