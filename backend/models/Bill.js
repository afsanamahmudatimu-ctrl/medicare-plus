const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
{
    patient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    appointment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Appointment"
    },

    invoiceNo:{
        type:String,
        unique:true,
        required:true
    },

    description:{
        type:String,
        default:""
    },

    amount:{
        type:Number,
        required:true
    },

    dueDate:{
        type:Date
    },

    paymentMethod:{
        type:String,
        enum:["Cash","Card","Bkash","Nagad","Rocket"],
        default:"Cash"
    },

    status:{
        type:String,
        enum:["Pending","Paid"],
        default:"Pending"
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("Bill", billSchema);