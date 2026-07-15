const LandingStats = require("../models/LandingStats");


exports.getLandingStats = async(req,res)=>{

    try{

        const stats = await LandingStats.findOne();


        res.status(200).json({
            success:true,
            data:stats
        });


    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

};