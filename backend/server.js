require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const patientRoutes=require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes=require("./routes/appointmentRoutes");
const billRoutes = require("./routes/billRoutes");
const labRoutes=require("./routes/labRoutes");
const profileRoutes = require("./routes/profileRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const bedRoutes = require("./routes/bedRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const pharmacyRoutes = require("./routes/pharmacyRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const staffRoutes = require("./routes/staffRoutes");
const roleRoutes = require("./routes/roleRoutes");
const landingRoutes=require("./routes/landingRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/patients",patientRoutes);
app.use("/api/doctors",doctorRoutes);
app.use("/api/appointments",appointmentRoutes);
app.use("/api/billing", billRoutes);
app.use("/api/labs",labRoutes);
app.use("/api/prescriptions",require("./routes/prescriptionRoutes"));
app.use("/api/reports", reportRoutes);

app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/beds", bedRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/roles", roleRoutes);
app.use(
"/api/landing",
landingRoutes
);
// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hospital Management Backend Running...",
  });
});

// 404 + centralized error handler (must be last)
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});