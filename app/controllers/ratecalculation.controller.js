const db = require("../models/index");
const RateCalculation = db.ratecalculations;
const SOR = db.sor;
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
			//console.log(RA_PostData);
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

const updateEstimateCost = async(req,res)=>{
	let postData = req.body;
	console.log(postData);
	let SORS_ID = _.pick(postData, ['SORID']);
	let UpdateRCPostData = postData;
	UpdateRCPostData = _.omit(UpdateRCPostData, ['SORID']);
	console.log(UpdateRCPostData);
	
    await SOR.update(UpdateRCPostData,{
		where : { id : SORS_ID.SORID } 
	}).then(data => {
		res.status(200).send({ status:1, data:data, message: '' });
	});
}

function calculateCostPerEach(totalA1) {
    const cartageRate = 0.01; // 1%
    const installationRate = 0.10; // 10%
    const overheadsRate = 0.15; // 15%
    const lwcRate = 0.01; // 1%

    const cartage = parseFloat(totalA1) * cartageRate;
    const totalA = parseFloat(totalA1) + cartage;
    const installationCharges = totalA * installationRate;
    const totalAB = totalA + installationCharges;
    const overheadsProfit = totalAB * overheadsRate;
    const lwc = totalAB * lwcRate;
    const costPerEach = totalAB + overheadsProfit + lwc;

    return costPerEach.toFixed(2); // Return the final value formatted to 2 decimal places
}


const genrateExcel = async(req,res) =>{
	let productArr = req.body.productArr;
	const servicePostDataArr = req.body.serviceWiseArr;
	const Lowest_PriceArr = req.body.Lowest_PriceArr;
	//var postData =  getLowestPriceObjects(req.body.updatedData,req.body.priceCompareFlagArr);
	//let updatedData1 = separateByServiceId(updatedData);
	var excel = require('excel4node');
	var workbook = new excel.Workbook();
	/**
	 * Quotation 1 sheet creation...
	 */
	var headerStyle = workbook.createStyle({
		font: { color: '#FFFFFF', size: 12, bold: true },
		fill: { type: 'pattern', patternType: 'solid', fgColor: '#4472C4' },
		alignment: { horizontal: 'center' } 
	});

	var normalStyle = workbook.createStyle({ font: { color: '#000000', size: 12 }, alignment: { horizontal: 'left' } });
	var otherChargesStyle= workbook.createStyle({font: {color: '#000000',size: 12,italics: true}});
	var normalStyle = workbook.createStyle({ font: { color: '#000000', size: 12 } });
	var style = workbook.createStyle({ font: { color: '#000000', size: 12 }, numberFormat: '₹ #,##0.00;₹ -#,##0.00' });
	var productDescStyle = workbook.createStyle({ font: { color: '#000000', size: 12 }, alignment: { wrapText: true }, numberFormat: '₹ #,##0.00;₹ -#,##0.00' });

	/** Quatations logic start here  */

	var QuotationArr = ['QUOTATION 1','QUOTATION 2','QUOTATION 3'];
	QuotationArr.forEach(async (element, index) => {
		//console.log(element); console.log(index);
		const RAWorksheet = workbook.addWorksheet(element);
		// Set column widths
		RAWorksheet.row(1).setHeight(20);
		RAWorksheet.column(2).setWidth(50);
		RAWorksheet.column(3).setWidth(30);
		RAWorksheet.column(5).setWidth(25);

		// Merge cells and set title  
		RAWorksheet.cell(1, 1, 1, 6, true).string(`${element} (Make ${index + 1})`).style({ font: { color: '#FFFFFF', size: 12, bold: true }, fill: { type: 'pattern', patternType: 'solid', fgColor: '#70AD47' }, alignment: { horizontal: 'center' } });
		
		RAWorksheet.cell(2, 1).string("S.N").style(headerStyle);
		RAWorksheet.cell(2, 2).string("Description of Item").style(headerStyle);
		RAWorksheet.cell(2, 3).string("Qty").style(headerStyle);
		RAWorksheet.cell(2, 4).string("Unit").style(headerStyle);
		RAWorksheet.cell(2, 5).string("Rate").style(headerStyle);
		RAWorksheet.cell(2, 6).string("Amount").style(headerStyle);

		let items = productArr.map(innerArray => innerArray[index]);
		let QuationColumn = 3; let totalPrice = 0;
		items.forEach((item, index) => {
			RAWorksheet.cell(QuationColumn,1).number(index+1).style(normalStyle);
			RAWorksheet.cell(QuationColumn,2).string(item.quotationDesc).style({ font: { color: '#000000', size: 12 }, alignment: { wrapText: true}});
			RAWorksheet.cell(QuationColumn,3).number(1).style(normalStyle);
			RAWorksheet.cell(QuationColumn,4).string(item.unit).style(normalStyle);
			RAWorksheet.cell(QuationColumn,5).string(item.price).style(normalStyle);
			RAWorksheet.cell(QuationColumn,6).string(item.price).style(normalStyle);
			QuationColumn++;
			totalPrice += parseFloat(item.price);
		});
		//console.log('QuationColumn',QuationColumn);
		//console.log("totalPrice",totalPrice);
		RAWorksheet.cell((QuationColumn+1), 5).string("Total").style(headerStyle);
		RAWorksheet.cell((QuationColumn+1), 6).number(totalPrice).style(normalStyle);
	});

	/** Quatations logic end here */

	/** Comparative logic start here */
	const comparative_Worksheet = workbook.addWorksheet("Comparative");
	
	comparative_Worksheet.row(1).setHeight(20);
	comparative_Worksheet.row(2).setHeight(35); 
	comparative_Worksheet.column(2).setWidth(30);
	comparative_Worksheet.column(3).setWidth(15);
	comparative_Worksheet.column(4).setWidth(30);
	comparative_Worksheet.column(5).setWidth(15);
	comparative_Worksheet.column(6).setWidth(25);
	comparative_Worksheet.column(7).setWidth(15);
	comparative_Worksheet.column(8).setWidth(30);

	// Merge cells and set title  
	comparative_Worksheet.cell(1, 1, 1, 8, true).string(`Comparative products`).style({ font: { color: '#FFFFFF', size: 12, bold: true }, fill: { type: 'pattern', patternType: 'solid', fgColor: '#70AD47' }, alignment: { horizontal: 'center' } });

	comparative_Worksheet.cell(2, 1).string("S.N").style(headerStyle);
	comparative_Worksheet.cell(2, 2).string("Make model 1").style(headerStyle);
	comparative_Worksheet.cell(2, 3).string("Base Price").style(headerStyle);
	comparative_Worksheet.cell(2, 4).string("Make model 2").style(headerStyle);
	comparative_Worksheet.cell(2, 5).string("Base Price").style(headerStyle);
	comparative_Worksheet.cell(2, 6).string("Make model 3").style(headerStyle);
	comparative_Worksheet.cell(2, 7).string("Base Price").style(headerStyle);
	comparative_Worksheet.cell(2, 8).string("Lowest Rate considered for rate analysis (Base rate)").style({ font: { color: '#FFFFFF', size: 12, bold: true }, fill: { type: 'pattern', patternType: 'solid', fgColor: '#4472C4' }, alignment: { horizontal: 'center', wrapText:true } });
	let comparativeWorksheetColumn = 3; let row = 2;
	Lowest_PriceArr.forEach((item, index) => {
		comparative_Worksheet.row(row).setHeight(25);
		comparative_Worksheet.cell(comparativeWorksheetColumn,1).number(index+1).style(normalStyle);
		comparative_Worksheet.cell(comparativeWorksheetColumn,2).string(item.Make_Model1).style({ font: { color: '#000000', size: 12 }, alignment: { wrapText: true}});
		comparative_Worksheet.cell(comparativeWorksheetColumn,3).string(item.Base_Price1).style({ font: { color: '#000000', size: 12 }, alignment: { horizontal: 'left' }, numberFormat: '₹#,##0.00; (₹#,##0.00); -', });
		comparative_Worksheet.cell(comparativeWorksheetColumn,4).string(item.Make_Model2).style(normalStyle);
		comparative_Worksheet.cell(comparativeWorksheetColumn,5).string(item.Base_Price2).style({ font: { color: '#000000', size: 12 }, alignment: { horizontal: 'left' }, numberFormat: '₹#,##0.00; (₹#,##0.00); -', });
		comparative_Worksheet.cell(comparativeWorksheetColumn,6).string(item.Make_Model3).style(normalStyle);
		comparative_Worksheet.cell(comparativeWorksheetColumn,7).string(item.Base_Price3).style({ font: { color: '#000000', size: 12 }, alignment: { horizontal: 'left' }, numberFormat: '₹#,##0.00; (₹#,##0.00); -', });
		comparative_Worksheet.cell(comparativeWorksheetColumn,8).number(+item.lowestPrice).style({ font: { color: '#000000', size: 12 }, alignment: { horizontal: 'left' }, numberFormat: '₹#,##0.00; (₹#,##0.00); -', });
		comparativeWorksheetColumn++; row++;
	});
	/** Comparative logic end here */

	/** RA RAWorksheet creation */
	var RAWorksheet = workbook.addWorksheet('RA');
	RAWorksheet.column(2).setWidth(50);
	RAWorksheet.column(3).setWidth(30);
	RAWorksheet.column(5).setWidth(25);
	RAWorksheet.cell(1, 1, 1, 5, true).string(`RA OF AUDIO SYSTEM AS PER (CPWD-FORMATE)`).style({ font: { color: '#FFFFFF', size: 12, bold: true }, fill: { type: 'pattern', patternType: 'solid', fgColor: '#70AD47' }, alignment: { horizontal: 'center' } });
	RAWorksheet.cell(2, 1).string("S.N").style(headerStyle);
	RAWorksheet.cell(2, 2).string("Product Description").style(headerStyle);
	RAWorksheet.cell(2, 3).string("Lowest Rate considered for rate analysis (Base rate)").style(headerStyle);
	RAWorksheet.cell(2, 4).string("QTY").style(headerStyle);
	RAWorksheet.cell(2, 5).string("Total").style(headerStyle);
	
	// Convert the object to an array of entries
	const RAPostItemsArr = Object.values(servicePostDataArr);
	console.log(RAPostItemsArr);
	var totalPrice =0; var scheduleTotalAmount = 0;
	RAPostItemsArr.forEach(async (array, i) => {
	
		let j = i+1;
		let col = (12 * i) + 2;
		
		/** Schedule sheet creation */
		var ScheduleWorksheet = workbook.addWorksheet(array.serviceId);
		ScheduleWorksheet.column(2).setWidth(50);
		ScheduleWorksheet.column(3).setWidth(10);
		ScheduleWorksheet.column(5).setWidth(25);
		ScheduleWorksheet.column(6).setWidth(30);

		ScheduleWorksheet.cell(1, 1).string("S.N").style(headerStyle);
		ScheduleWorksheet.cell(1, 2).string("Description of Item").style(headerStyle);
		ScheduleWorksheet.cell(1, 3).string("Qty").style(headerStyle);
		ScheduleWorksheet.cell(1, 4).string("Unit").style(headerStyle);
		ScheduleWorksheet.cell(1, 5).string("Rate").style(headerStyle);
		ScheduleWorksheet.cell(1, 6).string("Amount").style(headerStyle);


		let description = 'Lowest Rate considered for rate analysis';
		// Set value of cell A1 to 100 as a number type styled with paramaters of style
		RAWorksheet.cell(col,1).number(j).style(headerStyle);
		RAWorksheet.cell(col,2).string("Product Description").style(headerStyle);
		RAWorksheet.cell(col,3).string('Lowest Rate considered for rate analysis (Base rate)').style(headerStyle);
		RAWorksheet.cell(col,4).string('QTY').style(headerStyle);
		RAWorksheet.cell(col,5).string('Total').style(headerStyle);

		RAWorksheet.cell(col+1,1).number(1).style(normalStyle);
		RAWorksheet.row(col+1).setHeight(120);
		RAWorksheet.cell(col+1,2).string(array.description).style(productDescStyle);
		RAWorksheet.cell(col+1,3).number(+array.price).style(style);
		RAWorksheet.cell(col+1,4).number(1).style(normalStyle);
		RAWorksheet.cell(col+1,5).formula(`C${col+1} * D${col + 1}`).style(style);

		RAWorksheet.cell(col+2,1).string("A"+j).style(style);
		RAWorksheet.cell(col+2,2).string("MATERIALS").style(style);
		RAWorksheet.cell(col+2,3).formula(`C${col+1}`).style(style);
		RAWorksheet.cell(col+2,4).formula(`D${col+1}`).style(normalStyle);
		RAWorksheet.cell(col+2,5).formula(`E${col+1}`).style(style);

		RAWorksheet.cell(col+3,1).string("").style(style);
		RAWorksheet.cell(col+3,2).string("Total of  A1").style(otherChargesStyle);
		RAWorksheet.cell(col+3,3).string('').style(style);
		RAWorksheet.cell(col+3,4).string('').style(style);
		RAWorksheet.cell(col+3,5).formula(`E${col+2}`).style(style);

		RAWorksheet.cell(col+4,1).string("").style(style);
		RAWorksheet.cell(col+4,2).string("Add Cartage @ 1 %").style(otherChargesStyle);
		RAWorksheet.cell(col+4,3).string('').style(style);
		RAWorksheet.cell(col+4,4).string('').style(style);
		RAWorksheet.cell(col+4,5).formula(`E${col+2} * 0.01`).style(style);

		RAWorksheet.cell(col+5,1).string("").style(style);
		RAWorksheet.cell(col+5,2).string("total of A").style(otherChargesStyle);
		RAWorksheet.cell(col+5,3).string('').style(style);
		RAWorksheet.cell(col+5,4).string('').style(style);
		RAWorksheet.cell(col+5,5).formula(`E${col+3} + E${col+4}`).style(style);

		RAWorksheet.cell(col+6,1).string("").style(style);
		RAWorksheet.cell(col+6,2).string("Installation Charges 10 %").style(otherChargesStyle);
		RAWorksheet.cell(col+6,3).string('').style(style);
		RAWorksheet.cell(col+6,4).string('').style(style);
		RAWorksheet.cell(col+6,5).formula(`E${col+5} * 0.1`).style(style);

		RAWorksheet.cell(col+7,1).string("").style(style);
		RAWorksheet.cell(col+7,2).string("Total A +B").style(otherChargesStyle);
		RAWorksheet.cell(col+7,3).string('').style(style);
		RAWorksheet.cell(col+7,4).string('').style(style);
		RAWorksheet.cell(col+7,5).formula(`E${col+5} + E${col+6}`).style(style);

		RAWorksheet.cell(col+8,1).string("").style(style);
		RAWorksheet.cell(col+8,2).string("OVERHEADS & PROFIT @ 15% OF (A+B)").style(style);
		RAWorksheet.cell(col+8,3).string('').style(style);
		RAWorksheet.cell(col+8,4).string('').style(style);
		RAWorksheet.cell(col+8,5).formula(`E${col+7} * 0.15`).style(style);

		RAWorksheet.cell(col+9,1).string("").style(style);
		RAWorksheet.cell(col+9,2).string("Add LWC @ 1 %").style(otherChargesStyle);
		RAWorksheet.cell(col+9,3).string('').style(style);
		RAWorksheet.cell(col+9,4).string('').style(style);
		RAWorksheet.cell(col+9,5).formula(`E${col+8} * 0.01`).style(style);

		RAWorksheet.cell(col+10,1).string("").style(style);
		RAWorksheet.cell(col+10,2).string("COST PER  EACH").style(style);
		RAWorksheet.cell(col+10,3).string('').style(style);
		RAWorksheet.cell(col+10,4).string('').style(style);
		RAWorksheet.cell(col+10,5).formula(`E${col+7} + E${col+8} + E${col+9}`).style(style);
 
		RAWorksheet.cell(col+11,1).string("").style(style);
		RAWorksheet.cell(col+11,2).string("Say  Rs.").style(style);
		RAWorksheet.cell(col+11,3).string('').style(style);
		RAWorksheet.cell(col+11,4).string('').style(style);
		RAWorksheet.cell(col+11,5).formula(`+E${col+10},0`).style(style);

		//let scheduleAmount = calculateCostPerEach(array.price);
		let priceAmount = +array.price;
		let scheduleAmount = ((priceAmount + (priceAmount*0.01)) + ((priceAmount + (priceAmount*0.01)) *0.1)) + (((priceAmount + (priceAmount*0.01)) + ((priceAmount + (priceAmount*0.01)) *0.1)) *0.15) + ((((priceAmount + (priceAmount*0.01)) + ((priceAmount + (priceAmount*0.01)) *0.1)) *0.15) * 0.01);

		//Prepare Sheet2 string
		ScheduleWorksheet.cell(j+1, 1).number(j).style(normalStyle);
		ScheduleWorksheet.cell(j+1, 2).string(array.description).style(productDescStyle);
		ScheduleWorksheet.cell(j+1, 3).number(1).style(normalStyle);
		ScheduleWorksheet.cell(j+1, 4).string(array.unit).style(style);
		ScheduleWorksheet.cell(j+1, 5).string(scheduleAmount.toFixed(2)).style(style);
		ScheduleWorksheet.cell(j+1, 6).formula(`E${j+1} * C${j+1}`).style(style);

		totalPrice+= +array.price * 1;
		scheduleTotalAmount += parseFloat(scheduleAmount.toFixed(2));
		ScheduleWorksheet.cell((RAPostItemsArr.length)+2, 5).string("Total Amount").style(headerStyle);
		ScheduleWorksheet.cell((RAPostItemsArr.length)+2, 6).formula(`SUM(F2:F${RAPostItemsArr.length + 1})`).style({font: {color: '#FFFFFF',size: 12,bold: true},fill: {type: 'pattern',patternType: 'solid',fgColor: '#4472C4'},numberFormat: '₹ #,##0.00;₹ -#,##0.00'});	
	});
	
	console.log({inprogressSteps:req.body.inprogressSteps, totalCost:scheduleTotalAmount.toFixed(2)});
	await SOR.update({inprogressSteps:req.body.inprogressSteps, totalCost:scheduleTotalAmount.toFixed(2)},{
		where : { id : req.body.SOR_ID } 
	});
	let exportFileName = `excel/RA/` + Date.now() + `.xlsx`;
	workbook.write(exportFileName);
	res.status(200).send({ status: true, msg: "Excel file generated", path: process.env.API_URL + exportFileName, data:{inprogressSteps:req.body.inprogressSteps, totalCost:scheduleTotalAmount.toFixed(2),  SORID : req.body.SOR_ID } });
};

function removeTags(str) {
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();
    return str.replace( /(<([^>]+)>)/ig, '');
}

function separateByServiceId(data) {
    return data.flat().reduce((acc, item) => {
        const { serviceId, price } = item;
        if (!acc[serviceId] || parseFloat(price) < parseFloat(acc[serviceId].price)) {
            acc[serviceId] = item;
        }
        return acc;
    }, {});
}

function getLowestPriceObjects(data, flags) {
	return data.map((row, rowIndex) => {
		if (!flags[rowIndex]) {
		  return null; // Skip rows where flag is false
		}
  
		return row.reduce((minItem, currentItem) => {
		  return parseFloat(currentItem.price) < parseFloat(minItem.price) ? currentItem : minItem;
		});
	  })
	  .filter(row => row !== null); // Remove skipped rows
  }

module.exports = {
    add,
	genrateExcel,
	updateEstimateCost
};


