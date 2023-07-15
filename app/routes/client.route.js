const client = require("../controllers/client.controller");
const { authJwt, commonServices } = require("../middlewares");

var router = require("express").Router();

router.post("/add", [ authJwt.verifyToken ], client.create);

router.get("/getAll", [ authJwt.verifyToken ], client.getAll);

router.get("/getStates", [ authJwt.verifyToken ], client.getStates);

router.get("/getCities/:stateId", [ authJwt.verifyToken ], client.getCities);

// router.post("/import",[ authJwt.verifyToken ], brand.bulkImport);

router.delete("/remove/:id",[ authJwt.verifyToken ], client.doRemove);

module.exports = router;