const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Products = sequelize.define("products", {
      brandId: {
        type: DataTypes.INTEGER
      },
      categoryId: {
        type: DataTypes.INTEGER
      },
      subcategoryId:{
        type: DataTypes.INTEGER
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
      productUSP:{
        type: DataTypes.TEXT
      },
      OEMcriteria:{
        type: DataTypes.TEXT
      },
      videoURL:{
        type: DataTypes.TEXT
      },
      documents: {
        type: DataTypes.TEXT
      },
      bannerImg: {
        type: DataTypes.TEXT
      },
      pdfFile:{
        type: DataTypes.TEXT
      },
      modelNumber_ref1:{
        type: DataTypes.INTEGER
      },
      modelNumber_ref2:{
        type: DataTypes.INTEGER
      },
      modelNumber_ref3:{
        type: DataTypes.INTEGER
      },
      modelNumber_ref4:{
        type: DataTypes.INTEGER
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