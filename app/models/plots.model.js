module.exports = (sequelize, Sequelize) => {
    const Plots = sequelize.define("plots", {
        townshipId :{
            type: Sequelize.INTEGER
        },
        blockId : {
            type: Sequelize.INTEGER
        },
        plot_number : {
            type: Sequelize.INTEGER
        },
        dimesion : {
            type: Sequelize.STRING
        },
        plot_status: {
            type: Sequelize.STRING
        },
        latitude : {
            type: Sequelize.FLOAT(11)
        },
        longitude : {
            type: Sequelize.FLOAT(11)
        },
        documents : {
            type: Sequelize.STRING
        },
        selling_amount : {
            type: Sequelize.FLOAT(11)
        },
        description :{
            type: Sequelize.TEXT
        },
        status: {
            type: Sequelize.BOOLEAN
        }
    });
  
    return Plots;
};