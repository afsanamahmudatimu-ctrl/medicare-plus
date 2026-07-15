const express=require("express");

const router=express.Router();

const {
    getLandingStats
}=require("../controllers/landingController");


router.get("/",getLandingStats);


module.exports=router;