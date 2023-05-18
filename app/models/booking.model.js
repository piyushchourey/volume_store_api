module.exports = (sequelize, Sequelize) => {
    const Booking = sequelize.define("booking", {
        townshipId: {
            type: Sequelize.INTEGER
        },
        blockId: {
            type: Sequelize.INTEGER
        },
        plotId: {
            type: Sequelize.INTEGER
        },
        client_name : {
            type: Sequelize.STRING
        },
        email : {
            type: Sequelize.STRING
        },
        mobile :{
            type: Sequelize.STRING(25)
        },
        aadharcardNumber : {
            type: Sequelize.STRING
        },
        aadharcardDoc: { 
            type: Sequelize.STRING
        },
        salarySlipDoc: {
            type: Sequelize.STRING
        },
        agreementDoc: {
            type: Sequelize.STRING
        },
        plotAmount: {
            type: Sequelize.FLOAT
        },
        cashPlotAmount: {
            type: Sequelize.FLOAT
        },
        checkPlotAmount: {
            type: Sequelize.FLOAT
        },
        bookingAmount : {
            type: Sequelize.FLOAT(11)
        },
        cashAmountReceived : {
            type: Sequelize.FLOAT(11)
        },
        checkAmountReceived : {
            type: Sequelize.FLOAT(11)
        },
        remainingAmount : {
            type: Sequelize.FLOAT(11)
        },
        paymentMode : {
            type : Sequelize.STRING
        },
        description :{
            type: Sequelize.TEXT
        },
        status: {
            type: Sequelize.BOOLEAN
        },
        commission_type : {
            type : Sequelize.STRING
        },
        commission_type_amount : {
            type : Sequelize.STRING
        },
        commission_amount : {
            type : Sequelize.STRING
        },
        brokerId :{
            type: Sequelize.INTEGER
        }
    });
  
    return Booking;
};