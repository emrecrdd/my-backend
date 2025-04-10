const db = require("../models");
const Op = db.Sequelize.Op;
const Coupon = db.Coupon;
const Subscriber = db.Subscriber;
const nodemailer = require("nodemailer");
require("dotenv").config();

// Nodemailer ayarları
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
// Kupon kodunu doğrulama
// Kupon kodunu doğrulama
exports.findByCode = async (req, res) => {
    const { code } = req.query;
  
    try {
      // Kuponu veritabanında arıyoruz
      const coupon = await Coupon.findOne({
        where: { code, used: false }, // Kupon kullanılmamış olmalı
      });
  
      if (!coupon) {
        return res.status(404).send({ message: "Geçersiz kupon kodu!" });
      }
  
      res.send({
        discountPercent: coupon.discountPercent,
      });
    } catch (err) {
      console.error("Kupon doğrulama hatası:", err);  // Hata mesajını logluyoruz
      res.status(500).send({
        message: "Kupon kodu doğrulama hatası.",
      });
    }
  };
  
  
// Yeni bir kupon oluştur
// Yeni bir kupon oluştur
exports.create = async (req, res) => {
    const { code, discountPercent, subscriberId } = req.body;
  
    if (!code || !discountPercent || !subscriberId) {
      return res.status(400).send({
        message: "Code, discountPercent ve subscriberId boş olamaz!",
      });
    }
  
    try {
      // Kuponu veritabanına kaydet
      const newCoupon = await Coupon.create({ code, discountPercent, subscriberId });
  
      // İlgili abonenin e-posta adresini getir
      const subscriber = await Subscriber.findByPk(subscriberId);
      if (!subscriber) {
        return res.status(404).send({ message: "Abone bulunamadı!" });
      }
  
      // HTML E-posta şablonu (gömülü)
      const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #4CAF50;">🎁 Size Özel İndirim Kuponu!</h2>
            <p>Merhaba, size özel bir indirim kuponu kazandınız!</p>
            <p><strong>Kupon Kodu:</strong> <span style="color: #2196F3;">${code}</span></p>
            <p><strong>İndirim:</strong> %${discountPercent}</p>
            <a href="https://yourwebsite.com" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#4CAF50; color:white; text-decoration:none; border-radius:5px;">Şimdi Kullan</a>
          </div>
        </div>
      `;
  
      // Aboneye e-posta gönder
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: subscriber.email,
        subject: `Size özel bir indirim kuponu! 🎁`,
        text: `Merhaba, size özel bir indirim kuponu kazandınız!\n\nKupon Kodu: ${code}\nİndirim: %${discountPercent}`,
        html: htmlTemplate,
      };
  
      await transporter.sendMail(mailOptions);
      console.log(`Kupon bildirimi gönderildi: ${subscriber.email}`);
  
      // Kuponun ve e-posta gönderiminin başarılı olduğuna dair yanıtı gönder
      res.status(201).send({
        message: `Kupon başarıyla oluşturuldu ve e-posta gönderildi!`,
        coupon: newCoupon,
        email: subscriber.email,
      });
  
    } catch (err) {
      console.error("Kupon oluşturma hatası:", err);
      res.status(500).send({
        message: err.message || "Kupon oluşturulurken bir hata oluştu.",
      });
    }
  };
  
      
    
  
// Tüm kuponları getir
exports.findAll = async (req, res) => {
  try {
    const coupons = await Coupon.findAll();
    res.send(coupons);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Kuponlar getirilirken bir hata oluştu."
    });
  }
};

// Belirtilen id'ye sahip kuponu getir
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).send({ message: "Kupon bulunamadı!" });
    }
    res.send(coupon);
  } catch (err) {
    res.status(500).send({
      message: `ID=${id} olan kupon getirilirken hata oluştu.`
    });
  }
};

// Belirtilen id'ye sahip kuponu güncelle
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const [updated] = await Coupon.update(req.body, {
      where: { id }
    });

    if (updated) {
      res.send({ message: "Kupon başarıyla güncellendi." });
    } else {
      res.send({
        message: `ID=${id} olan kupon güncellenemedi. Belki bulunamadı veya gönderilen veri boş olabilir!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `ID=${id} olan kupon güncellenirken hata oluştu.`
    });
  }
};

// Belirtilen id'ye sahip kuponu sil
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await Coupon.destroy({
      where: { id }
    });

    if (deleted) {
      res.send({ message: "Kupon başarıyla silindi!" });
    } else {
      res.send({
        message: `ID=${id} olan kupon silinemedi. Belki bulunamadı!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `ID=${id} olan kupon silinemedi.`
    });
  }
};