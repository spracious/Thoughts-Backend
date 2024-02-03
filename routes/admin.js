const express = require("express");
const app = express.Router();
const Cinema = require("../models/cinema");
const Theater = require("../models/theater");
const Booking = require("../models/booking");
const User = require("../models/user");
const Screen = require("../models/screen");
const Management = require("../models/management");
const Movie = require("../models/movie");
const Seat = require("../models/seat");
const Branch = require("../models/branch");
const MovieSchedule = require("../models/movie_schedule");
const Location = require("../models/location");

// summary
app.get("/", async (req, res) => {
  try {
    const screen = await Theater.aggregate([
      { $match: {} },
      { $group: { _id: null, screen: { $sum: "$screen" } } },
    ]);
    const total_screen = screen[0] || 0;
    const cinemas = await Cinema.countDocuments({ is_deleted: false });
    const theaters = await Theater.countDocuments();
    const bookings = await Booking.countDocuments();
    const users = await User.countDocuments();
    const screens = total_screen.screen;
    const cinema_admin = await Management.countDocuments({ role: "CINEMA" });
    const counter_admin = await Management.countDocuments({ role: "COUNTER" });
    const theater_admin = await Management.countDocuments({ role: "THEATER" });
    const account_admin = await Management.countDocuments({ role: "ACCOUNT" });
    const movie = await Movie.countDocuments();
    const seat = await Seat.countDocuments();
    const branch = await Branch.countDocuments();
    const movie_schedule = await MovieSchedule.countDocuments();
    const location = await Location.countDocuments();

    res.status(200).json({
      cinemas,
      theaters,
      bookings,
      users,
      screens,
      cinema_admin,
      counter_admin,
      theater_admin,
      account_admin,
      movie,
      seat,
      branch,
      movie_schedule,
      location,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
