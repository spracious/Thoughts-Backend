const express = require('express');
let app = express.Router();
let Websetting = require('../models/websetting');
const {upload,handleUpload} = require('../utils/upload')
require("dotenv").config();


// Get all archived websetting
app.get("/archived", async (req, res) => {
  try {
    const websetting = await Websetting.find({ is_deleted: true });

    res.send(websetting);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

  // Get the websettings
  app.get('/', async (req, res) => {
    try {
      const websettings = await Websetting.find({ is_deleted: false });
      res.status(200).json(websettings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a websetting by ID
app.get("/:id", async (req, res) => {
  try {
    const websettingId = req.params.id;
    const websetting = await Websetting.findById(websettingId);
    if (!websetting) {
      res.status(404).json({ msg: "websetting not found", code: 404 });
    } else {
      res.status(200).json(websetting);
    }
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}); 

// Create a new websetting
app.post('/', async (req, res) => {
    try {
      const websettingData = req.body;
      const websetting = new Websetting(websettingData);
      const savedWebsetting = await websetting.save();
      res.status(201).json(savedWebsetting);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
    
  // Update the websettings
  app.put('/:id', async (req, res) => {
    try {
      const {id} = req.params;
      const websetting = await Websetting.findById(id);
  
      if(!websetting) return res.status(404).json({msg:"The id supplied does not exist", code:404})
     
      let data = websetting._doc;
      websetting.overwrite({...data,...req.body})
      websetting.save()
  
    res.send({msg:"Websetting updated",data:websetting})

    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });

  // Archieve a websetting by ID
app.put("/:id/archived", async (req, res) => {
  try {
    const { id } = req.params;
    const websetting = await Websetting.findById(id);

    if (!websetting)
      return res
        .status(404)
        .json({ msg: "The id supplied does not exist", code: 404 });

        websetting.is_deleted = req.body.status;
    await websetting.save();

    res.status(200).json({ msg: "websetting archieved" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Upload image for websetting
app.put("/:id/resources", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const websetting = await Websetting.findById(id);

    if (!websetting) {
      return res
        .status(404)
        .json({ msg: "The id supplied does not exist", code: 404 });
    }

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const data = await handleUpload(dataURI);

      websetting.website_logo = data.url;
      await websetting.save();
      res.json({ msg: "Data saved", code: 200 });
    } else {
      res.json({
        msg: "websetting cannot be saved without any image",
        code: 400,
      });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ err: "Server error has occurred" });
  }
});

   // Delete a websettings by ID
   app.delete('/:id', async (req, res) => {
    try {
      const {id} = req.params;
      const websettings = await Websetting.findById(id);
  
      if (!websettings) {
        res.status(404).json({ message: "websettings not found",code:404 });
      } else {
          await websettings.deleteOne();
          res.status(200).send({msg:"websettings deleted successfully", code:200});
      }
    } catch (err) {
      res.status(500).json({ err: err.message });
    }
  });


module.exports = app;