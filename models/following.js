const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const totalLikeSchema = new Schema({
    post_id:{type:String, required:true},
    status:{type:Boolean},
    user_id:{type:String, required: true},
    like:{type:String, required: true},
    totalLike:{type:String, required: true}
})

const totalLike = mongoose.model("totalLike", totalLikeSchema)
module.exports = like