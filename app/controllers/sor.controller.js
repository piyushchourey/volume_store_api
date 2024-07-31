const db = require("../models/index");
const SOR = db.sor;
const config = require("../config/auth.config");
const Op = db.Sequelize.Op;
var _ = require('lodash');

const estimation = (req, res) => {
    // Validate request
    var SOREstimateStep1PostData = req.body;
	try{    
        if(!(_.isEmpty(SOREstimateStep1PostData))){
            SOR.create(SOREstimateStep1PostData).then(SORData => {
                res.send({ status:true, data: { id: SORData.id },  message: "SOR Estimate Profile Data inserted successfully!" });
            }).catch(err => {
                res.status(500).send({ status:false, data:[], message: err.message });
            });
        }else{
            res.status(200).send({ status :false, data : [], message: "Invalid Post data." });
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

/**
 Step-2 Update comparative compare data
 */
 const updateComparativeCompare = async (req, res) => {
    // Validate request
    var SOREstimateStep2PostData = req.body;
	try{    
        if(!(_.isEmpty(SOREstimateStep2PostData))){
            await SOR.update(SOREstimateStep2PostData,{
                where : { id : SOREstimateStep2PostData.SOR_ID } 
            }).then(data => {
                    res.send({ status:1, data:data, message: 'SOR comparative compare updated successfully.' });
            }).catch(err => { 
                res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while updating estimation." }); 
            });
        }else{
            res.status(200).send({ status :false, data : [], message: "Invalid Post data." });
        }
		
	}catch(err){
		res.status(500).send({ status :0, data : [], message: err.message || "Some error occurred while updating estimation." });
	}
};

const getEstimation = async (req,res) =>{
    if(req.params.clientId){
        let paramObj = { clientId: req.params.clientId};
        try {
            let SORData = await SOR.findAll({where: paramObj})
            res.status(200).send({ status:true, data:SORData, message: '' });
          
        }catch(err){
            res.status(500).send({ status :0, data :[], message: err.message });
        }
    }else{
        res.status(500).send({ status :0, data :[], message: 'Client Id is not getting in Backend.' });
    }
	
}

module.exports = {
    estimation,
    updateComparativeCompare,
    getEstimation
};