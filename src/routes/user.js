const express = require("express");
const { User, ConnectionRequest } = require("../models");
const userAuth = require("../middlewares/auth");
const userRouter = express.Router();

const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "age",
  "gender",
  "photoUrl",
  "skills",
];

// find a user
userRouter.get("/devTinder/user", userAuth, async (req, res) => {
  const email = req.body.email;
  let users;

  try {
    users = await User.find({ email });
    if (users.length === 0) {
      res.status(404).send({ msg: "user not found" });
    }
  } catch (e) {
    res.status(500).send({ msg: e.message });
  }
  res.send({ users });
});

// get users
userRouter.get("/devTinder/users", async (req, res) => {
  let users = [];
  try {
    users = await User.find({});
  } catch (e) {
    res.status(500).send({ msg: "Something went wrong" });
  }
  res.send({ users });
});

userRouter.delete("/devTinder/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    res.send({ msg: "user deleted", user });
  } catch (e) {
    res.status(500).send({ msg: "Something went wrong" });
  }
});

userRouter.patch("/devTinder/user/:userId", async (req, res) => {
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

//get all pending connections of logged in user
userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      toUser: loggedInUser?._id,
      status: "interested",
    }).populate("fromUser", [
      "firstName",
      "lastName",
      "age",
      "gender",
      "photoUrl",
      "skills",
    ]);

    return res.send({ requests: connections });
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
});

//get all accepted connections of logged in user
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        {
          toUser: loggedInUser?._id,
          status: "accepted",
        },
        {
          fromUser: loggedInUser?._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUser", USER_SAFE_DATA)
      .populate("toUser", USER_SAFE_DATA);

    const userConnections = connections.map((row) => {
      if (row.fromUser._id.toString() === loggedInUser._id.toString()) {
        return row.toUser;
      } else {
        return row.fromUser;
      }
    });

    return res.send({ connections: userConnections });
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    // user should see all card except
    // his own card, his connections, users he have already sent connection req, ignored people

    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(req.query?.limit) || 10;

    if (limit > 50) {
      throw new Error(
        "limit is very large. Please send a limit less than or equal to 50"
      );
    }

    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      $or: [
        {
          toUser: loggedInUser?._id,
        },
        {
          fromUser: loggedInUser?._id,
        },
      ],
    }).select(["fromUser", "toUser"]);

    const hideUsersFromFeed = new Set();

    connections.forEach((req) => {
      hideUsersFromFeed.add(req.fromUser.toString());
      hideUsersFromFeed.add(req.toUser.toString());
    });

    const displayUsers = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip((page - 1) * limit)
      .limit(limit);
    res.send({ displayUsers });
  } catch (e) {
    res.send({ msg: e.message });
  }
});
module.exports = userRouter;
