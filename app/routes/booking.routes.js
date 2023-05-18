const booking = require("../controllers/booking.controller.js");
const { authJwt, commonServices, verifySignUp } = require("../middlewares");

var router = require("express").Router();

router.post("/register", [ authJwt.verifyToken ], booking.create);
router.get("/getAll", [ authJwt.verifyToken ], booking.getAll);
router.put("/update", [ authJwt.verifyToken ], booking.doUpdate);
router.delete("/remove",[ authJwt.verifyToken ], booking.doRemove);
router.post("/sendMail", [ authJwt.verifyToken ], booking.sentEmail);
router.post("/import",[ authJwt.verifyToken ], booking.bulkImport);

module.exports = router; 