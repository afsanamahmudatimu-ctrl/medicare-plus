const Bill = require("../models/Bill");
const User = require("../models/User");

function formatCurrency(amount) {
  return `${Number(amount || 0).toFixed(2)}`;
}

async function generateInvoiceNo() {
  const count = await Bill.countDocuments();
  return `INV${1000 + count + 1}`;
}

// Get all bills — shaped differently for admin vs. patient
exports.getBills = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("firstName lastName role");
    if (!user) return res.status(404).json({ message: "User not found" });

    // --- ADMIN/RECEPTIONIST VIEW: flat array of every bill, for front-desk & admin dashboards ---
    if (user.role === "Admin" || user.role === "Receptionist") {
      const bills = await Bill.find({})
        .populate("patient", "firstName lastName")
        .sort({ createdAt: -1 });

      const shaped = bills.map((b) => ({
        _id: b._id,
        invoiceNo: b.invoiceNo,
        patient: b.patient
          ? `${b.patient.firstName || ""} ${b.patient.lastName || ""}`.trim()
          : "Unknown",
        amount: b.amount,
        status: b.status,
        dueDate: b.dueDate,
        createdAt: b.createdAt,
      }));

      return res.json(shaped); // plain array — matches setBills(billsData)
    }

    // --- PATIENT VIEW: original shaped response, unchanged ---
    const patientName = `${user.firstName} ${user.lastName}`;

    const bills = await Bill.find({ patient: req.userId }).sort({ createdAt: -1 });
    const now = new Date();

    const invoices = bills.map((b) => ({
      _id: b._id,
      id: b.invoiceNo,
      date: b.createdAt.toLocaleDateString(),
      patient: patientName,
      service: b.description,
      amount: formatCurrency(b.amount),
      paid: b.status === "Paid" ? formatCurrency(b.amount) : undefined,
      status: b.status === "Paid" ? "Paid" : (b.dueDate && b.dueDate < now ? "Overdue" : "Pending"),
      fileUrl: null,
    }));

    const paidBills = bills.filter((b) => b.status === "Paid");
    const pendingBills = bills.filter((b) => b.status !== "Paid");

    const stats = [
      { type: "revenue", label: "Total Paid", value: formatCurrency(paidBills.reduce((s, b) => s + b.amount, 0)) },
      { type: "pending", label: "Pending Amount", value: formatCurrency(pendingBills.reduce((s, b) => s + b.amount, 0)) },
      { type: "invoices", label: "Total Invoices", value: bills.length },
      { type: "transactions", label: "Paid Invoices", value: paidBills.length },
    ];

    const methodsMap = {};
    paidBills.forEach((b) => {
      const key = b.paymentMethod || "Cash";
      if (!methodsMap[key]) methodsMap[key] = { name: key, transactions: 0, amount: 0 };
      methodsMap[key].transactions += 1;
      methodsMap[key].amount += b.amount;
    });
    const methods = Object.values(methodsMap).map((m) => ({ ...m, amount: formatCurrency(m.amount) }));

    const outstanding = pendingBills.map((b) => ({
      _id: b._id,
      invoice: b.invoiceNo,
      patient: patientName,
      status: b.dueDate && b.dueDate < now ? "Overdue" : "Pending",
      service: b.description,
      due: formatCurrency(b.amount),
    }));

    res.json({ stats, invoices, methods, outstanding });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new bill / invoice for the logged-in patient
exports.createBill = async (req, res) => {
  try {
    const { service, description, amount, dueDate } = req.body;
    const finalDescription = service || description;

    if (!finalDescription || amount === undefined || amount === null || amount === "") {
      return res.status(400).json({ message: "Service and amount are required." });
    }

    const invoiceNo = await generateInvoiceNo();

    const bill = await Bill.create({
      patient: req.userId,
      invoiceNo,
      description: finalDescription,
      amount,
      dueDate: dueDate || undefined,
      status: "Pending",
    });

    res.status(201).json({ message: "Invoice created", bill });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBill = async (req, res) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, patient: req.userId },
      req.body,
      { new: true }
    );
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    await Bill.findOneAndDelete({ _id: req.params.id, patient: req.userId });
    res.json({ message: "Bill Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark a bill as paid
exports.payBill = async (req, res) => {
  try {
    const { method } = req.body;
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, patient: req.userId },
      { status: "Paid", paymentMethod: method || "Cash" },
      { new: true }
    );
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json({ message: "Payment successful", bill });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send a payment reminder for an outstanding bill
exports.remindBill = async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, patient: req.userId });
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json({ message: "Reminder sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};