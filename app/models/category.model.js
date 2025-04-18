module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define("category", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    img: {
      type: DataTypes.STRING,
    },
  });

 
  Category.associate = (models) => {
    Category.hasMany(models.Product, {
      foreignKey: "categoryId",  
      as: "products",  
    });
  };

  return Category;
};
