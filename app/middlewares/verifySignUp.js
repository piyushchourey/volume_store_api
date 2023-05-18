const db = require("../models");
const Login = db.login;
checkDuplicateEmail = (req, res, next) => {
  // Email
  Login.findOne({
    where: {
      email: req.body.email
    }
  }).then(user => {
    console.log("fyfhggg"+user);
    if (user) {
      res.status(400).send({
        status :0,
        data:[],
        message: "Failed! Email is already in use!"
      });
      return;
    }else{
      next();
    }
  });
};

isExistUser = (req, res, next) => {
  // Email
  Login.findOne({
    where: {
      id: req.body.userId
    }
  }).then(user => {
    console.log("fyfhggg"+user);
    if (!user) {
      res.status(400).send({
        status :0,
        data :[],
        message: "Sorry! User is not exist in our DB."
      });
      return;
    }else{
      next();
    }
  });
};

const verifySignUp = {
  checkDuplicateEmail: checkDuplicateEmail,
  isExistUser :isExistUser
};
module.exports = verifySignUp; 