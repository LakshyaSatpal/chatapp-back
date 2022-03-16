require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const jwt = require("jsonwebtoken");
const errorHandlers = require("./handlers/errorHandlers");
const Message = require("./models/Message");
const User = require("./models/User");

require("./conn");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/user", require("./routes/user"));
app.use("/chatroom", require("./routes/chatroom"));

// Setup error handlers
app.use(errorHandlers.notFound);
app.use(errorHandlers.mongoseErrors);
if (process.env.ENV === "DEVELOPMENT") {
  app.use(errorHandlers.developmentErrors);
} else {
  app.use(errorHandlers.productionErrors);
}

const server = app.listen(PORT, err => {
  if (err) {
    console.log("Error in server setup");
  }
  console.log("Server listening on Port", PORT);
});

const io = require("socket.io")(server);

io.use((socket, next) => {
  try {
    const token = socket.handshake.query.token;
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    socket.userId = payload.id;

    next();
  } catch (err) {
    console.log(err);
  }
});

io.on("connection", socket => {
  console.log("Connected: " + socket.userId);

  socket.on("joinRoom", ({ chatroomId }) => {
    socket.join(chatroomId);
    console.log("A user joined chatroom" + chatroomId);
  });

  socket.on("leaveRoom", ({ chatroomId }) => {
    socket.leave(chatroomId);
    console.log("A user left chatroom" + chatroomId);
  });

  socket.on("chatroomMessage", async ({ chatroomId, message }) => {
    if (message.trim().length > 0) {
      const user = await User.findById(socket.userId);
      const newMessage = new Message({
        chatroom: chatroomId,
        user: socket.userId,
        message,
      });
      io.to(chatroomId).emit("newMessage", {
        message,
        name: user.name,
        userId: socket.userId,
      });

      await newMessage.save();
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected: " + socket.userId);
  });
});
