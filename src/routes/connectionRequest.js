const express = require("express");
const userAuth = require("../middlewares/auth");
const { ConnectionRequest, User } = require("../models");
const { run } = require("../utils/sendEmail");

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
      const emailResponse = await run();
      console.log(emailResponse);

      res.json({
        msg: `${req.user.firstName} is ${status} in ${toUser.firstName}`,
        data,
      });
    } catch (err) {
      res.status(500).send({ msg: err.message });
    }
  }
);

connectionRequestsRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    const ALLOWED_STATUS = ["accepted", "rejected"];
    const status = req.params?.status;
    const requestId = req.params?.requestId;
    try {
      //validate status
      if (!ALLOWED_STATUS.includes(status)) {
        return res.status(400).send({ msg: "Invalid status type" + status });
      }

      //validate requestid
      const request = await ConnectionRequest.findOne({
        _id: requestId,
        toUser: req.user?._id,
        status: "interested",
      });

      if (!request) {
        return res.status(404).send({ msg: "connection request not found" });
      }

      request.status = status;
      const data = await request.save();
      res.send({ msg: `Successfully ${status} the request`, request: data });
    } catch (err) {
      res.status(500).send({ msg: err.message });
    }
  }
);

module.exports = connectionRequestsRouter;
