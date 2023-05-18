const db = require("../models/index");
const Login = db.login;
const LoginMeta = db.LoginMeta;
const State = db.state;
const City = db.city;
const config = require("../config/auth.config");
const Op = db.Sequelize.Op;
var _ = require('lodash');
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');

/* This function is used to resgistered Admin user */
const doRegister = async (req, res) =>{
	if(!(_.isEmpty(req.body))){
		var loginPostFilteredData = {email:null,password:null,role:null};
		var loginPostData = _.pick(req.body, _.keys(loginPostFilteredData));
		_.assign(loginPostData,{ 'password': bcrypt.hashSync(req.body.password, 8) });
		var loginMetaPostData = _.omit(req.body, _.keys(loginPostFilteredData));
		  // Save User to Database
		  Login.create(loginPostData).then(user => {
			_.assign(loginMetaPostData,{ 'loginId': user.id });
			var ImageFileName =  uploadImage(req.body)
			.then((image)=>{
				console.log(image);
				loginMetaPostData['documents'] = image;
				LoginMeta.create(loginMetaPostData).then(() => {
					res.status(200).send({ status: 1, data: [], message: "User was registered successfully!" });
				}).catch(err => {
					res.status(500).send({ status: 0, data: [], message: err.message });
				}); 
			}).catch(err => {
				res.status(500).send({ status: 0, data: [], message: err.message });
			  });
		}).catch(err => {
			res.status(500).send({ status: 0, data: [], message: err.message });
		  });
		}else{
			res.send({ status: 0, data: [], message: "Post data is not valid." });
		}
};

/* This function is used to upload image.. */
const uploadImage = async (req, res, next) => {
	// to declare some path to store your converted image
	var matches = req.documents.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
	response = {};
	 
	if (matches.length !== 3) {
	return new Error('Invalid input string');
	}
	 
	response.type = matches[1];
	response.data = new Buffer(matches[2], 'base64');
	let decodedImg = response;
	let imageBuffer = decodedImg.data;
	let type = decodedImg.type;
	let extension = mime.getExtension(type); 
	let randomName = new Date().getTime();
	let fileName = randomName +"." + extension;
	try {
		fs.writeFileSync("./images/" + fileName, imageBuffer, 'utf8');
		return fileName;
	} catch (e) {
		next(e); 
	}
}

/*This function is used to get all data */
const getAll =  async (req, res) => {
	const first_name = req.query.first_name;
	try{
		var condition = first_name ? { first_name: { [Op.like]: `%${first_name}%` } } : null;
		let userData = await LoginMeta.findAll({ where: condition, include: [Login] })
		const promises1 =  userData.map(async (f) => {
			f.documents =  process.env.API_URL+'images/'+f.documents;
			return f;
		 })
		let newArray = await Promise.all(promises1);
		res.send({ status:1,data:newArray, message:""});
	}catch(err){
		res.status(500).send({
			status :0,
			data : [],
			message:
			  err.message || "Some error occurred while retrieving tutorials."
		  });
	}
};

const doRemove = ( req, res ) =>{ 
	const id = req.query.id;
	LoginMeta.destroy({
		where: { id: id }
	   })
	  .then(data => {
		res.send({ status:1, data:[], message:"Admin deleted successfully."});
	  })
	  .catch(err => {
		res.status(500).send({
		  status :0,
		  data : [],
		  message:
			err.message || "Some error occurred while retrieving tutorials."
		});
	  });
};

const getStates = async ( req, res ) =>{
	const id = req.query.id;
	try{
		var condition = id ? { id: { [Op.eq]: `${id}` } } : null;
		let stateData = await State.findAll({ where: condition })
		res.send({ status:1,data:stateData, message:""});
	}catch(err){
		res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
	}
}

const getCitiesByState = async ( req, res ) =>{
	const stateId = req.query.stateId;
	try{
		var condition = stateId ? { stateId: { [Op.eq]: `${stateId}` } } : null;
		let cityData = await City.findAll({ where: condition, include : [{model: State, attributes:['name']}] })
		res.send({ status:1,data:cityData, message:""});
	}catch(err){
		res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
	}
}

module.exports = {
  doRegister,
  getAll,
  doRemove,
  getStates,
  getCitiesByState
}
