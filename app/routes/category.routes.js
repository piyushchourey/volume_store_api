const category = require("../controllers/category.controller.js");
const { authJwt, commonServices } = require("../middlewares");

var router = require("express").Router();

// Create a new Category
router.post("/add", [ authJwt.verifyToken, commonServices.checkDuplicateCategory  ], category.create);
router.get("/getAll", [ authJwt.verifyToken ], category.getAll);
router.delete("/remove/:id", [ authJwt.verifyToken ], category.doRemove);

module.exports = router;