module.exports = (sequelize, DataTypes) => {
    const Favorite = sequelize.define("Favorite", {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });
  
    // Favorilere eklenen ürünler
    Favorite.associate = (models) => {
      Favorite.belongsTo(models.Product, {
        foreignKey: "productId",
        onDelete: "CASCADE",
        as: "product",
      });
    };
  
    return Favorite;
  };
  