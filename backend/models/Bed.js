const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
{
    ward:{
        type:String,
        required:true,
        trim:true
    },

    total:{
        type:Number,
        required:true,
        min:0
    },

    available:{
        type:Number,
        required:true,
        min:0
    },

    status:{
        type:String,
        enum:["Available","Limited","Full"],
        default:"Available"
    }

},
{
    timestamps:true
});

module.exports=mongoose.model("Bed",bedSchema);