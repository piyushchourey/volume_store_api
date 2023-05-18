const admin = require("../controllers/admin.controller.js");
const { verifySignUp, authJwt} = require("../middlewares");

var router = require("express").Router();

router.post("/register", [ verifySignUp.checkDuplicateEmail ], admin.doRegister);
router.get("/getAll", [ authJwt.verifyToken ],admin.getAll);
router.delete("/remove",[ authJwt.verifyToken ], admin.doRemove);
router.get("/getStates", [ authJwt.verifyToken ], admin.getStates);
router.get("/getcitiesByState", [ authJwt.verifyToken ], admin.getCitiesByState);
module.exports = router; 