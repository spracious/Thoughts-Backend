const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
    {
    post_id:{
         type: mongoose.Schema.Types.ObjectId, ref: 'post',
         },

    user_id: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'user',
     },

    like:{
        type:Boolean,
    },

    status:{
        type:Boolean, 
    },
})

const like = mongoose.model("likes", likeSchema)
module.exports = like