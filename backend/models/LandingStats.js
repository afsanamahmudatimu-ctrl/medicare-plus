const mongoose = require("mongoose");

const landingSchema = new mongoose.Schema({

    hospitals:{
        type:Number,
        default:0
    },

    patients:{
        type:Number,
        default:0
    },

    doctors:{
        type:Number,
        default:0
    },

    uptime:{
        type:String,
        default:"99.9%"
    },

    activePatients:{
        type:Number,
        default:0
    },

    appointments:{
        type:Number,
        default:0
    },

    bedOccupancy:{
        type:String,
        default:"0%"
    },

    labPending:{
        type:Number,
        default:0
    }

});


module.exports = mongoose.model(
    "LandingStats",
    landingSchema
);