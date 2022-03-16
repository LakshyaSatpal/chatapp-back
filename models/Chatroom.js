const mongoose = require("mongoose");

const chatroomSchema = mongoose.Schema({
  name: {
    type: String,
    required: "Name is required!",
  },
});

module.exports = mongoose.model("Chatroom", chatroomSchema);
