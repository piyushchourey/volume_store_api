const db = require("../models/index");
const Login = db.login;
const LoginMeta = db.LoginMeta;
const config = require("../config/auth.config");
const Op = db.Sequelize.Op;
var _ = require('lodash');
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');


/* This function is used to resgistered Admin user */
const doRegister = (req, res) =>{
	if(!(_.isEmpty(req.body))){
		var loginPostFilteredData = {email:null,password:null,role:null};
		var loginPostData = _.pick(req.body, _.keys(loginPostFilteredData));
		_.assign(loginPostData,{ 'password': bcrypt.hashSync(req.body.password, 8) });
		var loginMetaPostData = _.omit(req.body, _.keys(loginPostFilteredData));
		  // Save User to Database
		  console.log(loginPostData); 
		  Login.create(loginPostData).then(user => {
			_.assign(loginMetaPostData,{ 'loginId': user.id });
			var ImageFileName = uploadImage(req.body).then((image)=>{
				_.assign(loginMetaPostData,{ 'documents': image });
			});
			LoginMeta.create(loginMetaPostData).then(() => {
				res.send({ status:1, data:[],  message: "User was registered successfully!" });
			}); 
		  })
		  .catch(err => {
			res.status(500).send({ status:0, data:[], message: err.message });
		  });
	}else{
		res.send({ status:0, data:[], message: 'Post data is not valid.' });
	}
};

const dologin = (req, res) => {
    // Validate request
	try{    
		Login.findOne({ where: { email: req.body.email } })
			.then(data => {
				if(_.size(data) > 0){
					//check password is correct or not..
					var passwordIsValid = bcrypt.compareSync(
					req.body.password,
					data.password
					);
					//if password is not correct..
					if (!passwordIsValid) {
					return res.status(401).send({
						status :0,
						accessToken: null,
						message: "Invalid Password!"
					});
					}

					var token = jwt.sign({ id: data.id }, config.secret, {
					expiresIn: 86400 // 24 hours
				});
				res.send({
					id: data.id,
					email: data.email,
					createdAt: data.createdAt,
					updatedAt: data.updatedAt,
					role: data.role,
					accessToken: token
				});
				}else{
					res.send({ status:0, data:[], message: 'User does not exist.' });
				}
			})
	.catch(err => {
	  res.status(500).send({
		status :0,
		data : [],
		message:
		  err.message || "Some error occurred while retrieving tutorials."
	  });
	});
	}catch(err){
		res.status(500).send({
			status :0,
			data : [],
			message:
			  err.message || "Some error occurred while retrieving tutorials."
		  });
	}

};

module.exports = {
    dologin,
    doRegister
}; 