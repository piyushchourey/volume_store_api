
  const category = require("../controllers/category.controller.js");

  var router = require("express").Router();

  // Create a new Category
  router.post("/", category.create);

  module.exports = router;