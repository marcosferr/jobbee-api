const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const con = await mongoose.connect(process.env.DB_LOCAL_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Database connected with host: ${con.connection.host}`);
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDatabase;
