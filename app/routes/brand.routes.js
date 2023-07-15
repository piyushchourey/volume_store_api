const brand = require("../controllers/brand.controller");
const { authJwt, commonServices } = require("../middlewares");

var router = require("express").Router();

router.post("/add", [ authJwt.verifyToken ], brand.create);

router.get("/getAll", [ authJwt.verifyToken ], brand.getAll);

router.get("/getAllUnits", [ authJwt.verifyToken ], brand.getAllUnits);

router.post("/import",[ authJwt.verifyToken ], brand.bulkImport);

router.delete("/remove/:id",[ authJwt.verifyToken ], brand.doRemove);

module.exports = router;