module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define("Order", {
      orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discountPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
      paymentId: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    }, {
      timestamps: true,
    });
  
    Order.associate = (models) => {
      Order.belongsTo(models.User, { foreignKey: "userId" });
      Order.hasMany(models.OrderItem, { foreignKey: "orderId" });
    };
  
    return Order;
  };
  
