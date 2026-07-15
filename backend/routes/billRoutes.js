const express = require("express");

const router = express.Router();

const controller = require("../controllers/billController");

const auth = require("../middleware/authMiddleware");

router.get("/", auth, controller.getBills);

router.post("/", auth, controller.createBill);

router.post("/invoices", auth, controller.createBill);

router.put("/:id", auth, controller.updateBill);

router.delete("/:id", auth, controller.deleteBill);

router.post("/:id/pay", auth, controller.payBill);

router.post("/:id/remind", auth, controller.remindBill);

module.exports = router;