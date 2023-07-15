module.exports = (sequelize, Sequelize) => {
    const Client = sequelize.define("client", {
    name: {
        type: Sequelize.STRING
    },
    projectType: {
        type: Sequelize.STRING
    },
    date: {
        type: Sequelize.STRING
    },
    state: {
        type: Sequelize.STRING
    },
    city: {
        type: Sequelize.STRING
    },
    approxCost: {
        type: Sequelize.STRING
    },
    refNumber: {
        type: Sequelize.STRING
    },
    refBy:{
        type: Sequelize.STRING
    },
    contactNumber:{
        type: Sequelize.STRING
    },
    status: {
        type: Sequelize.BOOLEAN,
        defaultValue:true
      }
    });
  
    return Client;
};