const nodemailer = require("nodemailer");
const db = require("../models");
const Subscriber = db.Subscriber;
const Blog = db.Blog;
const Op = db.Sequelize.Op;
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

exports.create = async (req, res) => {
  if (!req.body.name || !req.body.description || !req.body.content) {
    return res.status(400).send({
      message: "Başlık ve açıklama zorunludur!"
    });
  }

  const blog = {
    name: req.body.name,
    description: req.body.description,
    author: req.body.author || "Unknown",
    img: req.body.img || "default_image.jpg",
    publishedDate: req.body.publishedDate,
    content:req.body.content,
  };

  try {
    const newBlog = await Blog.create(blog);

    const subscribers = await Subscriber.findAll();

    if (subscribers.length > 0) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        subject: `Yeni Blog Yayınlandı: ${newBlog.name}`,
        text: `Merhaba, yeni blog yazımız yayında: ${newBlog.name}\n\n${newBlog.description}\n\nDetaylar için tıklayın: http://localhost:3000/blog/${newBlog.id}`,
        html: `<h3>Yeni Blog Yayınlandı: ${newBlog.name}</h3>
               <p>${newBlog.description}</p>
               <a href="https://aliardagul-av-tr.netlify.app">Detayları Görüntüle</a>`,
      };

      subscribers.forEach(subscriber => {
        transporter.sendMail({ ...mailOptions, to: subscriber.email }, (err, info) => {
          if (err) {
            console.error(`E-posta gönderim hatası (${subscriber.email}):`, err);
          } else {
            console.log(`E-posta başarıyla gönderildi: ${subscriber.email}`);
          }
        });
      });
    }

    res.status(201).send(newBlog);
  } catch (error) {
    console.error("Blog oluşturulurken hata:", error);
    res.status(500).send({
      message: error.message || "Blog oluşturulurken bir hata oluştu."
    });
  }
};

exports.findAll = (req, res) => {
  const title = req.query.title;
  const condition = title ? { title: { [Op.iLike]: `%${title}%` } } : null;

  Blog.findAll({ where: condition })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Blog'ları getirirken bir hata oluştu."
      });
    });
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  Blog.findByPk(id)
    .then(data => {
      if (!data) {
        return res.status(404).send({
          message: `ID=${id} olan Blog bulunamadı!`
        });
      }
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "ID=" + id + " olan Blog getirilirken hata oluştu."
      });
    });
};

exports.update = (req, res) => {
  const id = req.params.id;

  Blog.update(
    {
      name: req.body.name,
      description: req.body.description,
      author: req.body.author || "Unknown",
      img: req.body.img || "default_image.jpg",
      publishedDate: req.body.publishedDate,
      content:req.body.content,
    },
    { where: { id: id } }
  )
    .then(num => {
      if (num == 1) {
        res.send({ message: "Blog başarıyla güncellendi." });
      } else {
        res.send({
          message: `ID=${id} olan Blog güncellenemedi. Belki bulunamadı veya veri boş olabilir!`,
        });
      }
    })
    .catch(err => {
      console.error("Blog güncelleme hatası:", err); // Hata loglarını yazdırma
      res.status(500).send({
        message: "ID=" + id + " olan Blog güncellenirken hata oluştu.",
      });
    });
    
};

exports.delete = (req, res) => {
  const id = req.params.id;

  Blog.destroy({ where: { id: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Blog başarıyla silindi!" });
      } else {
        res.send({ message: `ID=${id} olan Blog silinemedi. Belki bulunamadı!` });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "ID=" + id + " olan Blog silinemedi." });
    });
};

exports.deleteAll = (req, res) => {
  Blog.destroy({ where: {}, truncate: false })
    .then(nums => {
      res.send({ message: `${nums} adet Blog başarıyla silindi!` });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Tüm Blog'ları silerken bir hata oluştu."
      });
    });
};
