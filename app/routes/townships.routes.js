const townships = require("../controllers/townships.controller.js");
const { authJwt, commonServices } = require("../middlewares");
var router = require("express").Router();

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'excel/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+'-'+file.originalname);
    }
});

const upload = multer({ storage }); 

router.post("/create", [ authJwt.verifyToken ], townships.create);
router.get("/getAll",[ authJwt.verifyToken ], townships.getAll);
router.put("/update", [ authJwt.verifyToken ], townships.doUpdate);
router.delete("/remove",[ authJwt.verifyToken ], townships.doRemove);
router.post("/import",[ authJwt.verifyToken ], townships.bulkImport);
router.post("/export", [ authJwt.verifyToken ], townships.bulkExport);

module.exports = router; 

