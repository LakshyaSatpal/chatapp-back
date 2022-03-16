const Chatroom = require("../models/Chatroom");
const validator = require("validator");

exports.createChatroom = async (req, res) => {
  const { name } = req.body;

  if (!validator.isAlpha(name))
    throw "Chatroom name can contain only alphabets";

  const exists = await Chatroom.findOne({ name });
  if (exists) throw "Chatroom with this name already exists";

  const chatroom = new Chatroom({
    name,
  });

  await chatroom.save();

  res.json({
    message: "Chatroom created",
  });
};

exports.getAllChatrooms = async (req, res) => {
  const chatrooms = await Chatroom.find({});

  res.json(chatrooms);
};
