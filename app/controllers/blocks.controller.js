const db = require("../models/index");
const Blocks = db.blocks;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');
const Townships = db.townships;
const Plots = db.plots;
const XLSX = require("xlsx"); 
const {  commonServices } = require("../middlewares");
var multer  = require('multer');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './excel/')
	},
	filename: function (req, file, cb) {
		console.log('filenmeaff')
		let filenqme =  Date.now()+file.originalname
		req['filename2'] = filenqme
	  cb(null, filenqme)
	}
  })
  
  const fileFilter=(req, file, cb)=>{
	if(file.mimetype ==='csv' || file.mimetype ==='xls'){
		cb(null,true);
	}else{
		cb(null, false);
	}
}
  
  var upload = multer({ 
	storage:storage
  });
  
const singleFileUpload = upload.single("importFile")


// Create and Save a new Township
const create = async (req, res) => {
    // Validate request
    //let blockData = [{ townshipId: 1, name: "Block- A", size: "10 * 40 " },{ townshipId: 1, name: "Block- B", size: "10 * 40 " },{ townshipId: 1, name: "Block- C", size: "10 * 40 " }];
    try{
		if(!(_.isEmpty(req.body))){
			var blockPostData = req.body;
            const promises1 =  blockPostData.map(async (f) => {
	            if(f.id==""){
					delete f.id;
				}
				return f;
            })
			let newArray = await Promise.all(promises1);
			Blocks.bulkCreate(newArray).then(block => {
					res.send({ status:1, data:[], message: "Block was registered successfully!" });
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

// Get all blocks of township
const getAll = async (req, res) => {
	const orConditions = [];
	const paramObj = {};
	if(req.query.id){
		const id = req.query.id; 
		var blockCondition = id ? { id: { [Op.eq]: id } } : null;
		orConditions.push(blockCondition);
	}
	if(req.query.name){
		const name = req.query.name; 
		var blockCondition = name ? { name: { [Op.like]: `%${name}%` } } : null;
		orConditions.push(blockCondition);
	}
	console.log(orConditions);
	if(_.size(orConditions) > 0){
		paramObj.where = { [Op.or]: orConditions };
	}
	paramObj.include = [Townships,Plots]
    try{
        let userData = await Blocks.findAll(paramObj)
		res.send({ status:1, data:userData, message: '' });
    }catch(err){
        res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while retrieving tutorials." });
    }
};


const doRemove = ( req, res ) =>{ 
	const id = req.query.id;
    try{
        Blocks.destroy({ where: { id: id } }).then(data => {
            res.send({ status:1, data:[], message:"Block deleted successfully."});
          }).catch(err => {
            res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
        });
    }catch(err){
        res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
    }
};

const bulkImport = async ( req, res ) =>{
	try{
		console.log(req.files);
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
				const blockData = data.map(row => ({
					townshipId: row['Township Name'],
					name: row['Block Name'],
					size: row['Size'],
				}))
				await Blocks.bulkCreate(blockData); 
				res.send({ status:1, data:[], message: "Block was registered successfully!" });
			}
	}catch(err){
		res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
	}
};

module.exports = {
    create,
    getAll,
	doRemove,
	bulkImport
};