const db = require("../models/index");
const SubCategory = db.subcategory;
const Category = db.category;
const Op = db.Sequelize.Op;
var _ = require('lodash');

// Create and Save a new Sub category
const create = async(req, res) => {
    // Validate request
	try{
		if(!(_.isEmpty(req.body))){
			var subcategoryPostData = req.body;
			if(subcategoryPostData.id){
				let subcategoryId = _.pick(subcategoryPostData, ['id']);
				let UpdatesubcategoryPostData = subcategoryPostData;
				UpdatesubcategoryPostData = _.omit(UpdatesubcategoryPostData, ['id']);
				await SubCategory.update(UpdatesubcategoryPostData,{
					where : { id : subcategoryId.id } 
				}).then(data => {
						res.send({ status:1, data:data, message: 'SubCategory updated successfully.' });
				}).catch(err => { 
					res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while retrieving tutorials." }); 
				});
			}else{
				delete subcategoryPostData['id']; subcategoryPostData['status'] = 1;
				SubCategory.create(subcategoryPostData).then(brand => {
					res.send({ status:1, data:[], message: "SubCategory was added successfully!" });
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

const getAll =async (req, res, next) => {
	const andConditions = [];
	const paramObj = {};
	if(req.params.id){
		let id = req.params.id; 
		var categoryIdCondition = id ? { categoryId: { [Op.eq]: id } } : null;
		andConditions.push(categoryIdCondition);
	}
	var statusCondition =  { status: { [Op.eq]: 1 } };
	andConditions.push(statusCondition);
	if(_.size(andConditions) > 0){
		paramObj.where = { [Op.and]: andConditions };
	}
	try {
		let subcategoryData = await SubCategory.findAll({
			attributes: [ 'id', 'name', 'categoryId', 'status', 'createdAt', 'updatedAt', ],
			include: [
			  {
				model: Category,
				attributes: [ 'id', 'name', 'status', 'createdAt', 'updatedAt', ],
				where: { status: 1},
			  },
			],
			paramObj
		  });
		if(subcategoryData){
            res.status(200).send({ status:true, data:subcategoryData, message: '' });
        }else{
            res.status(200).send({ status:true, data:[ "No Category Available."], message: '' });
        }
	}catch(err){
		res.status(500).send({ status :0, data :[], message: err.message });
	}
}

const doRemove = ( req, res ) =>{ 
	const id = req.params.id;
	try{
		SubCategory.destroy({ where: { id: id } }).then(data => {
			res.send({ status:1, data:[], message:"Category deleted successfully."});
		}).catch(err => {
			console.log(err)
			res.status(500).send({
			  status :0,
			  data : [],
			  message:
				err.message || "Some error occurred while retrieving tutorials."
			});
		});
	}catch(err){
		res.status(500).send({ status :0, data :[], message: err.message });
	}
};


module.exports = {
    create,
    getAll,
	doRemove
};