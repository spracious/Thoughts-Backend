const mongoose=require('mongoose')
const Schema=mongoose.Schema

//hello
const profileSchema=new Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:'user'},
    employmentStatus:{type:String, required:true},
    location:{type:String, required:true,},
    skills:{type:[String], required:true,},
    status:{type:String, required:true,},
    nationality:{type:String, required:true,},
    bio:{type:String, required: true},
    status:{type:Boolean},
 })

const profiles=mongoose.model("Users", profileSchema)
module.exports=profiles