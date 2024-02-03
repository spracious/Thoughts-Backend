let Screen = require('../models/screen');
let express = require('express');
let app = express.Router()

//get all screens
app.get('/', async function (req, res){
    try{
        let screens = await Screen.find().populate("cinema_id branch_id theater_id");
        res.status(200).json(screens)
    } catch (error) {
        res.status(500).json({ error: error.message})
    }
})

//get a screen by id
app.get('/:id', async function (req, res){
    try{
        const screenId = req.params.id;
        const screen = await Screen.findById(screenId);
        
        if(!screen) {
            res.status(404).json({msg: "Screen not Found", code: 404})
        } else {
            res.status(200).json(screen)
        }
    } catch(err){
        res.status(500).send({ err: err.message})
    }
})

//create a new screen
app.post('/', async function (req, res){
    try{
        const screenData = req.body;

        const screen = await Screen(screenData);
        const savedScreen = await screen.save();
        res.status(201).json({
            status: "success",
            data: savedScreen,
        });
    } catch (err){
        res.status(400).send({err: err.message})
    }
})

//update a screen by id
app.put('/:id', async function (req, res){
    try{
        const {id} = req.params;
        const screen = await Screen.findById(id);

        if(!screen) return res.status(404).json({ msg: "This Screen id does not exist", code:404})

        let data = screen._doc;
        screen.overwrite({ ...data, ...req.body });
        screen.save();
        res.send({msg: "Th screen has been updated", data: screen })
    }catch (err){
        res.status(500).json({err: err.message})
    }
})

//delete a screen
app.delete('/:id', async function (req, res){
    try{
        const {id} = req.params;
        const screen = await Screen.findById(id)

        if (!screen) {
            res.status(404).json({ msg: "Screen not found",code:404 });
          } else {
            await screen.deleteOne();
            res.status(200).send({msg:"Screen deleted successfully",code:200});
          }
    } catch (err){
        res.status(500).send({err: err.message})
    }
})

module.exports = app