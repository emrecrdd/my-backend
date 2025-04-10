module.exports = (sequelize, Sequelize) => {
  const Blog = sequelize.define("blog", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    img: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    publishedDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    content: {
      type: Sequelize.TEXT,  // İçeriğin uzun ve HTML formatında olacağını varsayıyoruz.
      allowNull: false,
    },
    
  });

 

  return Blog;
};
