module.exports = (sequelize, DataTypes) => {
    const Vote = sequelize.define("vote", {
      perfumeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });
  
    return Vote;
  };
  