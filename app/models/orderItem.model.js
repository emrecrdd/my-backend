module.exports = (sequelize, DataTypes) => {
    const OrderItem = sequelize.define("OrderItem", {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      }
    }, {
      timestamps: true,
    });
  
    OrderItem.associate = (models) => {
        OrderItem.belongsTo(models.Order, { foreignKey: "orderId", targetKey: "id" });
        OrderItem.belongsTo(models.Product, { foreignKey: "productId", targetKey: "id" });
      };
      
    return OrderItem;
  };
  
