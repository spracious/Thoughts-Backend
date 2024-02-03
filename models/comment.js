const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
    post_id:{
        type:String,
        required: true,
    },

    status:{
        type:Boolean
    },

    user_id: {
         type: mongoose.Schema.Types.ObjectId, ref: 'user',
         required: true,
         },

    comment:{
        type:String,
        required: true,
    },

    is_deleted: {
        type: Boolean,
        default: false,
      },
},
{ timestamps: true }
)

const comment = mongoose.model("comments", commentSchema)
module.exports = comment



 