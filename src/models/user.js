const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = "saurav@dev";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      maxLength: 50,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, // remove spaces
      validate: (val) => {
        if (!validator.isEmail(val)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate: (val) => {
        if (!validator.isStrongPassword(val)) {
          throw new Error("Weak Password. please add a strong pass");
        }
      },
    },
    age: {
      type: Number,
      min: 18, // min for int
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "others"],
        message: `{VALUE} is incorrect status type`,
      },
    },
    photoUrl: {
      type: String,
      default: "https://med.gov.bz/ppu-staff-profiles/dummy-profile-pic/",
      validate: (val) => {
        if (!validator.isURL(val)) {
          throw new Error("Invalid Url");
        }
      },
    },
    about: {
      type: String,
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = function () {
  //arrow func will not work since this keyword is used

  const user = this;
  const token = jwt.sign({ _id: user._id }, SECRET, { expiresIn: "7d" });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInput) {
  //arrow func will not work since this keyword is used
  const user = this;
  const passwordHash = user?.password;
  return await bcrypt.compare(passwordInput, passwordHash); // order should always be password and hash in second argument.
};

const User = mongoose.model("User", userSchema);
module.exports = User;
