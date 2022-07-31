const jwt = require("jsonwebtoken");
const config = require("../config/secret.js");
const User = require('../models/user');

exports.verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  jwt.verify(token, config.TOKEN_KEY, async(err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    const user = await User.findById(decoded._id);

    

    if(!user||(user.token!=decoded.token)){
      return res.status(401).send({ message: "token expire login again" });
    }

    if(!decoded.isActive&&req.originalUrl!='/active'){
      return res.status(401).send({ message: "this user not active yet!" });
    }
    req.user = decoded;
    next();
  });
};

exports.verifyTokenShort = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  jwt.verify(token, config.TOKEN_KEYShort, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }

    req.user = decoded;
    next();
  });
};


