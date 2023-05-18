const db = require("../models/index");
const Product = db.product;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const fs = require('fs');
const mime = require('mime');
const XLSX = require("xlsx"); 
const {  commonServices } = require("../middlewares");
var multer  = require('multer');

// Create and Save a new product
const create = async (req, res) => {
    // Validate request
	try{
		if(!(_.isEmpty(req.body))){
			var productPostData = req.body;
			var ImageFileName = await uploadImage(req.body)
			productPostData['documents']= ImageFileName; 
			Product.create(productPostData).then(township => {
                res.send({ status:1, data:[], message: "Product was added successfully!" });
			}).catch(err => {
                res.status(500).send({ status:0, data:[], message: err.message });
			});
		}else{
			res.send({ status:0, data:[], message: 'Post data is not valid.' });
		}
	}catch(err){
		res.status(500).send({ status:0, data:[], message: err.message });
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

module.exports = {
    create,
    uploadImage
};