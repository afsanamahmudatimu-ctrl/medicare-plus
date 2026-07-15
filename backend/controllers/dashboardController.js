const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const Report = require("../models/Report");

exports.getStats = async (req, res) => {
    try {

        const totalPatients = await Patient.countDocuments({ isDeleted: false });

        const totalDoctors = await Doctor.countDocuments();

        const totalAppointments = await Appointment.countDocuments();

        const totalPrescriptions = await Prescription.countDocuments();

        const totalReports = await Report.countDocuments();

        // Revenue depends on the Bill model, which may not exist in every
        // setup yet. Fail gracefully instead of crashing the whole endpoint.
        let revenue = 0;

        try {
            const Bill = require("../models/Bill");

            const result = await Bill.aggregate([
                { $match: { status: "Paid" } },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]);

            revenue = result[0]?.total || 0;
        } catch (billErr) {
            revenue = 0;
        }

        res.json({
            totalPatients,
            totalDoctors,
            totalAppointments,
            totalPrescriptions,
            totalReports,
            revenue,
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};