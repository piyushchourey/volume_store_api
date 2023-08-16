const SubCategory = require("../controllers/subcategory.controller.js");
const { authJwt, commonServices } = require("../middlewares");
var router = require("express").Router();

// Create a new Category
router.post("/add",[ authJwt.verifyToken,commonServices.checkDuplisubcateCategory ], SubCategory.create);
router.get("/getAll", [ authJwt.verifyToken ], SubCategory.getAll);
router.get("/getAll/:id", [ authJwt.verifyToken ], SubCategory.getAll);
router.delete("/remove/:id", [ authJwt.verifyToken ], SubCategory.doRemove);

module.exports = router;