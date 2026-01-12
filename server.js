const express = require("express");
const http = require("http");
const cors = require("cors");
require('dotenv').config();

const app = express();
// HTTP server'ı başlatıyoruz
const server = http.createServer(app);

var corsOptions = {
  origin: ["http://localhost:3000", "https://crdsoft-demo-e-ticaret"], // Netlify frontend domain'i
  credentials: true
};


app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
db.sequelize.sync({ alter: true }).then(() => {
  console.log("Veritabanı senkronize edildi.");
});

// Veritabanı işlemleri ve diğer rotalar
require("./app/routes/category.routes")(app);
require("./app/routes/blog.routes")(app);
require("./app/routes/coupon.routes")(app);
require("./app/routes/subscriber.routes")(app);
require("./app/routes/statistics.routes")(app);
require("./app/routes/product.routes")(app);
require("./app/routes/perfumeVote.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/authRoutes")(app);  // authRoutes.js dosyasını dahil ettik
require("./app/routes/paymentRoutes")(app);  
require("./app/routes/orderRoutes")(app);  
require("./app/routes/review.routes")(app);
app.get("/", (req, res) => {
  res.send("Sunucum canlıüüüüüüü!");
});

// Port ayarı ve sunucu başlatma
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
