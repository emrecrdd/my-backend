require('dotenv').config(); // dotenv paketi ile çevresel değişkenleri yükle

module.exports = {
  HOST: process.env.DB_HOST,       // Veritabanı URL'si
  USER: process.env.DB_USER,       // Veritabanı kullanıcı adı
  PASSWORD: process.env.DB_PASS,   // Veritabanı şifresi
  DB: process.env.DB_NAME,         // Veritabanı adı
  dialect: "postgres",             // Veritabanı türü
  pool: {
    max: 5,                        // Maksimum bağlantı sayısı
    min: 0,                        // Minimum bağlantı sayısı
    acquire: 30000,                // Bağlantı almak için bekleme süresi (ms)
    idle: 10000                    // Bağlantı boşta kalma süresi (ms)
  }
};
