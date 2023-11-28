module.exports = (sequelize, Sequelize) => {
    const Service = sequelize.define("service", {
      name: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue:true
      }
    });
  
    return Service;
};