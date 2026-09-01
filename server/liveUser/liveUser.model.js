const mongoose = require("mongoose");

const liveUserSchema = new mongoose.Schema(
  {
    name: String,
    country: String,
    image: String,
    view: { type: Array, default: [] },
    age: Number,
    token: String,
    channel: String,
    rCoin: Number,
    diamond: Number,
    username: String,
    isVIP: Boolean,
    liveUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    agoraUID: { type: Number, default: 0 },
    liveStreamingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "livestreaminghistories",
    },
    isPublic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("LiveUser", liveUserSchema);
