const product = require("../controllers/product.controller.js");

var router = require("express").Router();

router.post("/add", product.create);

module.exports = router;