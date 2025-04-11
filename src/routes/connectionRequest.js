const express = require("express");
const userAuth = require("../middlewares/auth");

const connectionRequestsRouter = express.Router();

connectionRequestsRouter.post(
  "/sendConnRequest",
  userAuth,
  async (req, res) => {
    const user = req.user;
    console.log("sending connection request");
    req.send(user.firstName + "sent the connection request");
  }
);

module.exports = connectionRequestsRouter;
