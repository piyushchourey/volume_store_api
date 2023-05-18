const login = require("../controllers/login.controller.js");

var router = require("express").Router();

router.post("/", login.dologin);

module.exports = router;