const Bed=require("../models/Bed");

// Get All Beds

exports.getBeds=async(req,res)=>{

try{

const beds=await Bed.find().sort({createdAt:-1});

res.json(beds);

}catch(err){

res.status(500).json({

message:err.message

});

}

};


// Create Bed

exports.createBed=async(req,res)=>{

try{

const bed=await Bed.create(req.body);

res.status(201).json(bed);

}catch(err){

res.status(400).json({

message:err.message

});

}

};


// Update Bed

exports.updateBed=async(req,res)=>{

try{

const bed=await Bed.findByIdAndUpdate(

req.params.id,

req.body,

{

new:true,

runValidators:true

}

);

if(!bed){

return res.status(404).json({

message:"Bed not found"

});

}

res.json(bed);

}catch(err){

res.status(400).json({

message:err.message

});

}

};


// Delete Bed

exports.deleteBed=async(req,res)=>{

try{

const bed=await Bed.findByIdAndDelete(req.params.id);

if(!bed){

return res.status(404).json({

message:"Bed not found"

});

}

res.json({

message:"Bed Deleted"

});

}catch(err){

res.status(500).json({

message:err.message

});

}

};