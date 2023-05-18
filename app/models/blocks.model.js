module.exports = (sequelize, Sequelize) => {
    const Block = sequelize.define("block", {
      townshipId:{
  	 	type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      size: {
        type: Sequelize.STRING
      }
    });
  
    return Block;
};