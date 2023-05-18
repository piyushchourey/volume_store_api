const db = require("../models/index");
const Category = db.category;
const Op = db.Sequelize.Op;
var _ = require('lodash');

// Create and Save a new Tutorial
const create = (req, res) => {
    // Validate request
    res.json(req.body);
};


module.exports = {
    create
};