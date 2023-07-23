const product = require("../controllers/product.controller.js");
const { authJwt, commonServices } = require("../middlewares");

var router = require("express").Router();

router.post("/add", [ authJwt.verifyToken , commonServices.checkDuplicateProduct  ], product.create);

router.get("/getAll", [ authJwt.verifyToken ], product.getAll);

router.get("/getAll/:id", [ authJwt.verifyToken ], product.getAll);

router.post("/import",[ authJwt.verifyToken ], product.bulkImport);

router.delete("/remove/:id",[ authJwt.verifyToken ], product.doRemove);

module.exports = router;