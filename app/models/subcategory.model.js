module.exports = (sequelize, Sequelize) => {
    const SubCategory = sequelize.define("subcategory", {
      name: {
        type: Sequelize.STRING
      },
      categoryId:{
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.BOOLEAN
      }
    });
  
    return SubCategory;
};