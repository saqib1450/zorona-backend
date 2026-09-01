const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    post: String,
    hashtag: { type: Array, default: null },
    mentionPeople: { type: Array, default: null },
    location: { type: String, default: null },
    caption: { type: String, default: null },
    like: { type: Number, default: 0 },
    comment: { type: Number, default: 0 },
    showPost: { type: Number, enum: [0, 1], default: 0 }, // 0:public, 1:followers
    allowComment: { type: Boolean, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isDelete: { type: Boolean, default: false },
    date: String,
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model("Post", postSchema);
