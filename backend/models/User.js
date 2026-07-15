const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    firstName:{
        type:String,
        required:true,
    },

    lastName:{
        type:String,
        required:true,
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },

    password:{
        type:String,
        required:true,
    },

    phone:{
        type:String,
    },

    role:{
        type:String,
        enum:["Admin","Doctor","Patient","Receptionist"],
        default:"Patient",
    },

    profileImage:{
        type:String,
        default:"",
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("User", userSchema);