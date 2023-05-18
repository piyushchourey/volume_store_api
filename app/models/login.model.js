module.exports = (sequelize, Sequelize) => {
    const Login = sequelize.define("login", {
      email: {
        type: Sequelize.STRING,
        allowNull: false,
		unique: true,
		validate : {
		   isEmail: true,
		}
      },
      password: {
        type: Sequelize.STRING
      },
      role:{
  	 	type: Sequelize.STRING
      }
    },{
	hooks: {
	    beforeCreate() {
	      // Do other stuff
	    }
  	}
    });
  
    return Login;
};