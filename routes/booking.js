const express = require("express");
const Booking = require("../models/booking");
const Seat = require("../models/seat");
const Theater = require("../models/theater");
let app = express.Router();

// get all bookings
// app.get("/", async (req, res) => {
//   let bookings;
//   try {
//     bookings = await Booking.find();
//   } catch (error) {
//     res.status(500).json({ error: err.message })
//   }
//   if (!bookings) {
//     return res.status(404).json("No Bookings Yet")
//   }
//   return res.status(200).json(bookings)
// });

app.get("/", async (req, res) => {
  let bookings = [];
  let { branch_id, cinema_id, theater_id, email } = req.query;
  try {
    if (cinema_id && email) {
      bookings = await Booking.find({ cinema_id, email }).populate(
        "branch_id cinema_id movie_id"
      );
    } else if (branch_id)
      bookings = await Booking.find({ branch_id }).populate(
        "branch_id cinema_id movie_id"
      );
    else if (cinema_id)
      bookings = await Booking.find({ cinema_id }).populate(
        "branch_id cinema_id movie_id"
      );
    else if (theater_id)
      bookings = await Booking.find({ theater_id }).populate(
        "branch_id cinema_id movie_id"
      );
    else
      bookings = await Booking.find({
        cinema_id,
        branch_id,
        theater_id,
      }).select("-password");
    if (!bookings.length) {
      return res.status(200).json(bookings);
    }
    return res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let bookings = [];
    bookings = await Booking.find({ user_id: id }).populate(
      "branch_id cinema_id movie_id"
    );

    if (!bookings.length) {
      return res.status(200).json(bookings);
    }
    return res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// get a single booking
app.get("/:id", async (req, res) => {
  let booking;
  try {
    booking = await Booking.findById(req.params.id).populate(
      "branch_id cinema_id movie_id theater_id"
    );
  } catch (err) {
    console.log(err);
  }
  if (!booking) {
    return res.status(400).json("booking not found");
  }
  return res.status(200).json(booking);
});

// get a single booking
app.get("/:id/ticket-no", async (req, res) => {
  let booking;
  let ticket_no = req.params.id.toLowerCase();
  try {
    booking = await Booking.findOne({ ticket_no }).populate("movie_id");
  } catch (err) {
    res.json(err.message);
  }
  if (!booking) {
    return res.status(404).json({ msg: "Invalid ticket no was passed" });
  }
  return res.status(200).json(booking);
});

// make bookings
app.post("/", async (req, res) => {
  console.log(req.body);
  try {
    let { seats, booking_type, branch_id, theater_id } = req.body;
    let arr = [];
    let seat_arr = [];
    let sub_total = 0;
    let query_arr = [];

    for (let i = 0; i < seats.length; i++) {
      let a = seats[i];
      let seat_query = { seat_number: a.no, branch_id, theater_id };

      query_arr.push(seat_query);

      arr.push(a.no);

      sub_total += a.price;

      let seat = await Seat.findOne(seat_query);
      seat_arr.push(seat);
      console.log(seat);
      if (!seat)
        return res.json({ msg: "Invalid seat number or theater was passed" });

      if (seat.is_booked)
        return res.json({ msg: "Seat has already been booked" });
    }

    let code = Date.now().toString("36");

    let theater = await Theater.findById(theater_id);

    let seat_number = arr[0] + "+" + arr.length;
    req.body.ticket_no = seat_number + code;

    if (booking_type.toUpperCase() == "ONLINE") {
      req.body.counter_id = "";
    }
    if (!theater) return res.json({ msg: "Invalid theather id was passed" });

    for (let i = 0; i < seat_arr.length; i++) {
      let seat = seat_arr[i];
      seat.is_booked = true;
      seat.save();
    }

    sub_total += req.body.movie_price;

    theater.unavailable_seat += seats.length;
    theater.available_seat -= seats.length;

    if (theater.unavailable_seat == theater.seating_capacity) {
      theater.is_available = false;
    }

    req.body.sub_total = sub_total;
    const booking = new Booking(req.body);

    await theater.save();
    await booking.save();

    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// get a single booking
app.put("/check-in", async (req, res) => {
  let booking;
  let { status, ticket_no } = req.body;

  try {
    booking = await Booking.findOne({ ticket_no });
    booking.checked_in_at = Date.now();
    booking.is_checked = status;
    await booking.save();
  } catch (err) {
    console.log(err.message);
  }
  if (!booking) {
    return res.status(404).json({ msg: "Invalid ticket no was passed" });
  }
  return res.status(200).json(booking);
});

// updating Booking
app.put("/:id", async (req, res) => {
  const { fullname, email, phone, quantity, seat_number } = req.body;
  const bookingId = req.params.id;
  let booking;
  try {
    booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: req.body,
      },
      { new: true }
    );
  } catch (error) {
    console.log(error);
  }
  if (!booking) {
    return res
      .status(500)
      .json({ msg: "Unable to Update booking.", code: 500 });
  }
  return res.status(200).json(booking);
});

// deleting booking by id
app.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const booked = await Booking.findById(id);

    if (!booked) {
      res.status(404).json({ msg: "Booking not found", code: 404 });
    } else {
      const { seats, branch_id, theater_id } = booked;

      seats.forEach(async (el) => {
        const seat_query = { seat_number: el.no, branch_id, theater_id };
        const seat = await Seat.findOne(seat_query);
        seat.is_booked = false;
        await seat.save();
      });

      await booked.deleteOne();
      res.status(200).json({ msg: "Booking deleted", code: 200 });
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = app;
