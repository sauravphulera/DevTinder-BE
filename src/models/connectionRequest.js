const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  // check if fromUserId is same as 2 userId
  if (connectionRequest.fromUser.equals(connectionRequest.toUser)) {
    throw new Error("cannot send connection req to same user");
  }

  next();
});

connectionRequestSchema.index({ fromUser: 1, toUser: 1 });

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = ConnectionRequest;
