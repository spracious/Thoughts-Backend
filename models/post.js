const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
    category:{
        type:String,
        required: true,
    },

    title:{
        type:String,
        required: true,
    },

    content:{
        type:String,
        required: true,
    },

    image:{
        type:String,
    },

    status:{
        type:Boolean,
    },

    user_id: {
         type: mongoose.Schema.Types.ObjectId, ref: 'user',
         required: true,
         },
         
         is_deleted: {
            type: Boolean,
            default: false,
          },
    
},

  { timestamps: true }
)

const post = mongoose.model("posts", postSchema)
module.exports = post