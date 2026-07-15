const express=require("express");

const router=express.Router();

const controller=require("../controllers/labReportController");

const auth=require("../middleware/authMiddleware");

router.get("/",auth,controller.getReports);

router.post("/",auth,controller.createReport);

router.put("/:id",auth,controller.updateReport);

router.delete("/:id",auth,controller.deleteReport);

module.exports=router;