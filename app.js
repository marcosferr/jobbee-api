const express = require("express");
const dotenv = require("dotenv");

const ErrorHandler = require("./utils/errorHandler");
const app = express();
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const userRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
//Setting up CORS
app.use(cors());
//Preventing HTTP param pollution
app.use(hpp());
//Preventing XSS attacks
app.use(xssClean());
//Preventing NoSQL injections
app.use(mongoSanitize());

//Setting up security headers
app.use(helmet());

//Setting up rate limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 mins
  max: 100, //100 requests
});

app.use(limiter);
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
// Handle file uploads
app.use(fileUpload());
//Importing all routes
app.use(express.json());
const jobs = require("./routes/jobsRouter");
const users = require("./models/users");
app.use("/api/v1", userRouter);
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
