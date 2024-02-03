const express = require("express");
const app = express.Router();
const Branch = require("../models/branch");
const Theater = require("../models/theater");
const Seat = require("../models/seat");

// Get all theaters
app.get("/", async (req, res) => {
  try {
    let { branch_id, cinema_id } = req.query;
    let theaters;

    if (branch_id && cinema_id)
      theaters = await Theater.find({ branch_id, cinema_id }).populate(
        "branch_id cinema_id"
      );
    else theaters = await Theater.find().populate("branch_id cinema_id");

    res.json(theaters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "An error occurred", code: 500 });
  }
});

// app.get("/theater-in-cinema", async (req, res) => {
//   try {
//     let theaters = [];
//     let { branch_id, cinema_id } = req.query;
//     if (branch_id && cinema_id) {
//       theaters = await Theater.find({ branch_id }).populate("branch_id");

//       if (theaters.length < 1) {
//         res.json(theaters);
//       }

//       theaters.filter((el) => theaters.branch_id.cinema_id === cinema_id);

//       return res.json(theaters);
//     }
//   } catch (err) {
//     res.status(500).json({ err: err.message });
//   }
// });

// Get a theater by ID
app.get("/:id", async (req, res) => {
  try {
    const theaterId = req.params.id;
    const theater = await Theater.findById(theaterId);
    if (!theater) {
      res.status(404).json({ message: "Theater not found", code: 404 });
    } else {
      res.status(200).json(theater);
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Get a seat theater
app.get("/:id/seats", async (req, res) => {
  try {
    const theaterId = req.params.id;
    const theater = await Theater.findById(theaterId);

    if (!theater) {
      res.status(404).json({ message: "Theater not found", code: 404 });
    } else {
      let seats = await Seat.find().populate("category_id");
      res.json(seats);
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

app.get("/:id/seats-summary", async (req, res) => {
  try {
    const theaterId = req.params.id;
    const theater = await Theater.findById(theaterId);

    if (!theater) {
      res.status(404).json({ message: "Theater not found", code: 404 });
    } else {
      let seats = await Seat.find({theater_id:theaterId}).populate("category_id");
      const col_matrix_1 = [];
      const col_matrix_2 = [];

      for (let i = 0; i < seats.length; i++) {
        let seat = { ...seats[i]._doc };
        if (seat.is_booked) {
          seat.is_active = false;
        } else {
          seat.is_active = true;
        }
        seat.position === "LEFT"
          ? col_matrix_1.push(seat)
          : col_matrix_2.push(seat);
      }

      res.json({
        col_matrix_1,
        col_matrix_2,
      });
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});
// Create a new theater
app.post("/", async (req, res) => {
  try {
    let { branch_id } = req.body;

    let branch = await Branch.findById(branch_id);

    if (!branch)
      return res.status(404).send({ msg: "Branch does not exist", code: 404 });

    req.body.unavailable_seat = 0;
    req.body.available_seat = req.body.seating_capacity;

    let theater = new Theater(req.body);
    await theater.save();
    res.send(theater);
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

// Create a new theater
app.post("/reset-seats", async (req, res) => {
  try {
    let { theater_id } = req.body;

    let theater = await Theater.findById(theater_id);

    if (!theater)
      return res.status(404).send({ msg: "Theater does not exist", code: 404 });

    theater.unavailable_seat = 0;
    theater.available_seat = theater.seating_capacity;
    theater.is_available = true;

    await Seat.updateMany({ theater_id }, { is_booked: false });
    await theater.save();

    res.send(theater);
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

// Update a theater by ID
app.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const theater = await Theater.findById(id);

    if (!theater)
      return res
        .status(404)
        .json({ msg: "The id supplied does not exist", code: 404 });

    let data = theater._doc;
    theater.overwrite({ ...data, ...req.body });
    theater.save();

    res.send({ msg: "theater updated", data: theater });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Delete a theater by ID
app.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const theater = await Theater.findById(id);

    if (!theater) {
      res.status(404).json({ msg: "theater not found", code: 404 });
    } else {
      await theater.deleteOne();
      res.status(200).send({ msg: "theater deleted successfully", code: 200 });
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = app;