const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const app = express();

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
  console.log("rea");
  try {
    console.log(req.body);

    // create new user model instance
    const user = new User(req.body);

    await user.save();
    res.send({ msg: "successfully saved user" });
  } catch (e) {
    res.status(500).send(e);
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
    res.send({ msg: "user deleted" });
  } catch (e) {
    res.status(500).send({ msg: "Something went wrong" });
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
