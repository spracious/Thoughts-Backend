const express = require("express");
const User = require("../models/user");
const Booking = require("../models/booking");
const { Protect } = require("../middleware/auth");
const { upload, handleUpload } = require("../utils/upload");
let app = express.Router();

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

// Get all users
app.get("/", async (req, res) => {
  try {
    const user = await User.find()
      .populate("cinema_id branch_id")
      .select("-is_verified");
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// get user by ID
app.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const user = await User.findById(id)
      .populate("cinema_id")
      .populate({
        path: "branch_id",
        populate: {
          path: "location_id",
        },
      })
      .select("-is_verified");
    if (!user) {
      res.status(404).json({ msg: "User not found", code: 404 });
    } else {
      res.status(200).json({ status: "success", data: user });
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// get all movies a user has booked

app.get("/:id/bookings", async (req, res) => {
  try {
    // 1) get the user from the database
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: "User not found", code: 404 });
    }

    // 2) get all bookings with the user's id present
    const allBookings = await Booking.find({ user_id: id });
    console.log(allBookings);

    if (allBookings.length < 1) {
      return res
        .status(200)
        .json({ msg: "No booking found for this user", code: 200 });
    }
    // 3) send the bookings as a response to the query
    res.status(200).json({ status: "success", data: allBookings });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Update a user by ID
app.patch("/:id", async (req, res) => {
  try {
    // 1) Create err if user POST's password data
    if (req.body.password) {
      return res.status(400).json({
        msg: "This route is not for password updates. Please use /updateMyPassword.",
      });
    }

    // 2) filter for unwanted field that are not allowed to be updated
    const filteredBody = filterObj(
      req.body,
      "name",
      "email",
      "cinema_id",
      "branch_id"
    );

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser)
      return res
        .status(404)
        .json({ msg: "The user does not exist", code: 404 });

    res.status(200).json({ msg: "User updated", data: updatedUser });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Upload image for user
app.put("/:id/resources", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ msg: "The id supplied does not exist", code: 404 });
    }

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const data = await handleUpload(dataURI);

      user.image = data.url;
      await user.save({ validateBeforeSave: false });
      res.json({ msg: "Data saved", code: 200 });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ err: "Server error has occurred" });
  }
});

// Delete a user by ID
app.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ msg: "User not found", code: 404 });
    } else {
      // await User.findByIdAndUpdate(req.user._id, { active: false });
      await User.findByIdAndDelete(id);
      res.status(200).json({ msg: "User successfully deleted" });
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = app;
