const db = require("../models");
const Vote = db.Vote;
const { Op } = require("sequelize");

// Yeni bir oy ekle
exports.create = async (req, res) => {
    const { perfumeId } = req.body;
    const ipAddress = req.ip;

    if (!perfumeId) {
        return res.status(400).json({ message: "Parfüm ID gerekli!" });
    }

    try {
        // Aynı IP adresiyle tekrar oy verilmesini engelle
        const existingVote = await Vote.findOne({ where: { perfumeId, ipAddress } });

        if (existingVote) {
            return res.status(400).json({ message: "Bu parfüme zaten oy verdiniz!" });
        }

        // Yeni oyu kaydet
        const vote = await Vote.create({ perfumeId, ipAddress });

        res.status(201).json(vote);
    } catch (error) {
        console.error("Oylama işlemi sırasında hata:", error);
        res.status(500).json({ message: "Oy kaydedilirken hata oluştu." });
    }
};

// Tüm parfümler için oy sayılarını getir
exports.findAll = async (req, res) => {
  try {
      console.log("Oylar çekilmeye çalışılıyor...");

      const votes = await Vote.findAll({
          attributes: [
              "perfumeId",
              [db.Sequelize.fn("COUNT", db.Sequelize.col("id")), "voteCount"] // Bu satırda "COUNT" fonksiyonunu kullanıyoruz
          ],
          group: ["perfumeId"],
          order: [[db.Sequelize.fn("COUNT", db.Sequelize.col("id")), "DESC"]] // Burada da aynı şekilde sıralama yapıyoruz
      });

      console.log("Oylar başarıyla çekildi:", votes);
      res.json(votes);
  } catch (error) {
      console.error("Oyları çekerken hata oluştu:", error);
      res.status(500).json({
          message: "Oylar getirilirken hata oluştu.",
          error: error.message,
          stack: error.stack
      });
  }
};
