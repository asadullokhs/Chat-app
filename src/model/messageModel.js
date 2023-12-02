const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
    },
    serderId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
    },
    file: {
      type: Object,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Messages", messageSchema);