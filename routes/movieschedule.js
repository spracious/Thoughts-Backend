const express = require("express");
const MovieSchedule = require("../models/movie_schedule");
// const Movie = require("../models/movie");
// const Cinema = require("../models/cinema")
const { upload, handleUpload } = require("../utils/upload");
let app = express.Router();

// Get all movie schedule
app.get("/", async (req, res) => {
  let movieschedule = [];
  let dates = [];
  try {
    const { movie_id, cinema_id, branch_id } = req.query;
    if (movie_id) {
      movieschedule = await MovieSchedule.find({ movie_id })
        .select("-active")
        .populate("branch_id cinema_id movie_id");
    } else if (cinema_id) {
      movieschedule = await MovieSchedule.find({ cinema_id })
        .select("-active")
        .populate("branch_id cinema_id movie_id");
    } else if (branch_id) {
      movieschedule = await MovieSchedule.find({ branch_id })
        .select("-active")
        .populate("branch_id cinema_id movie_id");
    } else if ((cinema_id, movie_id, branch_id)) {
      movieschedule = await MovieSchedule.find({
        cinema_id,
        movie_id,
        branch_id,
      })
        .select("-active")
        .populate("branch_id cinema_id movie_id");
    } else {
      movieschedule = await MovieSchedule.find()
        .select("-active")
        .populate("branch_id cinema_id movie_id");
    }

    if (!movieschedule.length) {
      return res.status(200).json({
        status: "movie is not scheduled for this cimena!",
        data: movieschedule,
      });
    }

    const categories = {};
    for (let i = 0; i < movieschedule.length; i++) {
      const showTime = movieschedule[i].show_time;
      if (categories[showTime] === 1) continue;
      categories[showTime] = (categories[showTime] || 0) + 1;
      if (showTime.length > 1) {
        for (let j = 0; j < showTime.length; j++) {
          const singleDate = showTime[j];
          dates.push(singleDate);
        }
      } else {
        dates.push(showTime);
      }
    }

    return res.status(200).json({
      status: "success",
      dates,
      data: movieschedule,
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

app.get("/search", async (req, res) => {
  let movieschedule = [];
  let filteredSchedules = [];
  try {
    const { name, cinema_id, branch_id } = req.query;
    if (name && cinema_id && branch_id) {
      movieschedule = await MovieSchedule.find({
        cinema_id,
        branch_id,
      }).populate("movie_id");
      filteredSchedules = movieschedule.map((el) => el.movie_id.name === name);
    }

    return res.status(200).json({
      status: "success",
      data: filteredSchedules,
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// get movie schedule by ID
app.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const movieschedule = await MovieSchedule.findById(id)
      .select("-active")
      .populate("branch_id cinema_id movie_id");
    if (!movieschedule) {
      res.status(404).json({ msg: "Movie schedule not found", code: 404 });
    } else {
      res.status(200).json({ status: "success", data: movieschedule });
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Create new movie schedule
app.post("/", async (req, res) => {
  try {
    const moviescheduleData = req.body;

    const movieSchedule = new MovieSchedule(moviescheduleData);
    const savedMovieSchedule = await movieSchedule.save();
    res.status(201).json({
      status: "success",
      data: savedMovieSchedule,
    });
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

// Update a movie schedule by ID
app.put("/:id", async (req, res) => {
  try {
    req.body.image = undefined;
    const { id } = req.params;
    const movieschedule = await MovieSchedule.findById(id);

    if (!movieschedule)
      return res
        .status(404)
        .json({ msg: "The movie schedule does not exist!", code: 404 });

    req.body.updated_at = Date.now();
    let data = movieschedule._doc;
    movieschedule.overwrite({ ...data, ...req.body });
    movieschedule.save();

    res
      .status(500)
      .json({ msg: "Movie schedule details updated", data: movieschedule });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Upload image for movie schedule
app.put("/:id/resources", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const movieschedule = await MovieSchedule.findById(id);

    if (!movieschedule) {
      return res
        .status(404)
        .json({ msg: "The id supplied does not exist", code: 404 });
    }

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const data = await handleUpload(dataURI);

      movieschedule.image = data.url;
      await movieschedule.save({ validateBeforeSave: false });
      res.json({ msg: "Data saved", code: 200 });
    } else {
      res.json({
        msg: "Movie schedule cannot be saved without any image",
        code: 400,
      });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ err: "Server error has occurred" });
  }
});

// Delete a movie schedule by ID
app.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const movieschedule = await MovieSchedule.findById(id);

    if (!movieschedule) {
      res.status(404).json({ msg: "Movie schedule not found", code: 404 });
    } else {
      // await seat.deleteOne();
      // res
      //   .status(200)
      //   .send({ msg: "Movie schedule deleted successfully", code: 200 });
      await MovieSchedule.findByIdAndUpdate(movieschedule._id, {
        is_deleted: true,
      });
      res.status(200).json({ msg: "Movie schedule successfully deleted" });
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = app;
