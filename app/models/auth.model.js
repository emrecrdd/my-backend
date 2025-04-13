module.exports = (sequelize, DataTypes) => {
    const Auth = sequelize.define(
      "Auth",
      {
        token: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        expires: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        timestamps: true,
      }
    );
  
    return Auth;
  };
  
