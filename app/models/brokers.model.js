const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Brokers = sequelize.define("brokers", {
      first_name: {
        type: DataTypes.STRING
      },
      last_name: {
        type: DataTypes.STRING
      },
      address:{
        type: DataTypes.TEXT
      },
      mobile_number:{
        type: DataTypes.STRING
      },
      aadhar_number:{
        type: DataTypes.STRING
      },
      documents: {
        type: DataTypes.STRING
      }
    },{
  hooks: {
      beforeCreate() {
        // Do other stuff
      }
    }
    });
  
    return Brokers;
};