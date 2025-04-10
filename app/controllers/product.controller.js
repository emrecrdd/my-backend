const db = require("../models");
const Product = db.Product;  // Ürün modeli
const Category = db.Category;  // Kategori modeli
const Subscriber = db.Subscriber;  // Abone modeli
const Review = db.Review;
const nodemailer = require("nodemailer");
const { Op } = db.Sequelize;

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

// Yeni bir Ürün oluştur
exports.create = async (req, res) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).send({
      message: "Ürün adı ve fiyatı zorunludur!",
    });
  }

  const product = {
    name: req.body.name,
    brand: req.body.brand,
    price: req.body.price,
    stock: req.body.stock,
    description: req.body.description || "",
    rating: req.body.rating || 0,
    categoryId: req.body.categoryId,
    images: req.body.images || [],  // resimlerin geldiği alan
  };

  try {
    // Yeni ürünü oluştur ve veritabanına ekle
    const newProduct = await Product.create(product);

    // Tüm abonelere e-posta gönder
    const subscribers = await Subscriber.findAll();
    if (subscribers.length > 0) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        subject: `Yeni Ürün Yayınlandı: ${newProduct.name}`,
        text: `Merhaba, yeni ürünümüz yayında: ${newProduct.name}\n\n${newProduct.description}\n\nDetaylar için tıklayın: http://localhost:3000/product/${newProduct.id}`,
        html: `<h3>Yeni Ürün Yayınlandı: ${newProduct.name}</h3>
               <p>${newProduct.description}</p>
               <a href="https://yourwebsite.com/product/${newProduct.id}">Detayları Görüntüle</a>`,
      };

      const sendEmailToSubscribers = async (subscribers, mailOptions) => {
        for (const subscriber of subscribers) {
          try {
            await transporter.sendMail({ ...mailOptions, to: subscriber.email });
            console.log(`E-posta başarıyla gönderildi: ${subscriber.email}`);
          } catch (err) {
            console.error(`E-posta gönderim hatası (${subscriber.email}):`, err);
          }
        }
      };

      await sendEmailToSubscribers(subscribers, mailOptions);
    }

    // Yeni ürünü başarılı bir şekilde oluşturduktan sonra döndür
    res.status(201).send(newProduct);
  } catch (error) {
    console.error("Ürün oluşturulurken hata:", error);
    res.status(500).send({
      message: error.message || "Ürün oluşturulurken bir hata oluştu.",
    });
  }
};
// Ürün puanını güncelleme
// Ürün puanını güncelleme
exports.updateRating = async (req, res) => {
  const { id } = req.params; // Ürün ID'si
  const { rating } = req.body; // Yeni rating değeri

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).send({ message: "Ürün bulunamadı" });
    }

    // Ürünün rating değerini güncelle
    product.rating = rating;

    await product.save(); // Değişiklikleri kaydet
    res.status(200).json(product); // Güncellenmiş ürünü döndür
  } catch (error) {
    console.error("Puan güncellenirken bir hata oluştu:", error);
    res.status(500).send({ message: "Puan güncellenirken bir hata oluştu" });
  }
};


// Tüm ürünleri getir
exports.findAll = (req, res) => {
  const condition = req.query.categoryId
    ? { categoryId: { [Op.eq]: req.query.categoryId } }
    : {};

  Product.findAll({
    where: condition,
    include: [{ model: Category, as: "category" }, { model: Review, as: "reviews" }],
  })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Ürünleri getirirken bir hata oluştu.",
      });
    });
};

// Belirtilen ID'ye sahip ürünü getir
exports.findOne = (req, res) => {
  const id = req.params.id;

  Product.findByPk(id, {
    include: [{ model: Category, as: "category" }, { model: Review, as: "reviews" }],
  })
    .then((data) => {
      if (!data) {
        return res.status(404).send({
          message: `ID=${id} olan Ürün bulunamadı!`,
        });
      }
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "ID=" + id + " olan Ürün getirilirken hata oluştu.",
      });
    });
};

// Ürün güncelleme
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    // Ürünü bul
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).send({
        message: `ID=${id} ile ilişkili ürün bulunamadı!`,
      });
    }

    // Güncellenmiş veriler
    const updatedProduct = {
      name: req.body.name,
      brand: req.body.brand,
      price: req.body.price,
      stock: req.body.stock,
      description: req.body.description || "",
      rating: req.body.rating || 0,
      categoryId: req.body.categoryId,
      images: req.body.images || product.images,  // Eski resimler yerine yeni resimler
    };

    // Veritabanında güncelle
    const [updatedCount] = await Product.update(updatedProduct, {
      where: { id: id },
    });

    if (updatedCount === 0) {
      return res.send({
        message: `ID=${id} olan Ürün zaten güncellenmiş veya değişiklik yapılmadı.`,
      });
    }

    res.send({ message: "Ürün başarıyla güncellendi." });
  } catch (err) {
    res.status(500).send({
      message: `ID=${id} olan Ürün güncellenirken hata oluştu: ${err.message}`,
    });
  }
};
// Ürünün ortalama puanını güncelleme


// Ürünün ortalama puanını getiren fonksiyon
exports.getProductRating = async (req, res) => {
  const productId = req.params.productId;

  try {
    const reviews = await Review.findAll({ where: { productId } });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length ? totalRating / reviews.length : 0;

    res.status(200).json({ productId, averageRating });
  } catch (error) {
    console.error("Puan alınırken bir hata oluştu:", error);
    res.status(500).send({ message: "Puan alınırken bir hata oluştu." });
  }
};

// Diğer fonksiyonlar (create, findAll, findOne, etc.)

// Ürün silme
exports.delete = (req, res) => {
  const id = req.params.id;

  Product.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "Ürün başarıyla silindi!",
        });
      } else {
        res.send({
          message: `ID=${id} olan Ürün silinemedi. Belki bulunamadı!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "ID=" + id + " olan Ürün silinemedi.",
      });
    });
};

// Tüm ürünleri silme
exports.deleteAll = (req, res) => {
  Product.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({ message: `${nums} adet Ürün başarıyla silindi!` });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Tüm Ürün'leri silerken bir hata oluştu.",
      });
    });
};
