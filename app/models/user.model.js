module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Email benzersiz olmalı
        validate: {
          isEmail: true, // Email formatı doğrulaması
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("user", "admin"), // Belirtilen roller
        defaultValue: "user",
      },
      avatar: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: true,
    }
  );

  return User;
};
