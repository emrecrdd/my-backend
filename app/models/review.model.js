module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define("Review", {
    user_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 1000], // Yorumun en az 10 karakter, en fazla 1000 karakter olması gerekebilir
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Rating 1'den küçük olamaz
        max: 5, // Rating 5'ten büyük olamaz
      },
    },
  });

  // Yorumlar bir ürüne ait olmalı
  Review.associate = (models) => {
    Review.belongsTo(models.Product, {
      foreignKey: "productId",
      onDelete: "CASCADE", // Ürün silindiğinde yorumlar da silinir
      as: "product",
    });
  };

  return Review;
};
