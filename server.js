const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const dotenv = require("dotenv");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const http = require("http");

const path = require("path");
dotenv.config();

// route
const authRouter = require("./src/router/authRouter");
const userRouter = require("./src/router/userRouter");
const chatRouter = require("./src/router/chatRouter");
const messageRouter = require("./src/router/messageRouter");

const app = express();
const PORT = process.env.PORT || 4002;

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    // origin: "netlify"
    origin: "*",
    // methods: ["GET", "POST", "DELETE"]
    // origin: "http://localhost:3000",
  },
});

// Static file
app.use(express.static(path.join(__dirname, "src", "public")));

// middlewear
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors());

// routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

// websocket functions

let activeUsers = [];

io.on("connection", (socket) => {
  socket.on("new-user-added", (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
    }

    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);

    io.emit("get-users", activeUsers);
  });

  socket.on("exit", (id) => {
    activeUsers = activeUsers.filter((user) => user.userId !== id);

    io.emit("get-users", activeUsers);
  });

  socket.on("send-message", (data) => {
    const { receivedId } = data;
    const user = activeUsers.find((user) => user.userId === receivedId);
    if (user) {
      io.to(user.socketId).emit("answer-message", data);
    }
  });
});

const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server responded at ${PORT} PORT...`);
    });
  })
  .catch((error) => console.log(error));
