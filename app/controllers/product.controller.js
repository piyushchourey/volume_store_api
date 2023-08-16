const db = require("../models/index");
const Product = db.product;
const Brand = db.brand;
const Category = db.category;
const Subcategory = db.subcategory;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const fs = require('fs');
const mime = require('mime');
const XLSX = require("xlsx"); 
const {  commonServices } = require("../middlewares");
var multer  = require('multer');


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
const create = async (req, res,next) => {
    // Validate request
	try{
		if(!(_.isEmpty(req.body))){
			var productPostData = req.body;
			var ImageFileName = await uploadImage(req.body,next);
			var PdfFileName = await uploadPdf(req.body,next);
			var BannerImageName = await uploadBannerImage(req.body,next);
			productPostData['documents']= ImageFileName; 
			productPostData['pdfFile']= PdfFileName; 
			productPostData['bannerImg']= BannerImageName;
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
const uploadImage = async (req, next) => {
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
		throw(e); 
	}
}

const uploadBannerImage = async (req, next) => {
	// to declare some path to store your converted image
	var matches = req.bannerImg.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
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
		fs.writeFileSync("./images/product-banner/" + fileName, imageBuffer, 'utf8');
		return fileName;
	} catch (e) {
		throw(e); 
	}
}

const uploadPdf = async (req, next) => {
	// to declare some path to store your converted image
	var matches = req.pdfFile.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),
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
		fs.writeFileSync("./pdf/" + fileName, imageBuffer, 'utf8');
		return fileName;
	} catch (e) {
		throw(e); 
	}
}

const getAll = async (req, res, next) => {
	try {
	  const paramObj = req.params.id ? { where: { id: req.params.id } } : {where: { status: 1 }};
	  paramObj.include= [
		{
			model:Brand,
			attributes: [ 'id', 'name', 'status' ],
			where: { status: 1, }
		},
		{
		  model: Category,
		  attributes: [ 'id', 'name', 'status' ],
		  where: { status: 1, },
		},
		{
			model: Subcategory,
			attributes: [ 'id', 'name', 'status' ],
			where: { status: 1, },
		}
	  ]
	  const productData = await Product.findAll(paramObj);
	  const updatedProductData = productData.map((product) => {
		product.documents = process.env.API_URL + 'images/' + product.documents;
		product.bannerImg = process.env.API_URL + 'images/product-banner/' + product.bannerImg;
		product.pdfFile = process.env.API_URL + 'pdf/' + product.pdfFile;
		product.modelNumber = product.brand.name+ " - "+product.modelNumber;
		return product;
	  }); 
  
	  res.status(200).send({ status: true, data: updatedProductData, message: '' });
	} catch (err) {
	  res.status(500).send({ status: false, data: [], message: err.message });
	}
};
  

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
};

const doRemove = async ( req, res ) =>{ 
	try{
		const id = req.params.id;
		const product = await Product.findOne({ where: { id: id } });
		if(product){
			await Product.update({ status: false }, { where: { id: id } });
			res.send({ status:true, data:[], message:"Product deleted successfully."});
		}else{
			res.status(500).send({status :false,message:"Product does not exist in our DB."});
		}
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
    create,
    uploadImage,
    getAll,
    bulkImport,
	doRemove
};