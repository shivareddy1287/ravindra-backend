const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const userRoutes = require("./routes/users/userRoute");
const photosRoutes = require("./routes/photos/photosRoute");

const app = express();

const PORT = process.env.PORT || 5000;

//configuraions  access
dotenv.config();

// qrbw6wU7plZSjCBI

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
// app.use(cors());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

//Users route
app.use("/api/users", userRoutes);
app.use("/api/photos", photosRoutes);

const start = async () => {
  if (!process.env.MONGODB_URL) {
    throw new Error("auth DB_URI must be defined");
  }
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Server connected to MongoDb!");
  } catch (err) {
    console.error(err);
    throw new Error("auth DB_URI must be defined");
  }

  app.listen(PORT, () => {
    console.log(`Server is connected to ${PORT}`);
  });
};

// start();

start();
