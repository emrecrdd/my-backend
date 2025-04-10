module.exports = app => {
    const coupons = require("../controllers/coupon.controller.js");
  
    var router = require("express").Router();
  
    // Kuponları listeleme
    router.get("/", coupons.findAll); // 'getAllCoupons' yerine 'findAll'
  // Kuponları kontrol et
router.get("/check", coupons.findByCode); // Yeni bir 'check' route'u ekliyoruz

    // Tek bir kuponu ID ile getirme
    router.get("/:id", coupons.findOne); // 'getCouponById' yerine 'findOne'
  
    // Yeni kupon ekleme
    router.post("/", coupons.create); // 'createCoupon' yerine 'create'
  
    // Kuponu güncelleme
    router.put("/:id", coupons.update); // 'updateCoupon' yerine 'update'
  
    // Kuponu silme
    router.delete("/:id", coupons.delete); // 'deleteCoupon' yerine 'delete'
  
    // /api/coupons yoluna yönlendir
    app.use("/api/coupons", router);
};
