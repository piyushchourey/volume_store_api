const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const LoginMeta = sequelize.define("products", {
        brand_name: {
        type: DataTypes.STRING
      },
      category: {
        type: DataTypes.STRING
      },
      subcategory:{
        type: DataTypes.STRING
      },
      oemPartNumber:{
        type: DataTypes.STRING
      },
      mrpPrice:{
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
      mark1:{
        type: DataTypes.STRING
      },
      mark2:{
        type: DataTypes.STRING
      },
      mark3:{
        type: DataTypes.STRING
      },
      mark4:{
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
      }
    },{
  hooks: {
      beforeCreate() {
        // Do other stuff
      }
    }
    });
  
    return LoginMeta;
};