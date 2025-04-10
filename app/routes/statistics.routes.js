module.exports = (app) => {
    const statistics = require("../controllers/statistics.controller.js");
  
    const router = require("express").Router();
  
    // Abone olma istatistiklerini güncelle
    router.post("/subscribers", statistics.subscribe);
  
    // E-posta gönderim istatistiklerini güncelle
    router.post("/email-sent", statistics.emailSent);
  
    // E-posta açılma istatistiklerini güncelle
    router.post("/email-opened", statistics.emailOpened);
    router.post('/update-after-delete', statistics.updateAfterDelete);

  
    // İstatistikleri al
    router.get("/", statistics.getStatistics);
  
    app.use("/api/statistics", router);
  };
  