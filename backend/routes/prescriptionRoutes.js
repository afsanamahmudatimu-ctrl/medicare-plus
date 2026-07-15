const router=require("express").Router();

const {
    getPrescriptions,
    createPrescription,
    updatePrescription
}=require("../controllers/prescriptionController");


router.get(
    "/",
    getPrescriptions
);


router.post(
    "/",
    createPrescription
);


router.put(
    "/:id",
    updatePrescription
);


module.exports=router;