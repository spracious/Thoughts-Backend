const express = require("express");
let app = express.Router();
const Cinema = require("../models/cinema");
let Category = require("../models/category");

// Get all categories
app.get("/", async (req, res) => {
  try {
    let {cinema_id} = req.query
    let categories;

    if(cinema_id)  categories = await Category.find({cinema_id}).populate("cinema_id");
    else categories = await Category.find().populate("cinema_id");

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a category by ID
app.get("/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json({ message: "Category not found", code: 404 });
    } else {
      res.status(200).json(category);
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Create a new category
app.post("/", async (req, res) => {
  try {
    const { cinema_id } = req.body;

    let cinema = await Cinema.findById(cinema_id);

    if (!cinema)
      return res.status(404).send({ msg: "Cinema does not exist", code: 404 });

    let category = new Category(req.body);
    await category.save();
    res.send(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a category by ID
app.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category)
      return res
        .status(404)
        .json({ msg: "The id supplied does not exist", code: 404 });

    let data = category._doc;
    category.overwrite({ ...data, ...req.body });
    category.save();

    res.send({ msg: "category updated", data: category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a category by ID
app.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      res.status(404).json({ msg: "Category not found", code: 404 });
    } else {
      await category.deleteOne();
      res.status(200).send({ msg: "Category deleted successfully", code: 200 });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
