const express = require("express");
const app = express.Router();
const Cinema = require("../models/cinema");
const Branch = require("../models/branch");
const { upload, handleUpload } = require("../utils/upload");
require("dotenv").config();

// Get all archived cinema
app.get("/archived", async (req, res) => {
  try {
    const cinemas = await Cinema.find({ is_deleted: true });

    res.send(cinemas);
  } catch (error) {
    // console.error('Error fetching archived cinemas:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all cinemas
app.get("/", async (req, res) => {
  try {
    const cinemas = await Cinema.find({ is_deleted: false });
    
    res.status(200).json(cinemas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
});

// Get a cinema by ID
app.get("/:id", async (req, res) => {
  try {
    const cinemaId = req.params.id;
    const cinema = await Cinema.findById(cinemaId);
    if (!cinema) {
      res.status(404).json({ msg: "Cinema not found", code: 404 });
    } else {
      res.status(200).json(cinema);
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Create a new cinema
app.post("/", async (req, res) => {
  try {
    const cinemaData = req.body;
    const cinema = new Cinema(cinemaData);
    const savedCinema = await cinema.save();
    return res.status(201).json(savedCinema);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a cinema by ID
app.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cinema = await Cinema.findById(id);

    if (!cinema)
      return res
        .status(404)
        .json({ msg: "The id supplied does not exist", code: 404 });

    cinema.set({ ...req.body });
    const updatedCinema = await cinema.save();

    res.status(200).json({ msg: "Cinema updated", data: updatedCinema });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Archieve a cinema by ID
app.put("/:id/archived", async (req, res) => {
  try {
    const { id } = req.params;
    const cinema = await Cinema.findById(id);

    if (!cinema) {
      return res
        .status(404)
        .json({ msg: "The id supplied does not exist", code: 404 });
    }

    cinema.is_deleted = true; // Debug statement
    await cinema.save(); // Debug statement

    res.status(200).json({ msg: "Cinema archived" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});




// Upload image for cinema
app.put("/:id/resources", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const cinema = await Cinema.findById(id);

    if (!cinema) {
      return res
        .status(404)
        .json({ msg: "The id supplied does not exist", code: 404 });
    }

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const data = await handleUpload(dataURI);

      cinema.image = data.url;
      await cinema.save();
      return res.json({ msg: "Data saved", code: 200 });
    } else {
      return res.json({
        msg: "Cinema cannot be saved without any image",
        code: 400,
      });
    }
    z;
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ err: "Server error has occurred" });
  }
});

// Delete a cinema by ID
// app.delete("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const cinema = await Cinema.findById(id);

//     if (!cinema) {
//       res.status(404).json({ msg: "Cinema not found", code: 404 });
//     } else {
//       await cinema.deleteOne();
//       res.status(200).json({ msg: "Cinema deleted successfully", code: 200 });
//     }
//   } catch (err) {
//     res.status(500).json({ err: err.message });
//   }
// });

app.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cinema = await Cinema.findById(id);

    if (!cinema) {
      res.status(404).json({ msg: "Cinema not found", code: 404 });
    } else {
      //   const archivedCinema = new ArchivedCinema(cinema.toObject());
      //   await archivedCinema.save();

      await cinema.deleteOne();

      res.status(200).json({ msg: "Cinema deleted successfully", code: 200 });
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = app;
