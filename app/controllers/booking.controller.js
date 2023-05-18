const db = require("../models/index");
const Booking = db.booking;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const bodyParser = require('body-parser');
const fs = require('fs');
const mime = require('mime');
const Townships = db.townships;
const Blocks = db.blocks;
const Plots = db.plots;
const Brokers = db.broker;
var nodemailer = require('nodemailer');
const XLSX = require("xlsx"); 
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
  
  const fileFilter=(req, file, cb)=>{
	console.log("sdsads");
//    if(file.mimetype ==='csv' || file.mimetype ==='xls'){
// 	   cb(null,true);
//    }else{
// 	   cb(null, false);
//    }
  
  }
  
  var upload = multer({ 
	storage:storage
	// limits:{
	// 	fileSize: 1024 * 1024 * 5
	// },
	// fileFilter:fileFilter
  });
  
  const singleFileUpload = upload.single("importFile")





var mail = nodemailer.createTransport({
	host: "mail.bigblockinfra.com",
    port: 25,
    secure: false,
	auth: {
	  user: 'sales@bigblockinfra.com',
	  pass: 'Sales'
	},
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    },
  });

sentEmail = async (req,res,next) =>{
	try{
		if(!(_.isEmpty(req.body))){
			//Fetch aggrement
			let paramObj = {};
			var mailOptions = {
				from: 'sales@bigblockinfra.com',
				to: req.body.toEmail,
				subject: req.body.subject,
				html: req.body.content ,
			}
			paramObj.where = {id : req.body.bookingId };
			paramObj.attributes = [ 'agreementDoc'];
			let bookingData = await Booking.findOne(paramObj);
			bookingData = JSON.parse(JSON.stringify(bookingData));
			console.log(bookingData);
			if(!(_.isEmpty(bookingData)) && bookingData!=null ){
				mailOptions.attachments = [{
					filename: bookingData.agreementDoc,
					path: 'images/'+bookingData.agreementDoc,
					//contentType: 'application/pdf'
				  }]
			}
			/* Send an email method */
			mail.sendMail(mailOptions, function(error, info){
				if (error) {
					res.status(500).send({ status :0, data :[], message: error || "Some error occurred while retrieving tutorials." }); 
				} else {
					res.status(200).send({ status :1, data :[], message: "Email sent: "+ info.response }); 
				}
			});
		}
	}catch(err){
		res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while retrieving tutorials." }); 
	}
}

// Create and Save a new Township
const create = async (req, res) => {
	// Validate request
	try{
		if(!(_.isEmpty(req.body))){
			var bookingPostData = req.body;

			if(parseInt(bookingPostData.plotAmount) < parseInt(bookingPostData.bookingAmount)){
				res.send({ status:0, data:[], message:  "Please enter valid plot amount."});
			}

			if(parseInt(bookingPostData.plotAmount) < (parseInt(bookingPostData.cashPlotAmount) + parseInt(bookingPostData.checkPlotAmount))) {
				res.send({ status:0, data:[], message:  "Plot amount must be equal to Cash/Check amount."});
			}
            if(bookingPostData.brokerId==""){
				bookingPostData['brokerId'] = 0;
			}
			//documents upload functionality..
			var bookingPostFilteredData = {aadharcardDoc :null, salarySlipDoc:null, agreementDoc:null};
			var bookingPostFilteredData1 = _.pick(req.body, _.keys(bookingPostFilteredData));
			// let filename = await uploadImage(bookingPostFilteredData1);
			
			let aadharcarddoc =  sigleUploadImage({documents:bookingPostFilteredData1.aadharcardDoc});
			let salarySlipDoc =  sigleUploadImage({documents:bookingPostFilteredData1.salarySlipDoc});

			let agreementDoc =  sigleUploadImage({documents:bookingPostFilteredData1.agreementDoc});
			let newArray = await Promise.all([aadharcarddoc,salarySlipDoc,agreementDoc]);
			
			bookingPostData['aadharcardDoc'] = newArray[0];
			bookingPostData['salarySlipDoc'] = newArray[1];
			bookingPostData['agreementDoc'] = newArray[2];
			bookingPostData['remainingAmount'] = req.body.plotAmount - req.body.bookingAmount;
			// return false;
			Booking.create(bookingPostData).then(bookingData => {
				res.send({ status:1, data:[], message: "Plot booked successfully!" });
			}).catch(err => {
				res.status(500).send({ status:0, data:[], message: err.message });
			});
		}else{
			res.send({ status:0, data:[], message:  "Post data is not valid."});
		}
	}catch(err){
		res.status(500).send({ status:0, data:[], message: err.message });
	}
};

// Get all booking
const getAll = async (req, res) => {
	const orConditions = [];
	const paramObj = {};
	if(req.query.id){
		const bookingId = req.query.id; 
		var townshipCondition = bookingId ? { id: { [Op.eq]: `${bookingId}` } } : null;
		orConditions.push(townshipCondition);
	}
	if(req.query.townshipId){
		const townshipId = req.query.townshipId; 
		var townshipCondition = townshipId ? { townshipId: { [Op.eq]: `${townshipId}` } } : null;
		orConditions.push(townshipCondition);
	}
	if(req.query.blockId){
		const blockId = req.query.blockId;
		var blockIdCondition = blockId ? { blockId: { [Op.eq]: `${blockId}` } } : null;
		orConditions.push(blockIdCondition);
	}
	if(req.query.plotId){
		const plotId = req.query.plotId;
		var plotIdCondition = plotId ? { plotId: { [Op.eq]: `${plotId}` } } : null;
		orConditions.push(plotIdCondition);
	}
	if(req.query.status){
		const status = req.query.status;
		var statusCondition = status ? { status: { [Op.eq]: `%${status}%` } } : null;
		orConditions.push(statusCondition);
	}
	if(req.query.userId){
		const userId = req.query.userId;
		var userIdCondition = userId ? { userId: { [Op.eq]: `${userId}` } } : null;
		orConditions.push(userIdCondition);
	}
	console.log(orConditions);
	if(_.size(orConditions) > 0){
		paramObj.where = { [Op.or]: orConditions };
	}

	paramObj.include = [Townships,Blocks,Plots,Brokers];
	let userData = await Booking.findAll(paramObj)
	const promises1 =  userData.map(async (f) => {
		f.agreementDoc =  process.env.API_URL+'images/'+f.agreementDoc;
		f.salarySlipDoc =  process.env.API_URL+'images/'+f.salarySlipDoc;
		f.aadharcardDoc =  process.env.API_URL+'images/'+f.aadharcardDoc;
		return f;
	 })
	let newArray = await Promise.all(promises1);
	res.send({ status:1, data:newArray, message: '' });
};

/* This function is used to upload image.. */
const uploadImage = async (req, res, callback) => {
	// to declare some path to store your converted image
	  var response = {}; 
	_.forEach(req, async function(value, key) {
		// to declare some path to store your converted image
		var matches = req[key].match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
		if (matches.length !== 3) {
			return new Error('Invalid input string');
		}
		let type = matches[1];
		let imageBuffer = new Buffer(matches[2], 'base64');
		let extension = mime.getExtension(type); 
		let randomName = new Date().getTime();
		let fileName = randomName +"." + extension;
		try {
			fs.writeFileSync("./images/" + fileName, imageBuffer, 'utf8');
			response[key] = fileName;
			
			// console.log(req, response);
			console.log(Object.keys(req), Object.keys(response) )
			if(Object.keys(req).length == Object.keys(response).length ){
				console.log("final check")
				return response;
			}
		} catch (e) {
			callback(e); 
		}
	});
}

const sigleUploadImage = async (req, res, next) => {
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
	Booking.destroy({ where: { id: id } })
	.then(data => { res.send({ status:1, data:[], message:"Booking Entry deleted successfully."}); })
	 .catch(err => {
		res.status(500).send({
		  status :0,
		  data : [],
		  message:
			err.message || "Some error occurred while retrieving tutorials."
		});
	  });
};

/** This function is used to update booking data **/
const doUpdate = async (req,res,next) =>{
	const Postdata = req.body;
	if(req.body.brokerId==""){
		req.body = _.omit(req.body,['brokerId'])
	}
	let UpdateBookingDataExceptID = _.omit(req.body, ['townshipId','blockId','plotId','aadharcardDoc','salarySlipDoc','commission_type_amount']);
	let UpdateBookingDataOfID = _.pick(req.body, ['id']);
	try{
		if(Postdata.plotAmount < Postdata.bookingAmount){
			res.send({ status:0, data:[], message:  "Please enter valid plot amount."});
		}
		if(Postdata.plotAmount < (Postdata.cashPlotAmount + Postdata.checkPlotAmount)) {
			res.send({ status:0, data:[], message:  "Plot amount must be equal to Sum of Cash/Check amount."});
		}
		const bookingExistData = await Booking.findByPk(UpdateBookingDataOfID.id);
		console.log(bookingExistData);
		if(bookingExistData){
			let matches = (Postdata.agreementDoc).match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
			if (matches.length === 3) {
				let imgObj = {};
				imgObj['documents'] = Postdata.agreementDoc;
				var ImageFileName = await sigleUploadImage(imgObj)
				UpdateBookingDataExceptID['agreementDoc']= ImageFileName; 
			}
			console.log(UpdateBookingDataExceptID);
			await Booking.update(UpdateBookingDataExceptID,{
				where : { id : UpdateBookingDataOfID.id } 
			}).then(data => {
					res.send({ status:1, data:data, message: 'Booking updated successfully.' });
			}).catch(err => { 
				res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while retrieving tutorials." }); 
			});
		}else{
			res.status(500).send({ status :0, data :[], message: "This booking ID is not exist in our DB." }); 
		}
	}catch(err){
		res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while retrieving tutorials." }); 
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
				const bookingData = data.map(row => ({
					townshipId: row['Township Name'],
					blockId: row['Block Name'],
					plotId: row['Plot Number'],
					brokerId : row['Broker Name'],
					client_name : row['Client Name'],
					email : row['Email Address'],
					mobile : row['Mobile Number'],
					aadharcardNumber : row['Aadhar Card Number'],
					plotAmount: row['Plot Amount'] =='' ? 0 : row['Plot Amount'],
					cashPlotAmount: row['Cash Plot Amount'] =='' ? 0 : row['Cash Plot Amount'],
					checkPlotAmount: row['Cheque Plot Amount'] =='' ? 0 : row['Cheque Plot Amount'],
					bookingAmount: row['Booking Amount'] =='' ? 0 : row['Booking Amount'],
					cashAmountReceived: row['Cash Booking Amount'] =='' ? 0 : row['Cash Booking Amount'],
					checkAmountReceived: row['Cheque Booking Amount'] =='' ? 0 : row['Cheque Booking Amount'],
					commission_type_amount: row['Commission Type Amount'] =='' ? 0 : row['Commission Type Amount'],
					remainingAmount: row['Plot Amount'] - row['Amount Received'],
					commission_type: row['Commission Type'],
					commission_amount: row['Commission Amount'],
					paymentMode: row['Payment Mode'],
					description: row['Description'],
					status : row['Registry status'] =='Done' ? 1 : 0,
				}))
				console.log(bookingData);
				await Booking.bulkCreate(bookingData); 
				res.send({ status:1, data:[], message: "Booking was uploaded successfully!" });
			}
	}catch(err){
		res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while retrieving tutorials." });
	}
};



module.exports = {
    create,
    getAll,
	doUpdate,
	doRemove,
	sentEmail,
	bulkImport
};