const db = require("../models/index");
const Brand = db.brand;
const MeasurementUnit = db.measurementunit;
const Product = db.product;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const fs = require('fs');
const mime = require('mime');
const XLSX = require("xlsx"); 
const {  commonServices } = require("../middlewares");
var multer  = require('multer');
const Sequelize = require("sequelize");

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// console.log('test123')
	  cb(null, './excel/')
	},
	filename: function (req, file, cb) {
		console.log('filenmeaff')
		let filenqme =  Date.now()+file.originalname
		req['filename2'] = filenqme
	  cb(null, filenqme)
	}
})

var upload = multer({ 
	storage:storage
	// limits:{
	// 	fileSize: 1024 * 1024 * 5
	// },
	// fileFilter:fileFilter
  });
  
  const fileFilter=(req, file, cb)=>{
	console.log("sdsads");
//    if(file.mimetype ==='csv' || file.mimetype ==='xls'){
// 	   cb(null,true);
//    }else{
// 	   cb(null, false);
//    }
  
  }
  
const singleFileUpload = upload.single("importFile")


// Create and Save a new product
const create = async (req, res) => {
    // Validate request
	try{
		if(!(_.isEmpty(req.body))){
			var brandPostData = req.body;
			if(brandPostData.id){
				let brandId = _.pick(brandPostData, ['id']);
				let UpdatebrandPostData = brandPostData;
				UpdatebrandPostData = _.omit(UpdatebrandPostData, ['id']);
				await Brand.update(UpdatebrandPostData,{
					where : { id : brandId.id } 
				}).then(data => {
						res.send({ status:1, data:data, message: 'Brand updated successfully.' });
				}).catch(err => { 
					res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while retrieving tutorials." }); 
				});
			}else{
				delete brandPostData['id'];
				Brand.create(brandPostData).then(brand => {
					res.send({ status:1, data:[], message: "Brand was added successfully!" });
				}).catch(err => {
					res.status(500).send({ status:0, data:[], message: err.message });
				});
			}
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

const getAll =async (req, res, next) => {
    let paramObj = { status: true};
	try {
		const brandData = await Brand.findAll({
			where: paramObj,
			attributes: [
			  [Sequelize.literal('UPPER(brand.name)'), 'name'], // Convert brandName to uppercase
			  'id',
			  'status',
			  'createdAt',
			  'updatedAt',
			],
			order: [[Sequelize.literal('UPPER(brand.name)'), 'ASC']] // Order by name in ascending order
		  });
		// Convert the 'name' property of each object to uppercase in brandData
		//brandData = brandData.map(item => ({ ...item, name: item.name.toUpperCase() }));
		//console.log(brandData);
		res.status(200).send({ status:true, data:brandData, message: '' });
	}catch(err){
		res.status(500).send({ status :0, data :[], message: err.message });
	}
}

const getAllUnits = async(req, res, next) => {
	try {
		let measurementUnitData = await MeasurementUnit.findAll();
		res.status(200).send({ status:true, data:measurementUnitData, message: '' });
	  
	}catch(err){
		res.status(500).send({ status :0, data :[], message: err.message });
	}
}

getAllModelNumber = async(req, res, next) => {
	const andConditions = [];
	const paramObj = {};
	if(req.params.id){
		let id = req.params.id; 
		var brandIdCondition = id ? { brandId: { [Op.eq]: id } } : null;
		andConditions.push(brandIdCondition);
	}
	var statusCondition =  { status: { [Op.eq]: 1 } };
	andConditions.push(statusCondition);
	if(_.size(andConditions) > 0){
		paramObj.where = { [Op.and]: andConditions };
	}
	try {
		let modelData = await Product.findAll({
			attributes: ['modelNumber','id'],
			...paramObj // spread the properties of paramObj here
		});
		res.status(200).send({ status:true, data:modelData, message: '' });
	  
	}catch(err){
		res.status(500).send({ status :0, data :[], message: err.message });
	}
}

const bulkImport = async ( req, res ) =>{
	try{
		console.log(req.files); 
		console.log(__dirname)
		let data = await new Promise((resolve, reject) => {
			console.log('runnn')
			return singleFileUpload(req, res, err => {
				console.log(err) 
				// console.log(res)

			  if (err) return reject(err)
			  return resolve('');
			})
		  })
		  	let newpath =  'excel/'+req['filename2'];
			const wb = XLSX.readFile(newpath);
			const sheets = wb.SheetNames;
			if(sheets.length > 0) {
				const data = XLSX.utils.sheet_to_json(wb.Sheets[sheets[0]]);
				console.log(data);
				const products = data.map(row => ({
					brand_name: row['Brand Name'],
					category: row['Category'],
					subcategory: row['Subcategory'],
					oemPartNumber: row['OEM Part Number'],
					mrpPrice: row['MRP Price'],
					isGST: row['IS GST'],
					GSTAmount: row['GST Amount'],
					landing: row['Landing'],
					mark1: row['Mark1'],
                    mark2: row['Mark2'],
                    mark3: row['Mark3'],
                    mark4: row['Mark4'],
					description: row['Description'],
                    itemRemark:row['Item Remark']
				}))
                console.log(products)
				await Product.bulkCreate(products); 
				res.send({ status:true, data:[], message: "Products was added successfully!" });
			}
	}catch(err){
		res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
	}
}

const doRemove = ( req, res ) =>{
	const id = req.params.id;
    try{
        Brand.destroy({ where: { id: id } }).then(data => {
            res.send({ status:1, data:[], message:"Brand deleted successfully."});
          }).catch(err => {
            res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
        });
    }catch(err){
        res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
    }
};


module.exports = {
    create,
    uploadImage,
    getAll,
    bulkImport,
    doRemove,
	getAllUnits,
	getAllModelNumber
};