const express=require("express");

const router=express.Router();

const controller=require("../controllers/patientController");

const auth=require("../middleware/authMiddleware");

const allowRoles=require("../middleware/roleMiddleware");

router.get(

"/",

auth,

allowRoles("Admin","Receptionist","Doctor"),

controller.getPatients

);
router.get(

"/count",

auth,

allowRoles(

"Admin",

"Receptionist",

"Doctor"

),

controller.getPatientCount

);

router.get(

"/:id",

auth,

allowRoles("Admin","Receptionist","Doctor"),

controller.getPatient

);

router.post(

"/",

auth,

allowRoles("Admin","Receptionist"),

controller.createPatient

);

router.put(

"/:id",

auth,

allowRoles("Admin","Receptionist"),

controller.updatePatient

);

router.delete(

"/:id",

auth,

allowRoles("Admin"),

controller.deletePatient

);



module.exports=router;
