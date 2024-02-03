const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

exports.Protect = async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ msg: "You are not logged in! Please log in to get access." });
  }

  // 2) Verifiying token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res
      .status(401)
      .json({ msg: "The user belonging to this token does not exist." });
  }

  // 4) Check if user changed password after the token was issued
  //   if (currentUser.changedPasswordAfter(decoded.iat)) {
  //     return res
  //       .status(401)
  //       .json({ msg: "User recently changed password! Please log in again." });
  //   }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;

  next();
};
