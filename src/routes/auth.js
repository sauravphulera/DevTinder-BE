const express = require("express");
const { validateUserData } = require("../utils");
const { User } = require("../models");
const bcrypt = require("bcrypt");
const validator = require("validator");

const authRouter = express.Router();

// signup
authRouter.post("/signup", async (req, res) => {
  try {
    validateUserData(req);
    const { password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    // create new user model instance
    const savedUser = new User({ ...req.body, password: passwordHash });
    const token = savedUser.getJWT();
    res.cookie("token", token);
    await savedUser.save();
    res.send({ msg: "successfully saved user", user: savedUser });
  } catch (e) {
    res.status(500).send({ msg: e.message });
  }
});

// login
authRouter.post("/login", async (req, res) => {
  try {
    const { password, email } = req.body;
    if (!validator.isEmail(email)) {
      throw new Error("Invalid Email id");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordValid = user.validatePassword(password);
    isPasswordValid.then((isValid) => {
      if (isValid) {
        const token = user.getJWT();
        res.cookie("token", token);
        res.json({ msg: "login successful", user });
      } else {
        res.status(400).send({ msg: "Invalid Credentials" });
      }
    });
  } catch (e) {
    res.status(500).send({ msg: e.message });
  }
});

// logout
authRouter.post("/logout", (req, res) => {
  try {
    // create new user model instance
    res
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .send({ msg: "user logged out" });
  } catch (e) {
    res.status(500).send({ msg: e.message });
  }
});

module.exports = authRouter;
