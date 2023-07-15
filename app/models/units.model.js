module.exports = (sequelize, Sequelize) => {
    const MeasurementUnit = sequelize.define("unitsmeasurement", {
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      }
    });
  
    return MeasurementUnit;
};