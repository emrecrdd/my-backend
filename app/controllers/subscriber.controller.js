const nodemailer = require("nodemailer");
const db = require("../models");
require('dotenv').config();
const Subscriber = db.Subscriber;
const axios = require("axios");
require("dotenv").config();
// Nodemailer ayarları
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,  // Çevre değişkeni ile kullanıcı
    pass: process.env.EMAIL_PASS,  // Çevre değişkeni ile şifre
  },
  tls: {
    rejectUnauthorized: false,  // SSL/TLS hata olasılıklarını engeller
  },
});

// Geçerli e-posta formatı kontrolü
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Tüm aboneleri getirme
exports.findAll = async (req, res) => {
    try {
        const subscribers = await Subscriber.findAll();
        res.json(subscribers);
    } catch (error) {
        console.error("Aboneleri alırken hata:", error);
        res.status(500).json({ message: "Aboneler alınırken hata oluştu." });
    }
};

// Abone silme

exports.delete = async (req, res) => {
    const { email } = req.params;
    try {
        const deletedRows = await Subscriber.destroy({ where: { email } });

        if (deletedRows === 0) {
            return res.status(404).json({ message: "Abone bulunamadı." });
        }

        // İstatistikleri güncelleme için API çağrısı yapıyoruz
        try {
            await axios.post("http://localhost:3000/api/statistics/update-after-delete");
            console.log("İstatistikler güncellendi.");
        } catch (statError) {
            console.error("İstatistik güncellenemedi:", statError);
            return res.status(500).json({ message: "İstatistik güncellenirken bir hata oluştu." });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Abone silinirken hata:", error);
        res.status(500).json({ message: "Abone silinirken hata oluştu." });
    }
};

exports.create = async (req, res) => {
    const { email } = req.body;

    // E-posta adresi kontrolü
    if (!email) {
        return res.status(400).json({ message: "E-posta adresi gerekli." });
    }

    // E-posta formatı kontrolü
    if (!validateEmail(email)) {
        return res.status(400).json({ message: "Geçersiz e-posta adresi." });
    }

    try {
        // Email zaten kayıtlı mı kontrol et
        const existingSubscriber = await Subscriber.findOne({ where: { email } });

        if (existingSubscriber) {
            return res.status(400).json({ message: "Bu e-posta zaten kayıtlı." });
        }

        // Abone kaydını veritabanına ekle
        await Subscriber.create({ email });

        // İstatistik işlemleri
        try {
            const subscriberStatResponse = await axios.post("http://localhost:3000/api/statistics/subscribers");
            console.log("Abonelik istatistiği güncellendi:", subscriberStatResponse.data);
        } catch (statError) {
            console.error("Abonelik istatistiği güncellenemedi:", statError);
            return res.status(500).json({ message: "İstatistik güncelleme hatası." });
        }

        try {
            const emailSentStatResponse = await axios.post("http://localhost:3000/api/statistics/email-sent");
            console.log("E-posta gönderim istatistiği güncellendi:", emailSentStatResponse.data);
        } catch (statError) {
            console.error("E-posta gönderim istatistiği güncellenemedi:", statError);
            return res.status(500).json({ message: "E-posta gönderim istatistiği güncellenemedi." });
        }

        // E-posta gönderim işlemi
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'CRD Soft Bülteni Aboneliği',
            text: 'CRD Soft bültenine abone olduğunuz için teşekkür ederiz!',
            html: `<h3>CRD Soft bültenine abone olduğunuz için teşekkür ederiz!</h3>
                  <p>Yazılım geliştirme ve teknoloji haberleri için bizimle kalın.</p>
           <img src="http://localhost:3000/api/statistics/email-opened" alt="" width="1" height="1" />`, // E-posta açıldığında tetiklenecek
        };

        try {
            // E-posta gönderimi
            await transporter.sendMail(mailOptions);
            console.log("E-posta gönderildi başarıyla.");
        } catch (emailError) {
            // E-posta gönderim hatası
            console.error("E-posta gönderim hatası:", emailError);
            return res.status(500).json({ message: "E-posta gönderim hatası." });
        }

        // Başarıyla abonelik
        res.status(201).json({ message: "Başarıyla abone oldunuz! Hoş geldiniz!" });

    } catch (error) {
        console.error("Abonelik işlemi sırasında hata:", error);
        res.status(500).json({ message: `Abonelik işlemi sırasında bir hata oluştu: ${error.message}` });
    }
};
