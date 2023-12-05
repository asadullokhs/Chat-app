const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const path = require("path");
dotenv.config();

// route
const authRouter = require("./src/router/authRouter");
const userRouter = require("./src/router/userRouter");

const app = express();
const PORT = process.env.PORT || 4002;

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

const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server responded at ${PORT} PORT...`);
    });
  })
  .catch((error) => console.log(error));
