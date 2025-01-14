const express = require("express");
const app = express();
const mongoose = require("mongoose");
//const userRouter = require("./routers/user");
const authRouter = require("./routers/auth");
const { restrictTo, verifyJWTAuthToken } = require("./middleware/auth");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB",err);
});

// Middleware
app.use(express.json());

// Routes
app.get("/", verifyJWTAuthToken, (req, res) => {
  res.send("Hello World");
});
app.use("/auth", authRouter);

// Start the server
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

//Handing Error
process.on("unhandledRejection", (err) => {
  console.error("An Error Occured: ", err.message);
  server.close(() => {
    process.exit(1);
  });
});