const service = require("../controllers/service.controller");
const { authJwt, commonServices } = require("../middlewares");

var router = require("express").Router();

router.post("/add", [ authJwt.verifyToken, commonServices.checkDuplicateService  ], service.create);

router.get("/getAll", [ authJwt.verifyToken ], service.getAll);

// router.get("/getAllUnits", [ authJwt.verifyToken ], brand.getAllUnits);

// router.get("/getAllModelNumber", [ authJwt.verifyToken ], brand.getAllModelNumber);

// router.post("/import",[ authJwt.verifyToken ], brand.bulkImport);

router.delete("/remove/:id",[ authJwt.verifyToken ], service.doRemove);

module.exports = router;