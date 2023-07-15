const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Products = sequelize.define("products", {
      brandId: {
        type: DataTypes.INTEGER
      },
      category: {
        type: DataTypes.STRING
      },
      subcategory:{
        type: DataTypes.STRING
      },
      modelNumber:{
        type: DataTypes.STRING
      },
      mrpPrice:{
        type: DataTypes.STRING
      },
      unit:{
        type: DataTypes.STRING
      },
      isGST: {
        type: DataTypes.STRING
      },
      GSTAmount: {
        type: DataTypes.STRING
      },
      landing:{
        type: DataTypes.STRING
      },
      make1:{
        type: DataTypes.STRING
      },
      make2:{
        type: DataTypes.STRING
      },
      make3:{
        type: DataTypes.STRING
      },
      make4:{
        type: DataTypes.STRING
      },
      description:{
        type: DataTypes.TEXT
      },
      itemRemark:{
        type: DataTypes.TEXT
      },
      documents: {
        type: DataTypes.TEXT
      },
      pdfFile:{
        type: DataTypes.TEXT
      },
      status:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
      }
    },{
  hooks: {
      beforeCreate() {
        // Do other stuff
      }
    }
    });
  
    return Products;
};