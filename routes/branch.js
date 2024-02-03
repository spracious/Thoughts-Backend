const express = require("express");
const app = express.Router();
const Branch = require("../models/branch");
const Cinema = require("../models/cinema");
const Location = require("../models/location");
const Theater = require("../models/theater");

// Get all branches
app.get("/", async (req, res) => {
  try {
    const { cinema } = req.query;
    let branches = [];

    if (cinema) {
      branches = await Branch.find({ cinema_id: cinema }).populate(
        "cinema_id location_id"
      );
    } else {
      branches = await Branch.find().populate("cinema_id location_id");
    }
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Get all theaters in a particular branch
app.get("/:id/theaters", async (req, res) => {
  try{
    const branchId = req.params.id;
    const branch = await Branch.findById(branchId);

    if(!branch) {
      res.status(404).json({ message: "Branch not found", code: 404 });
    } else {
      const theaters = await Theater.find({ branch_id: branchId }).populate("branch_id");
      res.json(theaters)
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
})

//Get all cinemas in a particular branch
app.get("/:id/cinemas", async (req, res) => {
  try{
    const branchId = req.params.id;
    const branch = await Branch.findById(branchId);

    if(!branch) {
      res.status(404).json({ message: "Branch not found", code: 404 });
    } else {
      const cinemas = await Cinema.find({ branch_id: branchId }).populate("branch_id");
      res.json(cinemas)
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
})

// Create a new branch
app.post("/", async (req, res) => {
  try {
    const { cinema_id } = req.body;

    let cinema = await Cinema.findById(cinema_id);

    if (!cinema)
      return res.status(404).send({ msg: "Cinema does not exist", code: 404 });

    let branch = new Branch(req.body);
    await branch.save();
    res.send(branch);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a branch by ID
app.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findById(id);

    if (!branch) {
      res.status(404).json({ msg: "Branch not found" });
    } else {
      res.status(200).json(branch);
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Update a branch by ID
app.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findById(id);

    if (!branch)
      return res
        .status(404)
        .json({ msg: "The id supplied does not exist", code: 404 });

    let data = branch._doc;
    branch.overwrite({ ...data, ...req.body });
    branch.save();

    res.send({ msg: "branch updated", data: branch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a branch by ID
app.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findById(id);

    if (!branch) {
      res.status(404).json({ msg: "Branch not found", code: 404 });
    } else {
      await branch.deleteOne();
      res.status(200).send({ msg: "Branch deleted successfully", code: 200 });
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = app;
