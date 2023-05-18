const brokers = require("../controllers/brokers.controller.js");
const { verifySignUp, authJwt} = require("../middlewares");

var router = require("express").Router();

router.post("/register", [ authJwt.verifyToken ], brokers.doRegister);
router.get("/getAll", [ authJwt.verifyToken ],brokers.getAll);
router.delete("/remove",[ authJwt.verifyToken ], brokers.doRemove);

module.exports = router;