const blocks = require("../controllers/blocks.controller.js");
const { authJwt, commonServices } = require("../middlewares");

var router = require("express").Router();

router.post("/create", [ authJwt.verifyToken ], blocks.create);
router.get("/getAll",[ authJwt.verifyToken ], blocks.getAll);
router.delete("/remove",[ authJwt.verifyToken ], blocks.doRemove);
router.post("/import", [ authJwt.verifyToken ], blocks.bulkImport);

module.exports = router; 