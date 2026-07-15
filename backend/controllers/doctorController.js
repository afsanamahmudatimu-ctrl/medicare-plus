const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
// Get All Doctors

exports.getDoctors = async (req, res) => {

    try{

        const doctors = await Doctor.find().sort({createdAt:-1});

        res.json(doctors);

    }catch(err){

        res.status(500).json({

            message:err.message

        });

    }

};

// Create Doctor

exports.createDoctor = async(req,res)=>{

    try{

        const doctor = await Doctor.create(req.body);

        res.status(201).json(doctor);

    }catch(err){

        res.status(500).json({

            message:err.message

        });

    }

};

// Get Single Doctor

exports.getDoctor = async(req,res)=>{

    try{

        const doctor = await Doctor.findById(req.params.id);

        if(!doctor){

            return res.status(404).json({

                message:"Doctor not found"

            });

        }

        res.json(doctor);

    }catch(err){

        res.status(500).json({

            message:err.message

        });

    }

};

// Update Doctor

exports.updateDoctor = async(req,res)=>{

    try{

        const doctor = await Doctor.findByIdAndUpdate(

            req.params.id,

            req.body,

            {new:true}

        );

        res.json(doctor);

    }catch(err){

        res.status(500).json({

            message:err.message

        });

    }

};

// Delete Doctor

exports.deleteDoctor = async(req,res)=>{

    try{

        await Doctor.findByIdAndDelete(req.params.id);

        res.json({

            message:"Doctor Deleted"

        });

    }catch(err){

        res.status(500).json({

            message:err.message

        });

    }

};
exports.doctorPatients = async (req, res) => {
    try {

        const doctorId = req.user.id;

        const patients = await Patient.find({
            doctor: doctorId
        });

        res.status(200).json({
            success: true,
            patients
        });

    } catch(error) {

        res.status(500).json({
            success:false,
            message:error.message
        });

    }
};