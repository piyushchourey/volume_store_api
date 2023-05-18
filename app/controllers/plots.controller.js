const db = require("../models/index");
const Plots = db.plots;
const Townships = db.townships;
const Blocks = db.blocks;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');
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
	try{
		if(!(_.isEmpty(req.body))){
			var PlotPostData = req.body;
			var ImageFileName = await uploadImage(req.body)
			PlotPostData['documents']= ImageFileName;
			Plots.create(PlotPostData).then(plot => {
					res.send({ status :1, data:[], message: "Plot was registered successfully!" });
			}).catch(err => {
				res.status(500).send({ status :0, data :[], message: err.message });
			});
		}else{
			res.send({ status :0, data :[], message: "Post data is not valid." });
		}
	}catch(err){
		res.status(500).send({ status :0, data :[], message: err.message });
	}
};

// Get all plots 
const getAll = async (req, res) => {
	const orConditions = [];
	const paramObj = { include: [Townships] };
	if(req.query.id){
		const id = req.query.id; 
		var townshipCondition = id ? { id: { [Op.eq]: id } } : null;
		orConditions.push(townshipCondition);
	}
	if(req.query.townshipId){
		const townshipId = req.query.townshipId; 
		var townshipCondition = townshipId ? { townshipId: { [Op.eq]: `${townshipId}` } } : null;
		orConditions.push(townshipCondition);
	}
	if(req.query.plot_number){
		const plot_number = req.query.plot_number;
		var plot_numberCondition = plot_number ? { plot_number: { [Op.eq]: `${plot_number}` } } : null;
		orConditions.push(plot_numberCondition);
	}
	if(req.query.plot_status){
		const plot_status = req.query.plot_status;
		var plot_statusCondition = plot_status ? { plot_status: { [Op.eq]: `${plot_status}` } } : null;
		orConditions.push(plot_statusCondition);
	}
	if(req.query.status){
		const status = req.query.status;
		var statusCondition = status ? { status: { [Op.eq]: `${status}` } } : null;
		orConditions.push(statusCondition);
	}
	console.log(orConditions);
	if(_.size(orConditions) > 0){
		paramObj.where = { [Op.and]: orConditions };
	}
	paramObj.include = [Blocks,Townships]
	console.log(paramObj);
	try {
		let userData = await Plots.findAll(paramObj)
		const promises1 =  userData.map(async (f) => {
			f.documents =  process.env.API_URL+'images/'+f.documents;
			return f;
		})
		let newArray = await Promise.all(promises1);
		res.send({ status:1, data:newArray, message: '' });
	  
	}catch(err){
		res.status(500).send({ status :0, data :[], message: err.message });
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

const doRemove = ( req, res ) =>{ 
	const id = req.query.id;
	try{}catch(err){
		res.status(500).send({ status :0, data :[], message: err.message });
	}
	Plots.destroy({ where: { id: id } })
	.then(data => { res.send({ status:1, data:[], message:"Plot deleted successfully."}); })
	 .catch(err => {
		res.status(500).send({
		  status :0,
		  data : [],
		  message:
			err.message || "Some error occurred while retrieving tutorials."
		});
	  });
};

const doUpdate = async (req,res,next) =>{
	console.log(req.body);
	let UpdateplotDataExceptID = _.omit(req.body, ['id','townshipId','documents']);
	let UpdateplotDataDataOfID = _.pick(req.body, ['id']);
	try{
		const plotExistData = await Plots.findByPk(UpdateplotDataDataOfID.id);
		if(plotExistData){
			await Plots.update(UpdateplotDataExceptID,{
				where : { id : UpdateplotDataDataOfID.id } 
			}).then(data => {
					res.send({ status:1, data:data, message: 'Plot updated successfully.' });
			}).catch(err => { 
				res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while retrieving tutorials." }); 
			});
		}else{
			res.status(500).send({ status :0, data :[], message: "This plot is not exist in our DB." }); 
		}
		
	}catch(err){
		res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while retrieving tutorials." }); 
	}
}

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
				const PlotData = data.map(row => ({
					townshipId: row['Township Name'],
					blockId: row['Block Name'],
					plot_number: row['Plot number'],
					dimesion: row['Size'],
					plot_status: row['Plot status'],
					selling_amount: row['Selling Amount'],
					description: row['Description'],
				}))
				await Plots.bulkCreate(PlotData); 
				res.send({ status:1, data:[], message: "Plots was registered successfully!" });
			}
	}catch(err){
		res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
	}
};


module.exports = {
    create,
    getAll,
	doRemove,
	doUpdate,
	bulkImport
};
