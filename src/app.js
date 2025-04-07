const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const validateUserData = require("./utils");
const app = express();
const bcrypt = require("bcrypt");
const validator = require("validator");

app.use(express.json());

// find a user
app.get("/devTinder/user", async (req, res) => {
  const email = req.body.email;
  let users;

  try {
    users = await User.find({ email });
    if (users.length === 0) {
      res.status(404).send({ msg: "user not found" });
    }
  } catch (e) {
    res.status(500).send({ msg: "Something went wrong" });
  }
  res.send({ users });
});

// signup
app.post("/devTinder/signup", async (req, res) => {
  try {
    validateUserData(req);
    const { password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    // create new user model instance
    const user = new User({ ...req.body, password: passwordHash });

    await user.save();
    res.send({ msg: "successfully saved user" });
  } catch (e) {
    res.status(500).send({ msg: e.message });
  }
});

// login
app.post("/devTinder/login", async (req, res) => {
  try {
    const { password, email } = req.body;
    if (!validator.isEmail(email)) {
      throw new Error("Invalid Email id");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordValid = await bcrypt.compare(password, user?.password);
    if (isPasswordValid) {
      res.cookie("token", "adnsadjksandkjakdn");
      res.send({ msg: "login successful" });
    } else {
      res.status(400).send({ msg: "Invalid Credentials" });
    }
  } catch (e) {
    res.status(500).send({ msg: e.message });
  }
});

// get users
app.get("/devTinder/users", async (req, res) => {
  let users = [];
  try {
    users = await User.find({});
  } catch (e) {
    res.status(500).send({ msg: "Something went wrong" });
  }
  res.send({ users });
});

app.delete("/devTinder/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    res.send({ msg: "user deleted", user });
  } catch (e) {
    res.status(500).send({ msg: "Something went wrong" });
  }
});

app.patch("/devTinder/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const userData = req.body;
  const ALLOWED_UPDATES = [
    "about",
    "gender",
    "age",
    "skills",
    "photoUrl",
    "password",
  ];

  try {
    const isUpdateAllowed = Object.keys(userData).every((key) =>
      ALLOWED_UPDATES.includes(key)
    );
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

connectDB()
  .then(() => {
    console.log("database connection successful!");
    app.listen(3000, () => {
      console.log("server started at 3000");
    });
  })
  .catch(() => {
    console.log("something went wrong in connecting to db");
  });
