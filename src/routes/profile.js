const express = require("express");
const userAuth = require("../middlewares/auth");
const { validateProfileEditData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (e) {
    res.status(400).send("Error: " + e.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  const userData = req.body;
  const userId = req.user?._id;

  try {
    const isUpdateAllowed = validateProfileEditData(userData);
    if (!isUpdateAllowed) {
      throw new Error("update now allowed");
    }
    if (userData?.skills?.length > 10) {
      throw new Error("You cannot add more than 10 skills");
    }
    const user = await User.findByIdAndUpdate(userId, userData, {
      returnDocument: "after",
      runValidators: true,
    });
    res.send({ msg: "user updated", user });
  } catch (e) {
    res.status(500).send({ msg: e.message });
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  const userId = req.user?._id;
  const password = req.user?.password;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(
      userId,
      { password: passwordHash },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );
    res.send({ msg: "user updated", user });
  } catch (e) {
    res.status(500).send({ msg: e.message });
  }
});
module.exports = profileRouter;
