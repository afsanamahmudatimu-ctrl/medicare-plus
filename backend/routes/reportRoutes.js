const router=require("express").Router();

const {
    getReports,
    createReport
}=require("../controllers/reportController");

router.get("/",getReports);

router.post("/",createReport);

module.exports=router;