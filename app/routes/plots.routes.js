const plots = require("../controllers/plots.controller.js");
const { authJwt, commonServices } = require("../middlewares");

var router = require("express").Router();

router.post("/create", [ authJwt.verifyToken, commonServices.checkDuplicatePlotWithTownship ], plots.create);
router.get("/getAll",[ authJwt.verifyToken ], plots.getAll);
router.post("/update", [ authJwt.verifyToken ], plots.doUpdate);
router.get("/remove",[ authJwt.verifyToken ], plots.doRemove);
router.post("/import", [ authJwt.verifyToken ], plots.bulkImport);

module.exports = router;