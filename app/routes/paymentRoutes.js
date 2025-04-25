module.exports = app => {
    const payment = require("../controllers/paymentController");
    const router = require("express").Router();
    router.post("/test", payment.testPayment);
    app.use("/api/payments", router);
  };
  
