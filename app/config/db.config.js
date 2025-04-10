module.exports = {
  HOST: "ep-broad-sea-a5hfs1cv-pooler.us-east-2.aws.neon.tech", 
  USER: "neondb_owner",
  PASSWORD: "npg_rm2iaf9HXoUY",
  DB: "neondb",
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, // SSL gereklidir
      rejectUnauthorized: false // Eğer kendinden imzalı bir sertifika varsa, bu özelliği açabilirsin
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
