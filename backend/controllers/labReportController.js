const LabReport=require("../models/LabReport");

exports.getReports=async(req,res)=>{

try{

const reports=await LabReport.find()

.populate("patient")

.populate("doctor")

.sort({createdAt:-1});

res.json(reports);

}catch(err){

res.status(500).json({

message:err.message

});

}

};

exports.createReport=async(req,res)=>{

try{

const report=await LabReport.create(req.body);

const result=await LabReport.findById(report._id)

.populate("patient")

.populate("doctor");

res.status(201).json(result);

}catch(err){

res.status(500).json({

message:err.message

});

}

};

exports.updateReport=async(req,res)=>{

try{

const report=await LabReport.findByIdAndUpdate(

req.params.id,

req.body,

{new:true}

)

.populate("patient")

.populate("doctor");

res.json(report);

}catch(err){

res.status(500).json({

message:err.message

});

}

};

exports.deleteReport=async(req,res)=>{

try{

await LabReport.findByIdAndDelete(req.params.id);

res.json({

message:"Report Deleted"

});

}catch(err){

res.status(500).json({

message:err.message

});

}

};