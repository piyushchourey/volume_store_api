const db = require("../models");
const Townships = db.townships;
const Brand = db.brand;
const Service = db.service;
const Category = db.category;
const SubCategory = db.subcategory;
const Product = db.product;
const Plots = db.plots;
var _ = require('lodash');
var multer  = require('multer');
const Op = db.Sequelize.Op;

checkDuplicateTownship = (req, res, next) => {
  // Email
  Townships.findOne({
    where: {
      township_name: req.body.township_name,
      state: req.body.state,
      city: req.body.city
    }
  }).then(township => {
    if (township) {
      res.status(400).send({
        status :0,
        data:[],
        message: "Failed! Township name is already in use with mention state and city!"
      });
      return;
    }else{
      next();
    }
  });
};

checkDuplicateCategory = (req, res, next) => {
  Category.findOne({
    where: {
      name: req.body.name,
    }
  }).then(category => {
    if (category) {
      res.status(201).send({
        status :0,
        data:[],
        message: "Failed! Category name is already exist."
      });
      return;
    }else{
      next();
    }
  });
};

checkDuplisubcateCategory = (req, res, next) => {
  SubCategory.findOne({
    where: {
      categoryId: req.body.categoryId,
      [Op.or]: [
        { name: _.lowerCase(req.body.name) },
        { name: _.upperCase(req.body.name) }
      ]
    }
  }).then(subcategory => {
    if (subcategory) {
      res.status(201).send({
        status :0,
        data:[],
        message: "Failed! Sub Category name is already exist."
      });
      return;
    }else{
      next();
    }
  });
};

checkDuplicateBrand = (req, res, next) => {
  Brand.findOne({
    where: {
      name: req.body.name,
    }
  }).then(brand => {
    if (brand) {
      res.status(201).send({
        status :0,
        data:[],
        message: "Failed! Brand name is already exist."
      });
      return;
    }else{
      next();
    }
  });
};

checkDuplicateService = (req, res, next) => {
  console.log("req.body.name",req.body.name);
  Service.findOne({
    where: {
      name: req.body.name,
    }
  }).then(service => {
    if (service) {
      res.status(201).send({
        status :0,
        data:[],
        message: "Failed! Service name is already exist."
      });
      return;
    }else{
      next();
    }
  });
};

checkDuplicateProduct = (req, res, next) => {
  Product.findOne({
    where: {
      brandId: req.body.brandId,
      modelNumber: req.body.modelNumber
    }
  }).then(product => {
    if (product) {
      res.status(201).send({
        status :0,
        data:[],
        message: "Failed! This Prodcut is already exist with mention Model Number."
      });
      return;
    }else{
      next();
    }
  });
};

plotVerify = (req, res, next) =>{
  if(req.body.plotNumber){
    Plots.findOne({
      where: {
        plot_number :req.body.plotNumber
      }
    }).then(plot => {
      if(_.size(plot)){
        if(plot.status > 0){
          res.status(400).send({
            status :0,
            data :[],
            message: "Failed! This Plot has been Booked!"
          });
        }else{
          next();
        }
        return;
      }else if (_.isNull(plot)) {
        res.status(400).send({
          status :0,
          data :[],
          message: "Failed! This Plot is not registered in our DB."
        });
        return;
      }else{
        next();
      }
    });
  }else{
    res.status(400).send({
      status :0,
      data:[],
      message: "Plot number is missing."
    });
    return;
  }
};

checkDuplicatePlotWithTownship = (req, res, next) => {
  // Email
  Plots.findOne({
    where: {
      townshipId: req.body.townshipId,
      plot_number: req.body.plot_number
    }
  }).then(township => {
    if (township) {
      res.status(400).send({
        status :0,
        data :[],
        message: "Failed! This Plot is already in added with township!"
      });
      return;
    }else{
      next();
    }
  });
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './excel/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+file.originalname)
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
  storage:storage,
  limits:{
      fileSize: 1024 * 1024 * 5
  },
  fileFilter:fileFilter
});

const singleFileUpload = upload.single("importFiles")

var trimmer = function(req, res, next){
  req.body = _.object(_.map(req.body, function (value, key) {
    return [key, value.trim()];
  }));
  next();
}

const commonServices = {
  checkDuplicateTownship: checkDuplicateTownship,
  checkDuplicateProduct:checkDuplicateProduct,
  checkDuplicateBrand:checkDuplicateBrand,
  checkDuplicateService:checkDuplicateService,
  checkDuplicateCategory:checkDuplicateCategory,
  checkDuplicatePlotWithTownship : checkDuplicatePlotWithTownship,
  plotVerify : plotVerify,
  upload:upload,
  singleFileUpload:singleFileUpload,
  trimmer:trimmer,
  checkDuplisubcateCategory:checkDuplisubcateCategory
};
module.exports = commonServices; 