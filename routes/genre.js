let Genre = require('../models/genre');
let express = require('express');
let app = express.Router()

//get all genres
app.get('/', async (req, res) => {
    try{
        const genres = await Genre.find();
        res.json(genres)
    } catch (err) {
        res.status(500).json({ err: err.message})
    }
})

//get a genres by id
app.get('/:id', async (req, res) => {
    try{
        const genreId = req.params.id;
        const genre = await Genre.findById(genreId);
        if (!genre) {
            res.status(404).json({ message: "Genre not found", code: 404});
        } else {
            res.status(200).json(genre)
        }
    } catch (err) {
        res.status(500).json({ err: err.message})
    }
})

//create a new genre
app.post('/', async (req, res) => {
    try{
        const genreData = req.body;

        const genre = new Genre(genreData);
        const savedGenre = await genre.save();

        res.status(201).json(savedGenre);
    } catch {
        res.status(500).json({ err: err.message })
    }
})

//update a genre
app.put('/:id', async (req, res) => {
    try{
        const {id} = req.params;
        const genre = await Genre.findById(id);
    
        if(!genre) return res.status(404).json({msg: "Id does not exist", code:404 })
        
        let data = genre._doc;
        genre.overwrite({...data, ...req.body})
        genre.save();
  
        res.send({msg:"Genre updated", data:genre})
    } catch{
        res.status(500).json({ err: err.message })
    }
})

//delete a genre
app.delete('/:id', async (req, res) => {
    try{
        const { id } = req.params;
        const genre = await Genre.findById(id);
    
        if (!genre) {
          res.status(404).json({ msg: "Genre not found", code: 404 });
        } else { await genre.deleteOne();
          res.status(200).send({ msg: "Genre has been deleted successfully"});
        }
    } catch {
        res.status(500).json({ err: err.message})
    }
})

module.exports = app