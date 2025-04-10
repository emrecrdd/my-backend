module.exports = (sequelize, DataTypes) => {
    const Statistics = sequelize.define("statistics", {
        totalSubscribers: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        totalEmailsSent: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        totalEmailsOpened: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        monthlySubscribers: {
            type: DataTypes.JSONB,  // JSON formatında aylık veriler
            defaultValue: []        // Örnek veri: [{ month: '2025-04', subscribers: 6 }]
          },
          monthlyEmailsSent: {
            type: DataTypes.JSONB,  // JSON formatında aylık gönderim verileri
            defaultValue: []        // [{ month: '2025-04', emailsSent: 10 }]
          }
    });

    return Statistics;
};
