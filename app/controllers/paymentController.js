const Iyzipay = require("iyzipay");

const iyzipay = new Iyzipay({
  apiKey: "sandbox-22XQJNhsSuUjxh3QZ5dCEdLpLgE3zPP1",
  secretKey: "sandbox-pMQnVzDfic8V585kydBAuSLuhg2SWxWw",
  uri: "https://sandbox-api.iyzipay.com"
});

exports.testPayment = (req, res) => {
  try {
    if (!req.body.price || !req.body.paidPrice) {
      return res.status(400).json({
        error: "Ödeme işlemi başarısız oldu",
        message: "Fiyat bilgileri eksik"
      });
    }

    if (!req.body.paymentCard || !req.body.paymentCard.cardNumber) {
      return res.status(400).json({
        error: "Ödeme işlemi başarısız oldu",
        message: "Kart bilgileri eksik"
      });
    }

    const request = {
      locale: req.body.locale || "tr",
      conversationId: req.body.conversationId || "123456789",
      price: req.body.price,
      paidPrice: req.body.paidPrice,
      currency: req.body.currency || "TRY",
      installment: req.body.installment || "1",
      basketId: req.body.basketId || "B67832",
      paymentChannel: req.body.paymentChannel || "WEB",
      paymentGroup: req.body.paymentGroup || "PRODUCT",
      paymentCard: {
        cardHolderName: req.body.paymentCard.cardHolderName,
        cardNumber: req.body.paymentCard.cardNumber,
        expireMonth: req.body.paymentCard.expireMonth,
        expireYear: req.body.paymentCard.expireYear,
        cvc: req.body.paymentCard.cvc
      },
      buyer: {
        id: req.body.buyer?.id || "BY789",
        name: req.body.buyer?.name,
        surname: req.body.buyer?.surname,
        gsmNumber: req.body.buyer?.gsmNumber,
        email: req.body.buyer?.email,
        identityNumber: req.body.buyer?.identityNumber || "11111111111",
        registrationAddress: req.body.buyer?.registrationAddress,
        ip: req.ip || req.body.buyer?.ip || "85.34.78.112",
        city: req.body.buyer?.city,
        country: req.body.buyer?.country || "Turkey"
      },
      shippingAddress: {
        contactName: req.body.shippingAddress?.contactName,
        city: req.body.shippingAddress?.city,
        country: req.body.shippingAddress?.country || "Turkey",
        address: req.body.shippingAddress?.address
      },
      billingAddress: {
        contactName: req.body.billingAddress?.contactName,
        city: req.body.billingAddress?.city,
        country: req.body.billingAddress?.country || "Turkey",
        address: req.body.billingAddress?.address
      },
      basketItems: req.body.basketItems || [
        {
          id: "BI101",
          name: "Ürün",
          category1: "Genel",
          itemType: "PHYSICAL",
          price: req.body.price
        }
      ]
    };

    // 🔍 Konsola isteği yazdır
    console.log("Gelen paymentData:", request);

    iyzipay.payment.create(request, (err, result) => {
          console.log("İyzico'dan gelen cevap:", result); // ⭐ EKLE BUNU

      if (err) {
        console.error("Payment Error:", err);
        return res.status(500).json({
          error: "Ödeme işlemi sırasında bir hata oluştu",
          details: err.message
        });
      }

      if (result.status === "failure") {
        return res.status(400).json({
          error: "Ödeme başarısız",
          message: result.errorMessage,
          iyzipayResult: result
        });
      }

      res.json({
        status: "success",
        paymentId: result.paymentId,
        result: result
      });
    });

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({
      error: "Sunucu hatası",
      message: error.message
    });
  }
};
