module.exports = (sequelize, Sequelize) => {
    const Brand = sequelize.define("brand", {
      name: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue:true
      }
    });
  
    return Brand;
};