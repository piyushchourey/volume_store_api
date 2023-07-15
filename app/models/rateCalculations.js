module.exports = (sequelize, Sequelize) => {
    const RateCalculation = sequelize.define("ratecalculation", {
    client_id: {
        type: Sequelize.INTEGER
      },
      isRARequired: {
        type: Sequelize.BOOLEAN
      },
      productArr: {
        type: Sequelize.JSON
      },
      RAData: {
        type: Sequelize.JSON
      },
      totalPrice:{
        type: Sequelize.STRING
      }
    });
  
    return RateCalculation;
};