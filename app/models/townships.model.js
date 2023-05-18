module.exports = (sequelize, Sequelize) => {
    const Townships = sequelize.define("townships", {
        township_name : {
            type: Sequelize.STRING
        },
        stateId : {
            type: Sequelize.BIGINT
        },
        cityId : {
            type: Sequelize.BIGINT
        },
        pincode : {
            type: Sequelize.INTEGER
        },
        number_of_blocks : {
            type: Sequelize.INTEGER
        },
        number_of_plots : {
            type: Sequelize.INTEGER
        },
        total_size_of_township : {
            type: Sequelize.STRING
        }, 
        colonizer : {
            type: Sequelize.STRING
        },
        colonizer_status : {
            type: Sequelize.STRING
        },
        documents : {
            type: Sequelize.STRING
        },
        description :{
            type: Sequelize.TEXT
        },
        status: {
            type: Sequelize.BOOLEAN
        }
    });
  
    return Townships;
};