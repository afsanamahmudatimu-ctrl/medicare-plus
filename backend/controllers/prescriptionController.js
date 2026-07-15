// controllers/prescriptionController.js
const Prescription = require("../models/Prescription");

exports.getPrescriptions = async (req, res) => {
  try {
    const data = await Prescription.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPrescription = async (req, res) => {
  try {
    const data = await Prescription.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.updatePrescription = async(req,res)=>{

try{

const prescription =
await Prescription.findById(req.params.id);


if(!prescription){
 return res.status(404).json({
    message:"Prescription not found"
 });
}


Object.assign(
    prescription,
    req.body
);


await prescription.save();


res.json({
    success:true,
    prescription
});


}catch(error){

res.status(500).json({
    message:error.message
});

}

};