module.exports = (sequelize, Sequelize) => {
    const SOR = sequelize.define("sor", {
      projectType: {
        type: Sequelize.INTEGER
      },
      projectName: {
        type: Sequelize.STRING
      },
      clientId: {
        type: Sequelize.INTEGER
      },
      projectDescription: {
        type: Sequelize.TEXT
      },
      servicesArr: {
        type: Sequelize.JSON
      },
      compareMakeModelArr:{
        type: Sequelize.JSON
      },
      priceCompareFlagArr:{
        type: Sequelize.JSON
      },
      inprogressSteps: {
        type: Sequelize.INTEGER
      },
      totalCost: {
        type: Sequelize.Sequelize.DECIMAL(20, 2)
      }

    });
  
    return SOR;
};