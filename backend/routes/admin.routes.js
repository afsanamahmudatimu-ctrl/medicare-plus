const dashboardController = require("../controllers/dashboardController");

router.get(
  "/admin/dashboard",
  authMiddleware,
  dashboardController.getAdminDashboard
);