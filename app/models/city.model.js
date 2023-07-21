module.exports = (sequelize, Sequelize) => {
    const Cities = sequelize.define("cities", {
      name: {
        type: Sequelize.STRING
      },
      stateId: {
        type: Sequelize.INTEGER
      }
    });
  
    return Cities; 
}; 