module.exports = (app) => {
    const subscribers = require("../controllers/subscriber.controller.js");
    const router = require("express").Router();

    // Yeni bir abone ekleme
    router.post("/", subscribers.create);

    // Tüm aboneleri getirme
    router.get("/", subscribers.findAll);

    // Belirli bir e-posta adresine sahip aboneyi silme
   router.post("/delete", subscribers.delete);  // Artık POST metoduyla çalışacak


    // /api/subscribers yoluna yönlendir
    app.use("/api/subscribers", router);
};
