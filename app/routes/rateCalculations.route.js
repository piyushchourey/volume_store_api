const ratecalculation = require("../controllers/ratecalculation.controller");
const { authJwt, commonServices } = require("../middlewares");

var router = require("express").Router();

router.post("/add", [ authJwt.verifyToken ], ratecalculation.add);

router.post("/excelExport", [ authJwt.verifyToken ], ratecalculation.genrateExcel);

router.get("/xls", ratecalculation.genrateExcel);

module.exports = router;