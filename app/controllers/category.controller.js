const db = require("../models");
const Category = db.Category;  // Doğru model adıyla çağırıyoruz
const Op = db.Sequelize.Op;

// Yeni bir kategori oluştur
exports.create = (req, res) => {
  if (!req.body.name) {
    return res.status(400).send({
      message: "Kategori adı boş olamaz!"
    });
  }

  // Yeni bir kategori oluştur
  const category = {
    name: req.body.name,
    img: req.body.img
  };

  // Kategoriyi veritabanına kaydet
  Category.create(category)
    .then(data => {
      res.status(201).send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Kategori oluşturulurken bir hata oluştu."
      });
    });
};

// Tüm kategorileri getir
exports.findAll = (req, res) => {
  Category.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Kategoriler getirilirken bir hata oluştu."
      });
    });
};

// Belirtilen id'ye sahip kategoriyi getir
exports.findOne = (req, res) => {
  const id = req.params.id;

  Category.findByPk(id)
    .then(data => {
      if (!data) {
        return res.status(404).send({
          message: "Kategori bulunamadı!"
        });
      }
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "ID=" + id + " olan kategori getirilirken hata oluştu."
      });
    });
};

// Belirtilen id'ye sahip kategoriyi güncellea
exports.update = (req, res) => {
  const id = req.params.id;

  Category.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Kategori başarıyla güncellendi."
        });
      } else {
        res.send({
          message: `ID=${id} olan kategori güncellenemedi. Belki bulunamadı veya gönderilen veri boş olabilir!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "ID=" + id + " olan kategori güncellenirken hata oluştu."
      });
    });
};

// Belirtilen id'ye sahip kategoriyi sil
exports.delete = (req, res) => {
  const id = req.params.id;

  Category.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Kategori başarıyla silindi!"
        });
      } else {
        res.send({
          message: `ID=${id} olan kategori silinemedi. Belki bulunamadı!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "ID=" + id + " olan kategori silinemedi."
      });
    });
};

// Tüm kategorileri veritabanından sil
exports.deleteAll = (req, res) => {
  Category.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} adet kategori başarıyla silindi!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Tüm kategoriler silinirken bir hata oluştu."
      });
    });
};
