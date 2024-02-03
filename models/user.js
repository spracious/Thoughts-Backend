const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [8, "password must be more or equal to 8 characters"],
    select: false,
  },
  active: { type: Boolean, default: true, select: false },
  is_verified: { type: Boolean, default: false },
  cinema_id: { type: String, required: true, ref: "cinemas" },
  branch_id: { type: String, required: true, ref: "branches" },
  image: { type: String },
  created_at: { type: Date, default: Date.now },
});

UserSchema.pre("save", async function (next) {
  // Only run this password if the password was actually modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

UserSchema.pre(/^find/, function (next) {
  // hide users with active field set to false
  this.find({ active: { $ne: false } });
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("users", UserSchema);
module.exports = User;
