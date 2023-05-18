const db = require("../models/index");
const Booking = db.booking;
const Op = db.Sequelize.Op;
var _ = require('lodash');
const Townships = db.townships;
const Blocks = db.blocks;
const Plots = db.plots;
const Brokers = db.broker;
const Sequelize = require("sequelize");
const sequelize = db.sequelize;
const XLSX = require("xlsx"); 

const getReport = async (req, res) => {
    if(req.query.filteredBy == "townships"){
		query = `SELECT township.township_name as township_name, township.total_size_of_township as saleable_area, booking.description, SUM(bookingAmount) AS bookingAmount, SUM(plotAmount) AS plotAmount, SUM(commission_amount) AS commission_amount, SUM(remainingAmount) AS remainingAmount, SUM(dimesion) AS areaSold FROM bookings AS booking LEFT OUTER JOIN townships AS township ON booking.townshipId = township.id LEFT OUTER JOIN plots AS plot ON booking.plotId = plot.id GROUP BY booking.townshipId;`
	}
    if(req.query.filteredBy == "blocks"){
		query = `SELECT township.township_name as township_name, block.name as block_name, block.size as saleable_area, SUM(bookingAmount) AS bookingAmount, SUM(plotAmount) AS plotAmount, SUM(commission_amount) AS commission_amount, SUM(remainingAmount) AS remainingAmount, SUM(dimesion) AS areaSold FROM bookings AS booking LEFT OUTER JOIN townships AS township ON booking.townshipId = township.id LEFT OUTER JOIN plots AS plot ON booking.plotId = plot.id LEFT OUTER JOIN blocks AS block ON booking.blockId = block.id  GROUP BY booking.blockId;`
	}
    if(req.query.filteredBy == "plots"){
		query = `SELECT township.township_name as township_name, plot.plot_number as plot_number, booking.plotAmount as plot_amount, booking.bookingAmount AS bookingAmount, booking.commission_amount AS commission_amount, booking.remainingAmount AS remainingAmount, booking.description as description, plot.dimesion as plot_size, broker.first_name, broker.last_name  FROM bookings AS booking LEFT OUTER JOIN townships AS township ON booking.townshipId = township.id LEFT OUTER JOIN plots AS plot ON booking.plotId = plot.id LEFT OUTER JOIN brokers as broker ON booking.brokerId = broker.id ORDER BY booking.createdAt;`
    }
    if(req.query.filteredBy == "brokers"){
        query = `SELECT broker.first_name, broker.last_name, COUNT(booking.plotID) as number_of_plot, SUM(bookingAmount) AS bookingAmount, SUM(plotAmount) AS plotAmount, SUM(commission_amount) AS commission_amount, SUM(remainingAmount) AS remainingAmount FROM bookings AS booking LEFT OUTER JOIN brokers AS broker ON booking.brokerId = broker.id GROUP BY booking.brokerId;`
	}
    resultData = await sequelize.query(query, { type: Sequelize.SELECT });
	res.send({ status:1, data:resultData, message: '' })
};

const getDashboardWidgetData = async (req, res) => {
	let responseObj = {};
	try{
		let townshipsData = await Townships.findAll({
			attributes:[
				[ Sequelize.fn('Count', Sequelize.col('id')), 'count']]
		});
		responseObj.total_townships = townshipsData;

		/** Total brokers **/
		let brokersData = await Brokers.findAll({
			attributes:[
				[ Sequelize.fn('Count', Sequelize.col('id')), 'count']]
		});
		responseObj.total_brokers = brokersData;

		/** Total Plots **/
		let plotsData = await Plots.findAll({
			attributes:[
				[ Sequelize.fn('Count', Sequelize.col('id')), 'count']]
		});
		responseObj.total_plots = plotsData;

		/** Total Bookings **/
		let bookingData = await Booking.findAll({
			attributes:[
				[ Sequelize.fn('Count', Sequelize.col('id')), 'count']]
		});
		responseObj.total_bookings = bookingData;

		res.send({ status:1, data:responseObj, message: '' });

	}catch(err){
		res.send({ status:0, data:[], message: err.message })
	}
};
 
const getDashboardReportChart = async (req, res) =>{
	const response = { data:[], label:'Booking', lable:[]};
	try{
		/** Total Plots **/
		let plotsData = await Booking.findAll({
			attributes:[
				[ Sequelize.fn('YEAR', Sequelize.col('createdAt')), 'Year'],
				[ Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'Month'],
				[ Sequelize.fn('MONTHNAME', Sequelize.col('createdAt')), 'MonthName'],
				[ Sequelize.fn('Count', Sequelize.col('id')), 'total_booking']
			],
			group : ['Month','Year']
		});

		//data = _.pick(plotsData.dataValues,'total_booking');

		plotsData = JSON.parse(JSON.stringify(plotsData))
		const promises1 =  plotsData.map(async (f) => {
			response.data.push(f.total_booking);
			response.lable.push(f.MonthName);
			return response;
		 })
		let newArray = await Promise.all(promises1);
		res.send({ status:1, data:newArray, message: '' });

	}catch(err){
		res.send({ status:0, data:[], message: err.message })
	}
}

const getPieChartData = async (req,res) =>{
	let townshipId = req.query.townshipId;
	const response = { data:[], lable:[]};
	let whereObj = {};
	let whereObjStr = "";
	if(townshipId && townshipId!=""){
		//whereObj.where = { 'townshipId': townshipId  };
		whereObjStr = " where `townshipId` = "+townshipId;
	}
	try{
		/** Total Plots **/
		// let plotsData = await Plots.findAll({
		// 	whereObj,
		// 	attributes:[
		// 		[ Sequelize.fn('Count', Sequelize.col('id')), 'count'],
		// 		'plot_status'
		// 	],
		// 	group : ['plot_status']
		// });
		query ="SELECT COUNT(`id`) as count, `plot_status` FROM `plots`"+whereObjStr+" group by `plot_status`";
		resultData = await sequelize.query(query, { type: Sequelize.SELECT });
		plotsData = JSON.parse(JSON.stringify(resultData[0]))
		const promises1 =  plotsData.map(async (f) => {
			response.data.push(f.count);
			response.lable.push(f.plot_status);
			return response;
		 })
		let newArray = await Promise.all(promises1);
		res.send({ status:1, data:newArray, message: '' });

	}catch(err){
		res.send({ status:0, data:[], message: err.message })
	}
}

const dataExport = async (req,res) =>{
	if(req.body.reportType && req.body.reportType == 'townships'){
		query = `SELECT township.township_name as township_name, township.total_size_of_township as saleable_area, booking.description, SUM(bookingAmount) AS bookingAmount, SUM(plotAmount) AS plotAmount, SUM(commission_amount) AS commission_amount, SUM(remainingAmount) AS remainingAmount, SUM(dimesion) AS areaSold FROM bookings AS booking LEFT OUTER JOIN townships AS township ON booking.townshipId = township.id LEFT OUTER JOIN plots AS plot ON booking.plotId = plot.id GROUP BY booking.townshipId;`
	}else if(req.body.reportType && req.body.reportType == 'blocks'){
		query = `SELECT township.township_name as township_name, block.name as block_name, block.size as saleable_area, SUM(bookingAmount) AS bookingAmount, SUM(plotAmount) AS plotAmount, SUM(commission_amount) AS commission_amount, SUM(remainingAmount) AS remainingAmount, SUM(dimesion) AS areaSold FROM bookings AS booking LEFT OUTER JOIN townships AS township ON booking.townshipId = township.id LEFT OUTER JOIN plots AS plot ON booking.plotId = plot.id LEFT OUTER JOIN blocks AS block ON booking.blockId = block.id  GROUP BY booking.blockId;`
	}else if(req.body.reportType && req.body.reportType == 'plots'){
		query = `SELECT township.township_name as township_name, plot.plot_number as plot_number, booking.plotAmount as plot_amount, booking.bookingAmount AS bookingAmount, booking.commission_amount AS commission_amount, booking.remainingAmount AS remainingAmount, booking.description as description, plot.dimesion as plot_size, broker.first_name, broker.last_name, booking.client_name as ClientName, booking.email as Email, booking.mobile as MobileNumber, booking.aadharcardNumber as AadharCard, booking.plotAmount, booking.cashPlotAmount,booking.checkPlotAmount,booking.bookingAmount,booking.cashAmountReceived, booking.checkAmountReceived,booking.remainingAmount FROM bookings AS booking LEFT OUTER JOIN townships AS township ON booking.townshipId = township.id LEFT OUTER JOIN plots AS plot ON booking.plotId = plot.id LEFT OUTER JOIN brokers as broker ON booking.brokerId = broker.id ORDER BY booking.createdAt;`
	}else if(req.body.reportType && req.body.reportType == 'booking'){
		query = 'SELECT booking.client_name as ClientName,township.township_name AS TownshipName,block.name as BlockName, plot.id as PlotID, CONCAT(broker.first_name, broker.last_name) AS BrokerName ,plot.dimesion as PlotSize FROM bookings AS booking LEFT OUTER JOIN townships AS township ON booking.townshipId = township.id LEFT OUTER JOIN blocks AS block ON booking.blockId = block.id LEFT OUTER JOIN plots AS plot ON booking.plotId = plot.id LEFT OUTER JOIN brokers AS broker ON booking.brokerId = broker.id';
	}else if(req.body.reportType && req.body.reportType == 'Block List'){
		query = 'SELECT  township.township_name AS TownshipName,block.name as BlockName, block.size as Size, township.number_of_plots AS Number of Plots, township.colonizer AS Colonizer, township.description AS MoreInformation, block.createdAt as CreatedDate FROM blocks AS block LEFT OUTER JOIN townships AS township ON block.townshipId = township.id LEFT OUTER JOIN plots AS plots ON block.id = plots.blockId';
	}else{
		query = `SELECT broker.first_name, broker.last_name, COUNT(booking.plotID) as number_of_plot, SUM(bookingAmount) AS bookingAmount, SUM(plotAmount) AS plotAmount, SUM(commission_amount) AS commission_amount, SUM(remainingAmount) AS remainingAmount FROM bookings AS booking LEFT OUTER JOIN brokers AS broker ON booking.brokerId = broker.id GROUP BY booking.brokerId;`
	}

	resultData = await sequelize.query(query, { type: Sequelize.SELECT });
	
	resultData = JSON.parse(JSON.stringify(resultData))
	
	// headers for the excel sheet 
	let finalHeaders = ['Township Name', 'Plot Amount', 'Payment Received','Commission Amount', 'Amount To Be Received', 'Saleble Area','Area Sold','Remaining Area','Description'];
	// data to write into each sheet of the workbook
	let data = [resultData[0]];
	
	// create workbook
	let wb = XLSX.utils.book_new()
	// for each to write into excel sheets.
	data.forEach((array, i) => {
	  let ws = XLSX.utils.json_to_sheet(array);
	  XLSX.utils.book_append_sheet(wb, ws, `SheetJS_${i}`)
	 });
	 // file name of the excel sheet
	 let exportFileName = `excel/export/`+Date.now()+`.xls`;
	 // create excel sheet
	 XLSX.writeFile(wb, exportFileName)
	 res.send({ status:1, data: process.env.API_URL+exportFileName, msg:'File exported.' });
}



module.exports = {
    getReport,
	getDashboardWidgetData,
	getDashboardReportChart,
	getPieChartData,
	dataExport
};