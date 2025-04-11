const User = require("../models/user");
const jwt = require("jsonwebtoken");

const SECRET = "saurav@dev";

// const admin
const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  //validate
  try {
    if (!token) {
      throw new Error("Auth token missing");
    }
    const decoded = jwt.verify(token, SECRET);
    const { _id } = decoded;
    const user = await User.findById(_id);
    if (!user) throw new Error("Invalid token");
    console.log("Logged in user is " + user.firstName);
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ msg: e.message });
  }
};

module.exports = userAuth;
