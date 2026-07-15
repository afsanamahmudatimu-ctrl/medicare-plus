import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { getToken } from "./api";
import MediCareLandingPage from "./pages/MediCareLandingPage";
import MediCareLogin from "./pages/MedicareLogin";
import PatientDashboard from "./dashboards/PatientDashboard";
import DoctorDashboard from "./dashboards/DoctorDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import ReceptionistDashboard from "./dashboards/ReceptionistDashboard";

const ROLE_HOME = {
  Patient: "/patient",
  Doctor: "/doctor",
  Admin: "/admin",
  Receptionist: "/receptionist",
};

function LandingRoute({ isLoggedIn, userRole }) {
  const navigate = useNavigate();

  if (isLoggedIn) {
    return <Navigate to={ROLE_HOME[userRole] || "/login"} replace />;
  }

  // MediCareLandingPage still calls setShowLogin(true) internally on its
  // "Login" button — this wrapper ignores the boolean and just navigates,
  // so the landing page component itself needs no changes.
  return <MediCareLandingPage setShowLogin={() => navigate("/login")} />;
}

function LoginRoute({ isLoggedIn, userRole, setIsLoggedIn, setUserRole }) {
  if (isLoggedIn) {
    return <Navigate to={ROLE_HOME[userRole] || "/"} replace />;
  }
  return <MediCareLogin setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />;
}

function ProtectedRoute({ isLoggedIn, userRole, allowedRole, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (userRole !== allowedRole) {
    return <Navigate to={ROLE_HOME[userRole] || "/login"} replace />;
  }
  return children;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const role = localStorage.getItem("role");

    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }

    setLoading(false);
  }, []);

  const logoutProps = {
    setIsLoggedIn,
    setUserRole,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb]">
        <h2 className="text-xl font-bold text-slate-600">
          Loading...
        </h2>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<LandingRoute isLoggedIn={isLoggedIn} userRole={userRole} />}
        />

        <Route
          path="/login"
          element={
            <LoginRoute
              isLoggedIn={isLoggedIn}
              userRole={userRole}
              setIsLoggedIn={setIsLoggedIn}
              setUserRole={setUserRole}
            />
          }
        />

        <Route
          path="/patient/*"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRole="Patient">
              <PatientDashboard {...logoutProps} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRole="Doctor">
              <DoctorDashboard {...logoutProps} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRole="Admin">
              <AdminDashboard {...logoutProps} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/receptionist/*"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRole="Receptionist">
              <ReceptionistDashboard {...logoutProps} />
            </ProtectedRoute>
          }
        />

        {/* Unknown URL -> back to landing/redirect logic */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}