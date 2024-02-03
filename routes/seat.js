const express = require("express");
const Seat = require("../models/seat");
const Theater = require("../models/theater");
let app = express.Router();

// Get all seats
app.get("/", async (req, res) => {
  try {
    let { theater_id } = req.query;
    let seats;

    if (theater_id)
      seats = await Seat.find({ theater_id }).populate(
        "theater_id branch_id category_id cinema_id"
      );
    else return res.json({ msg: "Theater id must be passed" });

    res.status(200).json({
      status: "success",
      data: seats,
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// get seats by ID
app.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const seat = await Seat.findById(id).populate(
      "theater_id branch_id category_id"
    );
    if (!seat) {
      res.status(404).json({ msg: "Seat not found!", code: 404 });
    } else {
      res.status(200).json({ status: "success", data: seat });
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Create new seat seat
app.post("/", async (req, res) => {
  try {
    const seatData = req.body;

    const checkForSeat = await Seat.findOne({
      seat_number: req.body.seat_number,
      theater_id: req.body.theater_id,
    });

    if (checkForSeat) {
      return res.status(201).json({ err: "Seat number already exists!" });
    }
    const theater = await Theater.findById(req.body.theater_id);
    if (!theater) {
      return res.status(201).json({ err: "Theater does not exist!" });
    }

    const seat = new Seat(seatData);
    const savedSeat = await seat.save();

    theater.seat_capacity++;
    await theater.save();

    res.status(201).json({
      status: "success",
      data: savedSeat,
    });
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

// Update a seat by ID
app.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const seat = await Seat.findById(id);

    if (!seat)
      return res
        .status(404)
        .json({ msg: "The seat does not exist", code: 404 });

    let data = seat._doc;
    seat.overwrite({ ...data, ...req.body });
    seat.save();

    res.send({ msg: "Seat details updated", data: seat });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Delete a seat by ID
app.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const seat = await Seat.findById(id);

    if (!seat) {
      res.status(404).json({ msg: "Seat not found", code: 404 });
    } else {
      await seat.deleteOne();
      res.status(200).send({ msg: "seat deleted successfully", code: 200 });
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = app;
