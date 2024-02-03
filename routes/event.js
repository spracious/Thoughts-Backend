const express = require('express');
let app = express.Router();
let Event = require('../models/event');
const Branch = require('../models/branch');


  // Get all events
  app.get('/', async (req, res) => {
    try{
      let events = await Event.find().populate("branch_id")
      res.json(events)
    }catch(err){
      res.status(500).json({error: err.message});
    }
  });

   // Get an event by ID
   app.get('/:id', async (req, res) => {
    try {
      const eventId = req.params.id;
      const event = await Event.findById(eventId);
      if (!event) {
        res.status(404).json({ message: 'Event not found', code: 404 });
      } else {
        res.status(200).json(event);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Create a new event
app.post('/', async (req, res) => {
    try {
      let {branch_id} = req.body;

      let branch = await Branch.findById(branch_id)
  
      if(!branch) return res.status(404).send({msg:"Branch does not exist", code:404})
     
      let event = new Event(req.body);
		await event.save();
		res.send(event);

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Update an event by ID
  app.put('/:id', async (req, res) => {
    try {
      const {id} = req.params;
      const event = await Event.findById(id);
  
      if(!event) return res.status(404).json({msg:"The id supplied does not exist"})
     
      let data = event._doc;
      event.overwrite({...data,...req.body})
      event.save()
  
    res.send({msg:"event updated",data:event})
    
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Delete an event by ID
  app.delete('/event/:id', async (req, res) => {
    try {
      const {id} = req.params;
      const event = await Event.findById(id);
  
      if (!event) {
        res.status(404).json({ message: "Event not found", code: 404 });
      } else {
          await event.deleteOne();
          res.status(200).send({msg: "Event deleted successfully", code: 200});
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


module.exports = app