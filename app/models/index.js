const { Sequelize } = require('sequelize');
const dbConfig = require("../config/db.config.js");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: dbConfig.PORT,  // Portu da belirtmeyi unutma
  dialectOptions: {
    ssl: dbConfig.dialectOptions.ssl
  },
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  }
});

const db = {};

// Sequelize nesnesini ekliyoruz
db.Sequelize = Sequelize;
db.sequelize = sequelize;

module.exports = db;


// Modelleri içe aktarıyoruz

db.Category = require("./category.model.js")(sequelize, Sequelize);
db.Blog = require("./blog.model.js")(sequelize, Sequelize);
db.Product = require("./product.model.js")(sequelize, Sequelize);
db.Subscriber = require("./subscriber.model.js")(sequelize, Sequelize);
db.Statistics = require("./statistics.model.js")(sequelize, Sequelize); 
db.User = require("./user.model.js")(sequelize, Sequelize); 
db.Auth = require("./auth.model.js")(sequelize, Sequelize); // Yeni Auth modelini ekledik
db.Coupon = require("./coupon.model.js")(sequelize, Sequelize); 
db.Vote = require("./vote.model.js")(sequelize, Sequelize); 
db.Favorite = require("./favorite.model.js")(sequelize, Sequelize); 
db.Review = require("./review.model.js")(sequelize, Sequelize); 
db.Order = require("./order.model.js")(sequelize, Sequelize);
db.OrderItem = require("./orderItem.model.js")(sequelize, Sequelize);





// İlişkileri çağırıyoruz
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
module.exports = db;
