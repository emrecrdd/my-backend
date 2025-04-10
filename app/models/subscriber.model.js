module.exports = (sequelize, Sequelize) => {
    const Subscriber = sequelize.define("subscriber", {
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: "Lütfen geçerli bir email adresi girin."
          }
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  
    return Subscriber;
  };
  