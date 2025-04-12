const express = require("express");
const userAuth = require("../middlewares/auth");
const { ConnectionRequest, User } = require("../models");

const connectionRequestsRouter = express.Router();

connectionRequestsRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    const ALLOWED_STATUS = ["interested", "ignored"];
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      if (!ALLOWED_STATUS.includes(status)) {
        return res.status(400).send({ msg: "Invalid status type" + status });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).send({ msg: "sending to invalid user" });
      }

      //check if existing connection
      const existingConnection = await ConnectionRequest.findOne({
        $or: [
          { fromUser: fromUserId, toUser: toUserId },
          { fromUser: toUserId, toUser: fromUserId },
        ],
      });

      if (existingConnection) {
        return res.status(400).send({ msg: "Connection request already sent" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUser: fromUserId,
        toUser: toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        msg: `${req.user.firstName} is ${status} in ${toUser.firstName}`,
        data,
      });
    } catch (err) {
      res.status(500).send({ msg: err.message });
    }
  }
);

module.exports = connectionRequestsRouter;
