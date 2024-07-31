const sor = require("../controllers/sor.controller");
var authJwt = require("../middlewares/authJwt");
var router = require("express").Router();

router.post("/estimation", [ authJwt.verifyToken ],  sor.estimation);
router.post("/updateComparativeCompare", [ authJwt.verifyToken ], sor.updateComparativeCompare);
router.get("/estimation/:clientId", [ authJwt.verifyToken ],  sor.getEstimation);

module.exports = router;