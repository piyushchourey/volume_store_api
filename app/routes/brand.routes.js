const brand = require("../controllers/brand.controller");
const { authJwt, commonServices } = require("../middlewares");

var router = require("express").Router();

router.post("/add", [ authJwt.verifyToken, commonServices.checkDuplicateBrand  ], brand.create);

router.get("/getAll", [ authJwt.verifyToken ], brand.getAll);

router.get("/getAllUnits", [ authJwt.verifyToken ], brand.getAllUnits);

router.get("/getAllModelNumber", [ authJwt.verifyToken ], brand.getAllModelNumber);

router.get("/getAllModelNumber/:id", [ authJwt.verifyToken ], brand.getAllModelNumber);

router.post("/import",[ authJwt.verifyToken ], brand.bulkImport);

router.delete("/remove/:id",[ authJwt.verifyToken ], brand.doRemove);

module.exports = router;