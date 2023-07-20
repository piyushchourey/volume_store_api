const db = require("../models/index");
const RateCalculation = db.ratecalculations;
const Product = db.product;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const fs = require('fs');
const mime = require('mime');
const {  commonServices } = require("../middlewares");
require('dotenv').config();
const Sequelize = require("sequelize");
const sequelize = db.sequelize;
const XLSX = require("xlsx"); 
// console.log("process.env.RATE_CALC_RATE_EXTRA.cartage", JSON.parse(process.env.RATE_CALC_RATE_EXTRA));

const add = async (req, res) => {
    // Validate request
	try{
		if(!(_.isEmpty(req.body))){
			var RA_PostData = {
                client_id : req.body.clientName,
                totalPrice : req.body.totalPrice,
                isRARequired : req.body.isRARequired,
                productArr: req.body.productsArr
            };
			if(_.trim(RA_PostData.client_id)==""){
				res.send({ status:false, data:[], message: 'Client Id is required.' });
			}
			console.log(RA_PostData);
			RateCalculation.create(RA_PostData).then(async data => {
					RA_PostData.productArr.forEach(async object => {
						object['description'] = removeTags(object.description);
						if(RA_PostData.isRARequired > 0){
							let extraValue = JSON.parse(process.env.RATE_CALC_RATE_EXTRA);
							var addextra = []; 
							// let productDesc = await Product.findAll({ where: { id: object.product }, attributes: ['description']})
							// console.log(productDesc[0].description);
							// let description = productDesc[0].description;
							let cartage = +(object.total_price * extraValue.cartage).toFixed(2);
							let totalOfProduct  = +(+object.total_price + +cartage).toFixed(2);
							let installationCharge = +(+totalOfProduct * (+extraValue.installation)).toFixed(2); 
							let totalWithInstallation = +(+totalOfProduct + +installationCharge).toFixed(2);
							let profit =  +(+totalWithInstallation * +extraValue.overheadprofit).toFixed(2);
							let lwc = +(+profit * +extraValue.lwc).toFixed(2);
							let costpereach = (+totalWithInstallation + +profit +  +lwc).toFixed(2)
							addextra.push({cartage:cartage,totalOfProduct:totalOfProduct,installationCharge:installationCharge,totalWithInstallation:totalWithInstallation,profit:profit,lwc:lwc,costpereach:costpereach});
							object['otherCharges'] = addextra;
							object['finalCostEach'] = costpereach;
							// object['description'] = description;
							object.isExpand = false;
						}
						else{
							object['finalCostEach'] = 0;
						}
					});
				RA_PostData['last_insert_id'] = data.id;
                res.send({ status:true, data:RA_PostData, message: "RA was added successfully!" });
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

const genrateExcel = async(req,res) =>{
	let updatedData = req.body.productArr;
	await RateCalculation.update({RAData:updatedData},{
		where : { id : req.body.last_insert_id } 
	}).then(data => {
	
	if(req.body.isRARequired > 0){
			// Require library
	var excel = require('excel4node');

	// Create a new instance of a Workbook class
	var workbook = new excel.Workbook();

	// Add Worksheets to the workbook
	var worksheet = workbook.addWorksheet('RA');
	var worksheet2 = workbook.addWorksheet('Schedule');

	var otherChargesStyle= workbook.createStyle({font: {color: '#000000',size: 12,italics: true}});
	var normalStyle = workbook.createStyle({
		font: {
		color: '#000000',
		size: 12
		}
	});

	var headerStyle = workbook.createStyle({
	font: {
		color: '#FFFFFF',
		size: 12,
		bold: true
	},
	fill: {
		type: 'pattern',
		patternType: 'solid',
		fgColor: '#4472C4' // Set the background color here (e.g., red)
	}
	});

	// Create a reusable style
	var style = workbook.createStyle({
	font: {
		color: '#000000',
		size: 12
	},
	numberFormat: '₹ #,##0.00;₹ -#,##0.00'
	});

	var productDescStyle = workbook.createStyle({
		font: {
		color: '#000000',
		size: 12
		},
		alignment: {
			wrapText: true
		},
		numberFormat: '₹ #,##0.00;₹ -#,##0.00'
	});

	// worksheet.row(2).setHeight(220);
	worksheet.column(2).setWidth(50);
	worksheet.column(3).setWidth(30);
	worksheet.column(5).setWidth(25);
	worksheet.cell(1, 1, 1, 5, true).string('RA OF AUDIO SYSTEM AS PER (CPWD-FORMATE)').style({font: {color: '#000000',size: 12,bold: true },alignment:{ horizontal:['center']}});
	//Worksheet 2 Header row
	worksheet2.column(2).setWidth(50);
	worksheet2.column(3).setWidth(30);
	worksheet2.column(5).setWidth(25);

	worksheet2.cell(1, 1).string("S.N").style(headerStyle);
	worksheet2.cell(1, 2).string("Description of Item").style(headerStyle);
	worksheet2.cell(1, 3).string("Qty").style(headerStyle);
	worksheet2.cell(1, 4).string("Unit").style(headerStyle);
	worksheet2.cell(1, 5).string("Rate").style(headerStyle);
	worksheet2.cell(1, 6).string("Amount").style(headerStyle);
	var totalPrice =0;
	updatedData.forEach((array, i) => {
		console.log(array);
		let j = i+1;
		let col = (12 * i) + 2;
		let description = removeTags(array.description);
		// Set value of cell A1 to 100 as a number type styled with paramaters of style
		worksheet.cell(col,1).number(j).style(headerStyle);
		worksheet.cell(col,2).string("Product Description").style(headerStyle);
		worksheet.cell(col,3).string('Lowest Rate considered for rate analysis (Base rate)').style(headerStyle);
		worksheet.cell(col,4).string('QTY').style(headerStyle);
		worksheet.cell(col,5).string('Total').style(headerStyle);

		worksheet.cell(col+1,1).number(1).style(normalStyle);
		worksheet.row(col+1).setHeight(220);
		worksheet.cell(col+1,2).string(description).style(productDescStyle);
		worksheet.cell(col+1,3).number(+array.total_price).style(style);
		worksheet.cell(col+1,4).number(1).style(normalStyle);
		worksheet.cell(col+1,5).formula(`C${col+1} * D${col + 1}`).style(style);

		worksheet.cell(col+2,1).string("A1").style(style);
		worksheet.cell(col+2,2).string("MATERIALS").style(style);
		worksheet.cell(col+2,3).formula(`C${col+1}`).style(style);
		worksheet.cell(col+2,4).formula(`D${col+1}`).style(normalStyle);
		worksheet.cell(col+2,5).formula(`E${col+1}`).style(style);

		worksheet.cell(col+3,1).string("").style(style);
		worksheet.cell(col+3,2).string("Total of  A1").style(otherChargesStyle);
		worksheet.cell(col+3,3).string('').style(style);
		worksheet.cell(col+3,4).string('').style(style);
		worksheet.cell(col+3,5).formula(`E${col+2}`).style(style);

		worksheet.cell(col+4,1).string("").style(style);
		worksheet.cell(col+4,2).string("Add Cartage @ 1 %").style(otherChargesStyle);
		worksheet.cell(col+4,3).string('').style(style);
		worksheet.cell(col+4,4).string('').style(style);
		worksheet.cell(col+4,5).formula(`E${col+2} * 0.01`).style(style);

		worksheet.cell(col+5,1).string("").style(style);
		worksheet.cell(col+5,2).string("total of A").style(otherChargesStyle);
		worksheet.cell(col+5,3).string('').style(style);
		worksheet.cell(col+5,4).string('').style(style);
		worksheet.cell(col+5,5).formula(`E${col+3} + E${col+4}`).style(style);

		worksheet.cell(col+6,1).string("").style(style);
		worksheet.cell(col+6,2).string("Installation Charges 10 %").style(otherChargesStyle);
		worksheet.cell(col+6,3).string('').style(style);
		worksheet.cell(col+6,4).string('').style(style);
		worksheet.cell(col+6,5).formula(`E${col+5} * 0.1`).style(style);

		worksheet.cell(col+7,1).string("").style(style);
		worksheet.cell(col+7,2).string("Total A +B").style(otherChargesStyle);
		worksheet.cell(col+7,3).string('').style(style);
		worksheet.cell(col+7,4).string('').style(style);
		worksheet.cell(col+7,5).formula(`E${col+5} + E${col+6}`).style(style);

		worksheet.cell(col+8,1).string("").style(style);
		worksheet.cell(col+8,2).string("OVERHEADS & PROFIT @ 15% OF (A+B)").style(style);
		worksheet.cell(col+8,3).string('').style(style);
		worksheet.cell(col+8,4).string('').style(style);
		worksheet.cell(col+8,5).formula(`E${col+7} * 0.15`).style(style);

		worksheet.cell(col+9,1).string("").style(style);
		worksheet.cell(col+9,2).string("Add LWC @ 1 %").style(otherChargesStyle);
		worksheet.cell(col+9,3).string('').style(style);
		worksheet.cell(col+9,4).string('').style(style);
		worksheet.cell(col+9,5).formula(`E${col+8} * 0.01`).style(style);

		worksheet.cell(col+10,1).string("").style(style);
		worksheet.cell(col+10,2).string("COST PER  EACH").style(style);
		worksheet.cell(col+10,3).string('').style(style);
		worksheet.cell(col+10,4).string('').style(style);
		worksheet.cell(col+10,5).formula(`E${col+7} + E${col+8} + E${col+9}`).style(style);

		worksheet.cell(col+11,1).string("").style(style);
		worksheet.cell(col+11,2).string("Say  Rs.").style(style);
		worksheet.cell(col+11,3).string('').style(style);
		worksheet.cell(col+11,4).string('').style(style);
		worksheet.cell(col+11,5).formula(`+E${col+10},0`).style(style);

		//Prepare Sheet2 string
		worksheet2.cell(j+1, 1).number(j).style(normalStyle);
		worksheet2.cell(j+1, 2).string(description).style(productDescStyle);
		worksheet2.cell(j+1, 3).number(+array.qty).style(normalStyle);
		worksheet2.cell(j+1, 4).string(array.uom).style(style);
		worksheet2.cell(j+1, 5).number(+array.finalCostEach).style(style);
		worksheet2.cell(j+1, 6).formula(`E${j+1} * C${j+1}`).style(style);
		totalPrice+= +array.finalCostEach * +array.qty;
	});
		worksheet2.cell((updatedData.length)+2, 5).string("Total Amount").style(headerStyle);
		worksheet2.cell((updatedData.length)+2, 6).number(totalPrice).style({font: {color: '#FFFFFF',size: 12,bold: true},fill: {type: 'pattern',patternType: 'solid',fgColor: '#4472C4'},numberFormat: '₹ #,##0.00;₹ -#,##0.00'});

		let exportFileName = `excel/RA/`+Date.now()+`.xlsx`;
		workbook.write(exportFileName);
		res.status(200).send({status:true,msg:"Excel file genrated", path:process.env.API_URL+exportFileName});
	}else{
		// Require library
		var excel = require('excel4node');
		// Create a new instance of a Workbook class
		var workbook = new excel.Workbook();
		var worksheet2 = workbook.addWorksheet('Schedule');
		var headerStyle = workbook.createStyle({
			font: { color: '#FFFFFF', size: 12, bold: true },
			fill: { type: 'pattern', patternType: 'solid', fgColor: '#4472C4' }
		});
		var productDescStyle = workbook.createStyle({
			font: { color: '#000000', size: 12 },
			alignment: { wrapText: true },
			numberFormat: '₹ #,##0.00;₹ -#,##0.00'
		});
		// Create a reusable style
		var style = workbook.createStyle({
			font: { color: '#000000', size: 12 },
			numberFormat: '₹ #,##0.00;₹ -#,##0.00'
		});
		var normalStyle = workbook.createStyle({
			font: { color: '#000000', size: 12 }
		});
		//Worksheet 2 Header row
		worksheet2.column(2).setWidth(50);
		worksheet2.column(3).setWidth(30);
		worksheet2.column(5).setWidth(25);

		worksheet2.cell(1, 1).string("S.N").style(headerStyle);
		worksheet2.cell(1, 2).string("Description of Item").style(headerStyle);
		worksheet2.cell(1, 3).string("Qty").style(headerStyle);
		worksheet2.cell(1, 4).string("Unit").style(headerStyle);
		worksheet2.cell(1, 5).string("Rate").style(headerStyle);
		worksheet2.cell(1, 6).string("Amount").style(headerStyle);
		var totalPrice =0;
		updatedData.forEach((array, i) => {
			let j = i+1;
			//Prepare Sheet2 string
			worksheet2.cell(j+1, 1).number(j).style(normalStyle);
			worksheet2.cell(j+1, 2).string(array.description).style(productDescStyle);
			worksheet2.cell(j+1, 3).number(+array.qty).style(normalStyle);
			worksheet2.cell(j+1, 4).string(array.uom).style(style);
			worksheet2.cell(j+1, 5).number(+array.total_price).style(style);
			worksheet2.cell(j+1, 6).formula(`E${j+1} * C${j+1}`).style(style);
			totalPrice+= +array.total_price * +array.qty;
		});
		worksheet2.cell((updatedData.length)+2, 5).string("Total Amount").style(headerStyle);
		worksheet2.cell((updatedData.length)+2, 6).number(totalPrice).style({font: {color: '#FFFFFF',size: 12,bold: true},fill: {type: 'pattern',patternType: 'solid',fgColor: '#4472C4'},numberFormat: '₹ #,##0.00;₹ -#,##0.00'});

		let exportFileName = `excel/RA/`+Date.now()+`.xlsx`;
		workbook.write(exportFileName);
		res.status(200).send({status:true,msg:"Excel file genrated", path:process.env.API_URL+exportFileName});
	}
}).catch(err => { 
	res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while retrieving tutorials." }); 
});
}


function removeTags(str) {
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();
    return str.replace( /(<([^>]+)>)/ig, '');
}

module.exports = {
    add,
	genrateExcel
};


