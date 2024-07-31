const db = require("../models/index");
const Category = db.category;
const Op = db.Sequelize.Op;
var _ = require('lodash');

// Create and Save a new Category
const create = async(req, res) => {
    // Validate request
	try{
		if(!(_.isEmpty(req.body))){
			var categoryPostData = req.body;
			if(categoryPostData.id){
				let brandId = _.pick(categoryPostData, ['id']);
				let UpdatecategoryPostData = categoryPostData;
				UpdatecategoryPostData = _.omit(UpdatecategoryPostData, ['id']);
				await Category.update(UpdatecategoryPostData,{
					where : { id : brandId.id } 
				}).then(data => {
						res.send({ status:1, data:data, message: 'Category updated successfully.' });
				}).catch(err => { 
					res.status(500).send({ status :0, data :[], message: err.message || "Some error occurred while retrieving tutorials." }); 
				});
			}else{
				delete categoryPostData['id'];
				Category.create(categoryPostData).then(brand => {
					res.send({ status:1, data:[], message: "Category was added successfully!" });
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
    let paramObj = { status :1 };
	try {
		let categoryData = await Category.findAll({where: paramObj})
        if(categoryData){
            res.status(200).send({ status:true, data:categoryData, message: '' });
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
		Category.destroy({ where: { id: id } })
		.then(data => { res.send({ status:1, data:[], message:"Category deleted successfully."}); })
		.catch(err => {
			if(err.message.includes("constraint fails")){
				res.status(200).send({ status :0, message: 'Cannot delete parent category with associated subcategories' });
			}else{
				res.status(500).send({
					status :0,
					data : [],
					message:
						err.message || "Some error occurred while retrieving tutorials."
				});
			}
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