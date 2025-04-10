const db = require("../models");
const Product = db.Product;
const Review = db.Review;

// Ortalama puanı güncelleyen fonksiyon
const updateProductRating = async (productId) => {
  try {
    // Yorumları al
    const reviews = await Review.findAll({ where: { productId } });

    if (reviews.length === 0) {
      return 0; // Eğer hiç yorum yoksa, ortalama puan 0 dönebilir
    }

    // Ortalama puanı hesapla
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Ürünün puanını güncelle
    const product = await Product.findByPk(productId);
    if (product) {
      product.rating = averageRating;
      await product.save();
    }

    return averageRating;
  } catch (error) {
    console.error("Ortalama puan güncellenirken hata oluştu:", error);
    throw error;
  }
};

// Yeni yorum oluştur
// Yeni yorum oluştur
exports.create = async (req, res) => {
  const { user_name, comment, rating, productId } = req.body;

  if (!user_name || !comment || !rating || !productId) {
    return res.status(400).send({ message: "Tüm alanlar zorunludur!" });
  }

  try {
    // Yeni yorumu oluştur
    const review = await Review.create({ user_name, comment, rating, productId });

    // Ürün ortalama puanını güncelle
    await updateProductRating(productId);

    res.status(201).send(review);
  } catch (err) {
    console.error("Yorum oluşturulurken hata:", err);
    res.status(500).send({ message: err.message || "Yorum oluşturulurken bir hata oluştu." });
  }
};


// Belirli bir ürünün yorumlarını getir
exports.findByProduct = async (req, res) => {
  const productId = req.params.productId;

  try {
    const reviews = await Review.findAll({
      where: { productId },
      order: [["createdAt", "DESC"]],
    });
    res.send(reviews);
  } catch (err) {
    res.status(500).send({ message: err.message || "Yorumlar getirilirken bir hata oluştu." });
  }
};
// Backend'deki product.controller.js dosyasına ekleme yapıyoruz

// Ürünün ortalama puanını getiren endpoint
exports.getProductRating = async (req, res) => {
    const productId = req.params.productId;
  
    try {
      const reviews = await Review.findAll({ where: { productId } });
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length ? totalRating / reviews.length : 0;
  
      res.status(200).json({ averageRating });
    } catch (error) {
      console.error("Ortalama puan getirilirken bir hata oluştu:", error);
      res.status(500).send({ message: "Ortalama puan getirilirken bir hata oluştu" });
    }
  };
  
// Belirli bir yorumu getir
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).send({
        message: "Yorum bulunamadı!"
      });
    }

    res.send(review);
  } catch (err) {
    res.status(500).send({
      message: "ID=" + id + " olan yorum getirilirken hata oluştu."
    });
  }
};

// Yorum sil
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await Review.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).send({
        message: "Yorum bulunamadı!"
      });
    }

    res.send({ message: "Yorum başarıyla silindi." });
  } catch (err) {
    res.status(500).send({
      message: "Yorum silinirken bir hata oluştu."
    });
  }
};
// Backend tarafında, products controller'ında rate güncelleme işlemi:
module.exports.updateRating = async (req, res) => {
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
  
// Tüm yorumları sil (isteğe bağlı)
exports.deleteAll = async (req, res) => {
  try {
    const deletedCount = await Review.destroy({ where: {}, truncate: false });
    res.send({ message: `${deletedCount} yorum başarıyla silindi.` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Tüm yorumlar silinirken bir hata oluştu."
    });
  }
};

