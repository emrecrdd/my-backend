module.exports = {
  HOST: "localhost", // Yerel geliştirme için localhost
  USER: "postgres", // PostgreSQL varsayılan kullanıcı adı
  PASSWORD: "111", // Kendi yerel şifreni yaz
  DB: "adem", // Yerel geliştirme için veritabanı adı
  dialect: "postgres", // PostgreSQL kullanıyoruz
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
