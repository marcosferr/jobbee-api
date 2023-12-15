const express = require("express");
const dotenv = require("dotenv");
const ErrorHandler = require("./utils/errorHandler");
app = express();
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth");

//Setting up config.env file variables
dotenv.config({ path: "./config/config.env" });
const PORT = process.env.port;

//Setting up database
const connectDatabase = require("./config/database");
const errorMiddleware = require("./middlewares/errors");
//Connecting to database
connectDatabase();

// Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Uncaught Exception");
  server.close(() => {
    process.exit(1);
  });
});
// Set cookie parser
app.use(cookieParser());
//Importing all routes
app.use(express.json());
const jobs = require("./routes/jobsRouter");

app.use("/api/v1", jobs);
app.use("/api/v1", authRouter);
app.all("*", (req, res, next) => {
  next(new ErrorHandler(404, `${req.originalUrl} route not found`));
});
//use error handle
app.use(errorMiddleware);
const server = app.listen(PORT, () => {
  console.log(
    `Server running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});

// Handling unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to Unhandled Promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
