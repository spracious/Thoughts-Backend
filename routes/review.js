let Review = require('../models/review');
let express = require('express');
let app = express.Router()

//get all review
app.get('/', async (req, res) => {
    try{
        const review = await Review.find().populate();
        res.status(200).json({
            status: "success",
            data: review,
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//get a review by id
app.get('/:id', async (req, res) => {
    try{
        const reviewId = req.params.id;
        const review = await Review.findById(reviewId);
        
        if(!review) {
            res.status(404).json({ message: "Review not Found", code:404 })
        } else {
            res.status(200).json(review);
        }
    } catch(err){
        res.status(500).json({ err: err.message })
    }
})

//create a new review
app.post('/', async (req, res) => {
    try{
        const reviewData = req.body;

        const review = new Review(reviewData);
        const savedReview = await review.save();
        res.status(201).json(savedReview);
    } catch (error){
        res.status(400).json({ error: error.message });
    }
})

//update a review by id
app.put('/:id', async (req, res) => {
    try{
        const {id} = req.params;
        const review = await Review.findById(id);

        if(!review) return res.status(404).json({msg: "This Review id does not exist", code:404 })

        let data = review._doc;
        review.overwrite({...data, ...req.body})
        review.save()

        res.send({msg: "Review has been updated", data:review})

    }catch (err){
        res.status(500).send(err.message)
    }
})

//delete a review
app.delete('/:id', async (req, res) => {
    try{
        const {id} = req.params;
        const review = await Review.findById(id);

        if (!review) {
            res.status(404).json({ msg: "review not found", code:404 })
        } else {
            await review.deleteOne();
            res.status(200).send({msg: "review has been deleted successfully", code:200});
        }
    } catch (err){
        res.status(500).json({err: err.message})
    }
})

module.exports = app