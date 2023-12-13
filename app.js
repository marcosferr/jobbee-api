const express = require("express");
const dotenv = require("dotenv");

app = express();

//Setting up config.env file variables
dotenv.config({ path: "./config/config.env" });
const PORT = process.env.port;

//Setting up database
const connectDatabase = require("./config/database");

//Connecting to database
connectDatabase();

//Importing all routes
app.use(express.json());
const jobs = require("./routes/jobsRouter");

app.use("/api/v1", jobs);

app.listen(PORT, () => {
  console.log(
    `Server running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
  );
});
