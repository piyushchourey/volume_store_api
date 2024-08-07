const express = require("express");
// const fileupload = require("express-fileupload");
const cors = require("cors");
const db = require("./app/models");
const app = express();
require('dotenv').config();
var path = require('path');
const multer = require('multer');

// var corsOptions = {
//   origin: "http://localhost:8081"
// }; 


// app.use(cors(corsOptions));

app.use(cors()); 
// parse requests of content-type - application/json
app.use(express.json({limit: '100mb'}));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true,limit: '100mb' }));
// app.use(fileupload());
// db.sequelize.sync({ force: true }).then(() => {
//     console.log("Drop and re-sync db.");
// });



// simple route
app.get("/", (req, res) => { 
  res.json({ message: "Welcome to bezkoder application." });
});


app.use('/api/login', require("./app/routes/login.routes"));
app.use('/api/admin', require("./app/routes/register.routes"));
app.use('/api/product', require("./app/routes/product.route")); 
app.use('/api/brand', require("./app/routes/brand.routes"));
app.use('/api/service', require("./app/routes/service.routes"));
app.use('/api/category', require("./app/routes/category.routes"));
app.use('/api/subcategory', require("./app/routes/subcategory.routes"));
app.use('/api/client', require("./app/routes/client.route"));
app.use('/api/ratecalculation', require("./app/routes/rateCalculations.route"));
app.use('/api/sor', require("./app/routes/sor.routes"));

app.use("/images", express.static(path.join(__dirname, 'images')));
app.use("/images/product-banner", express.static(path.join(__dirname, 'images/product-banner')));
app.use("/pdf", express.static(path.join(__dirname, 'pdf')));
app.use("/excel", express.static(path.join(__dirname, 'excel')));

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});