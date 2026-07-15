const mongoose = require("mongoose");

const labReportSchema = new mongoose.Schema(
{
    patient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Patient",
        required:true
    },

    doctor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Doctor"
    },

    reportType:{
        type:String,
        required:true
    },

    result:{
        type:String,
        default:""
    },

    file:{
        type:String,
        default:""
    },

    status:{
        type:String,
        enum:["Pending","Processing","Completed"],
        default:"Pending"
    }

},
{
    timestamps:true
});

module.exports=mongoose.model("LabReport",labReportSchema);