const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://sauravphulera:extrmz1@cluster0.ml1fk.mongodb.net/devTinder"
  );
};

module.exports = connectDB;

// connectDB()
//   .then(() => {
//     console.log("database connection successful!");
//   })
//   .catch(() => {
//     console.log("something went wrong in connecting to db");
//   });
