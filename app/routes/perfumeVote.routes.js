module.exports = (app) => {
    const votes = require("../controllers/vote.controller.js");
    const router = require("express").Router();
  
    router.post("/", votes.create); // Oy ekle
    router.get("/", votes.findAll); // Oyları listele
  
    app.use("/api/votes", router);
  };
  