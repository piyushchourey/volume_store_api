module.exports = (sequelize, Sequelize) => {
    const Cities = sequelize.define("cities", {
      name: {
        type: Sequelize.STRING
      },
      state_id: {
        type: Sequelize.INTEGER
      }
    });
  
    return Cities; 
}; 