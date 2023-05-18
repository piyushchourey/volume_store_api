const db = require("../models/index");
const Broker = db.broker;
const config = require("../config/auth.config");
const Op = db.Sequelize.Op;
var _ = require('lodash');
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');

/* This function is used to resgistered Admin user */
const doRegister = async (req, res) =>{
    try{
        if(!(_.isEmpty(req.body))){
            var ImageFileName = await uploadImage(req.body)
            req.body['documents'] = ImageFileName;
            Broker.create(req.body).then(user => {
                res.status(200).send({ status: 1, data: [], message: "Broker was registered successfully!" });
            }).catch(err => {
                res.status(500).send({ status: 0, data: [], message: err.message });
              });
        }else{
            res.send({ status: 0, data: [], message: "Post data is not valid." });
        }
    }catch(err){
        res.status(500).send({ status: 0, data: [], message: err.message });
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
    const orConditions = [];
	const paramObj = {};
	if(req.query.id){
		const id = req.query.id; 
		var brokerCondition = id ? { id: { [Op.eq]: id } } : null;
		orConditions.push(brokerCondition);
	}
	if(req.query.first_name){
		const township_name = req.query.first_name; 
		var brokerCondition = first_name ? { first_name: { [Op.like]: `%${first_name}%` } } : null;
		orConditions.push(brokerCondition);
	}
	if(_.size(orConditions) > 0){
		paramObj.where = { [Op.and]: orConditions };
	}
	try{
		let BrokerData = await Broker.findAll(paramObj)
		const promises1 =  BrokerData.map(async (f) => {
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

/*This function is used to delete broker */
const doRemove = ( req, res ) =>{ 
	const id = req.query.id;
    try{
        Broker.destroy({ where: { id: id } }).then(data => {
            res.send({ status:1, data:[], message:"Broker deleted successfully."});
          }).catch(err => {
            res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
        });
    }catch(err){
        res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
    }
};


module.exports = {
  doRegister,
  getAll,
  doRemove
}