const Branch = require("../models/branch");
let Location = require("../models/location");
let express = require("express");
let app = express.Router();

//get all locations
app.get("/", async (req, res) => {
  try {
    const loactions = await Location.find();
    res.json(loactions);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//get a location by id
app.get("/:id", async (req, res) => {
  try {
    const locationId = req.params.id;
    const location = await Location.findById(locationId);
    if (!location) {
      res.status(404).json({ message: "Location not found", code: 404 });
    } else {
      res.status(200).json(location);
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//Get all branches in a particular location
app.get("/:id/branches", async (req, res) => {
  try {
    const locationId = req.params.id;
    const location = await Location.findById(locationId);

    if (!location) {
      res.status(404).json({ message: "Location not found", code: 404 });
    } else {
      const branches = await Branch.find({ location_id: locationId }).populate(
        "cinema_id location_id"
      );
      res.json(branches);
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

//create a new location
app.post("/", async (req, res) => {
  try {
    const locationData = req.body;

    const location = new Location(locationData);
    const savedLocation = await location.save();

    res.status(201).json(savedLocation);
  } catch (err) {
    res.status(500).json({ err: err.message }); 
  }
});

//update a location
app.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findById(id);

    if (!location)
      return res.status(404).json({ msg: "Id does not exist", code: 404 });

    let data = location._doc;
    location.overwrite({ ...data, ...req.body });
    location.save();

    res.send({ msg: "Location updated", data: location });
  } catch {
    res.status(500).json({ err: err.message });
  }
});
  
//delete a location
app.delete("/:id", async (req, res) => {
  try {   
    const { id } = req.params;
    const location = await Location.findById(id);

    if (!location) {
      res.status(404).json({ msg: "Location not found", code: 404 });
    } else {
      await location.deleteOne();
      res.status(200).send({ msg: "Location has been deleted successfully" });
    }
  } catch {
    res.status(500).json({ err: err.message });
  }
});

module.exports = app;
