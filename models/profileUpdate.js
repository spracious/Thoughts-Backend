const mongoose=require('mongoose')
const Schema=mongoose.Schema

//hello
const profileUpdateSchema=new Schema({
    employmentStatus:{type:String,},
    location:{type:String,},
    skills:[{ type: String }],
    nationality:{type:String,},
    bio:{type:String,},
    image:{type:String},
    gender:{type:String},
    user_id:{type:mongoose.Schema.Types.ObjectId, ref:'user'},
    // status:{type:Boolean},
 })

const profileUpdates=mongoose.model("profileUpdates", profileUpdateSchema)
module.exports=profileUpdates