module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define("coupon", {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discountPercent: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    subscriberId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "subscribers",
        key: "id"
      },
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true, // createdAt ve updatedAt alanlarını ekler
  });

  return Coupon;
};
