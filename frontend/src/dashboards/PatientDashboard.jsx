// frontend/src/pages/MediCarePortal.jsx
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FlaskConical,
  CreditCard,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Search,
  Heart,
  Activity,
  FileText,
  MapPin,
  Phone,
  Pill,
  Clock,
  Clock3,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Wallet,
  Star,
  ChevronLeft,
  ChevronRight,
  User,
  Lock,
  Shield,
  Palette,
  Camera,
  X,
} from "lucide-react";
import { api, clearToken, getToken, getFileUrl } from "/src/api";
import MediCareLogin from "../pages/MediCareLogin";

const FONT_SIZE_STYLES = `
  :root {
    --font-size: 16px;
  }
  html {
    font-size: var(--font-size);
  }
  h1 {
    font-size: var(--text-2xl);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }
  h2 {
    font-size: var(--text-xl);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }
  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }
  h4 {
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }
  label {
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }
  button {
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }
  input {
    font-size: var(--text-base);
    font-weight: var(--font-weight-normal);
    line-height: 1.5;
  }
`;

const NOTIFICATION_ICONS = {
  appointment: Calendar,
  lab: FileText,
  prescription: Pill,
  alert: AlertCircle,
  system: Bell,
  billing: FileText,
};

function getNotificationIcon(type) {
  const IconComponent = NOTIFICATION_ICONS[type] || Bell;
  return <IconComponent size={20} />;
}

function Loading({ label = "Loading..." }) {
  return <p className="text-gray-500 py-8 text-center text-sm">{label}</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
      {message}
    </p>
  );
}

function SuccessMessage({ message }) {
  return (
    <p className="text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
      {message}
    </p>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
        >
          <X size={18} />
        </button>
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { key: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { key: "labs", title: "Lab Reports", icon: FlaskConical },
  { key: "billing", title: "Billing", icon: CreditCard },
  { key: "appointments", title: "Appointments", icon: Calendar },
  { key: "notifications", title: "Notifications", icon: Bell, badge: "5" },
  { key: "settings", title: "Settings", icon: Settings },
];

function Sidebar({ page, setPage, onLogout }) {
  return (
    <aside className="w-64 bg-white border-r flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 h-screen overflow-y-auto z-20">
      <div>
        <div className="p-5 border-b">
          <div className="flex items-center gap-3">
            <Heart className="text-teal-600 w-8 h-8 fill-teal-600" />
            <div>
              <h1 className="font-bold text-xl">MediCare+</h1>
              <p className="text-xs text-gray-500">Patient Portal</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <MenuItem
              key={item.key}
              icon={<item.icon size={18} />}
              title={item.title}
              badge={item.badge}
              active={page === item.key}
              onClick={() => setPage(item.key)}
            />
          ))}
        </nav>
      </div>
      <div className="p-3 border-t sticky bottom-0 bg-white">
        <button
          onClick={onLogout}
          className="w-full border rounded-xl py-2 text-red-500 flex items-center justify-center gap-2 text-sm"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}

function MenuItem({ icon, title, active, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition text-sm ${
        active
          ? "bg-teal-600 text-white"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        {title}
      </div>
      {badge && (
        <span className="bg-red-500 text-white px-2 rounded-full text-xs">
          {badge}
        </span>
      )}
    </button>
  );
}

function Topbar({ patientId, initials }) {
  return (
    <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
      <div className="relative w-[500px]">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search patients, doctors, appointments..."
          className="w-full bg-slate-100 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm"
        />
      </div>
      <div className="flex items-center gap-4">
        <Bell size={18} />
        <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-sm">
          {initials || "—"}
        </div>
        <span className="text-sm">{patientId || "Loading..."}</span>
      </div>
    </div>
  );
}

/* DASHBOARD */
function DashboardPage({ setPage }) {
  const [stats, setStats] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const data = await api.get("/dashboard/stats");
        setStats(data.vitals || []);
        setAppointments(data.appointments || []);
        setReports(data.reports || []);
        setMedications(data.medications || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  async function handleCancelAppointment(id) {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      setCancellingId(id);
      await api.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Patient Dashboard</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Welcome back! Here's your health overview.
          </p>
        </div>
        <button
          onClick={() => setPage("appointments")}
          className="bg-teal-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm"
        >
          <Calendar size={16} /> Book Appointment
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}
      {loading ? (
        <Loading label="Loading your dashboard..." />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((item, index) => (
              <div
                key={`stat-${index}`}
                className="bg-white rounded-2xl border p-4 flex gap-3"
              >
                <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Activity className="text-teal-600" size={18} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">{item.title}</p>
                  <h3 className="text-xl font-bold">
                    {item.value}
                    <span className="text-sm font-normal ml-1">
                      {item.unit}
                    </span>
                  </h3>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white border rounded-2xl p-5">
              <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
              <p className="text-gray-500 text-sm mb-4">
                Your scheduled medical appointments
              </p>
              {appointments.length === 0 && (
                <p className="text-gray-500 text-sm mb-3">
                  No upcoming appointments.
                </p>
              )}
              {appointments.map((item) => (
                <div
                  key={item._id}
                  className="border rounded-xl p-4 mb-3 hover:border-teal-400"
                >
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-base font-semibold">
                        {item.doctor
                          ? typeof item.doctor === "object"
                            ? `Dr. ${item.doctor.name || ""}`
                            : "Dr. Specialist"
                          : "Doctor"}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        {item.doctor?.department || item.type}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs h-fit">
                      {item.status}
                    </span>
                  </div>
                  <div className="flex gap-6 mt-3">
                    <div className="flex gap-2 items-center text-sm">
                      <Calendar size={15} />
                      {item.date
                        ? new Date(item.date).toLocaleDateString()
                        : "—"}
                    </div>
                    <div className="flex gap-2 items-center text-sm">
                      <Clock size={15} />
                      {item.time}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="border px-3 py-1.5 rounded-lg flex gap-1.5 text-sm">
                      <MapPin size={15} />
                      Directions
                    </button>
                    <button className="border px-3 py-1.5 rounded-lg flex gap-1.5 text-sm">
                      <Phone size={15} />
                      Contact
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(item._id)}
                      disabled={cancellingId === item._id}
                      className="border px-3 py-1.5 rounded-lg flex gap-1.5 text-sm text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-60 ml-auto"
                    >
                      <X size={15} />
                      {cancellingId === item._id ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setPage("appointments")}
                className="w-full border rounded-xl py-2.5 text-sm"
              >
                View All Appointments
              </button>
            </div>

            <div className="bg-white border rounded-2xl p-5">
              <h3 className="text-lg font-semibold">Recent Reports</h3>
              <p className="text-gray-500 text-sm mb-4">Your latest lab results</p>
              {reports.length === 0 && (
                <p className="text-gray-500 text-sm mb-3">No reports yet.</p>
              )}
              {reports.map((report, i) => (
                <div key={`report-${i}`} className="border rounded-xl p-3 mb-3">
                  <div className="flex gap-3">
                    <div className="bg-cyan-100 p-2.5 rounded-xl">
                      <FileText className="text-cyan-600" size={16} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{report.title}</h4>
                      <p className="text-xs text-gray-500">{report.date}</p>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        Available
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setPage("labs")}
                className="w-full border rounded-xl py-2.5 text-sm"
              >
                View All Reports
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-5 mt-4">
            <h3 className="text-lg font-semibold">Current Medications</h3>
            <p className="text-gray-500 text-sm mb-4">
              Your active prescriptions and dosage schedule
            </p>
            {medications.length === 0 && (
              <p className="text-gray-500 text-sm">No active medications.</p>
            )}
            <div className="grid grid-cols-3 gap-4">
              {medications.map((med, i) => (
                <div key={`med-${i}`} className="border rounded-xl p-4">
                  <div className="flex gap-3">
                    <div className="bg-blue-100 p-2.5 rounded-xl">
                      <Pill className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold">{med.name}</h4>
                      <p className="text-gray-500 text-sm">{med.dosage}</p>
                    </div>
                  </div>
                  <span className="inline-block mt-2 border px-2 py-0.5 rounded-full text-xs">
                    {med.time}
                  </span>
                  <div className="mt-3">
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Progress</span>
                      <span>{med.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-teal-600 rounded-full"
                        style={{ width: `${med.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-5 mt-4">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Book Appointment", page: "appointments" },
                { label: "View Records", page: "labs" },
                { label: "Prescriptions", page: "dashboard" },
                { label: "Health Tracker", page: "dashboard" },
              ].map((item, i) => (
                <button
                  key={`action-${i}`}
                  onClick={() => setPage(item.page)}
                  className="border rounded-xl p-6 hover:bg-slate-50 text-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* LAB REPORTS */
function LabReportsPage() {
  const [stats, setStats] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function loadLabs() {
      try {
        setLoading(true);
        const data = await api.get("/labs");
        setStats(data.stats || []);
        setReports(data.reports || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadLabs();
  }, []);

  const filteredReports =
    filter === "all"
      ? reports
      : reports.filter((r) => r.status.toLowerCase() === filter);
  const STATS_ICONS = {
    cardiology: <FlaskConical className="text-teal-600" size={18} />,
    neurology: <FileText className="text-teal-600" size={18} />,
    radiology: <FileText className="text-teal-600" size={18} />,
    pathology: <FlaskConical className="text-teal-600" size={18} />,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Laboratory Reports</h2>
          <p className="text-gray-500 mt-1 text-sm">
            View and manage lab test results
          </p>
        </div>
        <button className="bg-teal-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm">
          <FlaskConical size={16} /> New Test Request
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}
      {loading ? (
        <Loading label="Loading lab reports..." />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.length === 0 && (
              <p className="text-gray-500 col-span-4 text-center py-3 text-sm">
                No lab report stats yet.
              </p>
            )}
            {stats.map((item, index) => (
              <div
                key={`stat-${index}`}
                className="bg-white border rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center">
                  {STATS_ICONS[item.type] || (
                    <FlaskConical className="text-teal-600" size={18} />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{item.count}</h3>
                  <p className="text-gray-500 text-sm">{item.title}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border rounded-2xl p-5">
            <h3 className="text-lg font-semibold mb-5">Laboratory Reports</h3>
            <div className="flex gap-2 mb-5">
              {["all", "completed", "processing", "pending"].map((f) => (
                <button
                  key={`filter-${f}`}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    filter === f ? "bg-slate-100" : ""
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === "all" ? " Reports" : ""}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredReports.length === 0 && (
                <p className="text-gray-500 text-center py-4 text-sm">
                  No reports found.
                </p>
              )}
              {filteredReports.map((report, index) => (
                <div
                  key={report.id || `report-${index}`}
                  className="border rounded-2xl p-4"
                >
                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      <div className="w-11 h-11 bg-cyan-100 rounded-xl flex items-center justify-center">
                        <FlaskConical className="text-cyan-600" size={18} />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">
                          {report.reportType || report.title || report.report}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          Patient:{" "}
                          {report.patient?.firstName
                            ? `${report.patient.firstName} ${
                                report.patient.lastName || ""
                              }`
                            : report.patientName ||
                              report.patient ||
                              "N/A"}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Requested by:{" "}
                          {report.doctor?.name
                            ? `Dr. ${report.doctor.name}`
                            : report.doctorName ||
                              report.doctor ||
                              "N/A"}
                        </p>
                        {report.department && (
                          <p className="text-gray-500 text-sm">
                            Department: {report.department}
                          </p>
                        )}
                        {report.labName && (
                          <p className="text-gray-500 text-sm">
                            Lab: {report.labName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2 justify-end mb-1">
                        <LabStatusBadge status={report.status} />
                      </div>
                      <p className="text-gray-500 text-sm">{report.date}</p>
                    </div>
                  </div>
                  {report.status === "Completed" && report.result && (
                    <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                      <p className="text-green-800 font-medium text-sm">
                        Result: {report.result}
                      </p>
                      {report.remarks && (
                        <p className="text-green-700 text-xs mt-1">
                          {report.remarks}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="border-t mt-4 pt-3 flex justify-between">
                    <div className="flex gap-2">
                      <button className="border px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm">
                        <Eye size={15} />
                        View Results
                      </button>
                      {report.status === "Completed" && report.fileUrl && (
                        <a
                          href={getFileUrl(report.fileUrl)}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm"
                        >
                          <Download size={15} />
                          Download
                        </a>
                      )}
                    </div>
                    <button className="border px-4 py-1.5 rounded-lg text-sm">
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LabStatusBadge({ status }) {
  if (status === "Completed")
    return (
      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
        <CheckCircle2 size={12} />
        Completed
      </span>
    );
  if (status === "Processing")
    return (
      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
        <Clock3 size={12} />
        Processing
      </span>
    );
  return (
    <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
      Pending
    </span>
  );
}

/* BILLING */
function BillingPage() {
  const [stats, setStats] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [methods, setMethods] = useState([]);
  const [outstanding, setOutstanding] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    service: "",
    amount: "",
    dueDate: "",
  });
  const [generating, setGenerating] = useState(false);
  const [invoiceError, setInvoiceError] = useState(null);

  const [payTarget, setPayTarget] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "Credit Card",
  });
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  async function loadBilling() {
    try {
      setLoading(true);
      const data = await api.get("/billing");
      setStats(data.stats || []);
      setInvoices(data.invoices || []);
      setMethods(data.methods || []);
      setOutstanding(data.outstanding || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBilling();
  }, []);

  const STATS_ICONS = {
    revenue: {
      icon: <DollarSign className="text-green-600" size={18} />,
      bg: "bg-green-100",
    },
    pending: {
      icon: <Clock3 className="text-yellow-600" size={18} />,
      bg: "bg-yellow-100",
    },
    invoices: {
      icon: <FileText className="text-blue-600" size={18} />,
      bg: "bg-blue-100",
    },
    transactions: {
      icon: <Wallet className="text-teal-600" size={18} />,
      bg: "bg-teal-100",
    },
  };

  async function handleSendReminder(invoiceId) {
    try {
      await api.post(`/billing/${invoiceId}/remind`, {});
    } catch (err) {
      setError(err.message);
    }
  }

  function openInvoiceModal() {
    setInvoiceForm({ service: "", amount: "", dueDate: "" });
    setInvoiceError(null);
    setShowInvoiceModal(true);
  }

  async function handleGenerateInvoice(e) {
    e.preventDefault();
    if (!invoiceForm.service || !invoiceForm.amount) {
      setInvoiceError("Please fill in service and amount.");
      return;
    }
    try {
      setGenerating(true);
      setInvoiceError(null);
      await api.post("/billing/invoices", invoiceForm);
      setShowInvoiceModal(false);
      setActionMessage("Invoice generated successfully.");
      await loadBilling();
    } catch (err) {
      setInvoiceError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  function openPaymentModal(target) {
    setPayTarget(target);
    setPaymentForm({ amount: target.amount || "", method: "Cash" });
    setPaymentError(null);
  }

  async function handleSubmitPayment(e) {
    e.preventDefault();
    if (!payTarget) return;
    if (!paymentForm.amount) {
      setPaymentError("Please enter a payment amount.");
      return;
    }
    try {
      setPaying(true);
      setPaymentError(null);
      await api.post(`/billing/${payTarget.id}/pay`, {
        amount: paymentForm.amount,
        method: paymentForm.method,
      });
      setPayTarget(null);
      setActionMessage("Payment successful.");
      await loadBilling();
    } catch (err) {
      setPaymentError(err.message);
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Billing & Payments</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Manage invoices and payment transactions
          </p>
        </div>
        <button
          onClick={openInvoiceModal}
          className="bg-teal-600 text-white px-5 py-2.5 rounded-xl flex gap-2 items-center text-sm"
        >
          <FileText size={16} />
          Generate Invoice
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}
      {actionMessage && (
        <div className="mb-4">
          <SuccessMessage message={actionMessage} />
        </div>
      )}
      {loading ? (
        <Loading label="Loading billing data..." />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map((item, index) => {
              const meta = STATS_ICONS[item.type] || STATS_ICONS.invoices;
              return (
                <div
                  key={`billing-stat-${index}`}
                  className="bg-white border rounded-2xl p-4 flex gap-3 items-center"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${meta.bg}`}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{item.value}</h3>
                    <p className="text-gray-500 text-sm">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white border rounded-2xl p-5">
              <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Invoice</th>
                    <th className="text-left">Patient</th>
                    <th className="text-left">Service</th>
                    <th className="text-left">Amount</th>
                    <th className="text-left">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center text-gray-500 py-4"
                      >
                        No invoices yet.
                      </td>
                    </tr>
                  )}
                  {invoices.map((invoice) => (
                    <tr key={invoice.id || invoice._id} className="border-b">
                      <td className="py-3">
                        <div className="font-semibold">{invoice.id}</div>
                        <div className="text-xs text-gray-500">
                          {invoice.date}
                        </div>
                      </td>
                      <td>{invoice.patient}</td>
                      <td>{invoice.service}</td>
                      <td>
                        <div>{invoice.amount}</div>
                        {invoice.paid && (
                          <div className="text-xs text-gray-500">
                            Paid: {invoice.paid}
                          </div>
                        )}
                      </td>
                      <td>
                        <BillingStatusBadge status={invoice.status} />
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          {invoice.status !== "Paid" && (
                            <button
                              onClick={() =>
                                openPaymentModal({
                                  id: invoice._id,
                                  label: invoice.id,
                                  amount: invoice.amount,
                                  patient: invoice.patient,
                                })
                              }
                              className="border rounded-lg px-2.5 py-1 text-xs text-teal-700 border-teal-200 hover:bg-teal-50"
                            >
                              Pay
                            </button>
                          )}
                          {invoice.fileUrl ? (
                            <a
                              href={getFileUrl(invoice.fileUrl)}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Download invoice"
                            >
                              <Download size={16} />
                            </a>
                          ) : (
                            <Download size={16} className="text-gray-300" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white border rounded-2xl p-5">
              <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
              <div className="space-y-4">
                {methods.map((method) => (
                  <div
                    key={method.name}
                    className="border rounded-2xl p-4"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                        <Wallet className="text-teal-600" size={16} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-base">
                          {method.name}
                        </h4>
                        <p className="text-gray-500 text-sm">
                          {method.transactions} transactions
                        </p>
                      </div>
                    </div>
                    <hr className="my-3" />
                    <p className="text-gray-500 text-sm">Total Amount</p>
                    <h4 className="text-2xl font-bold">{method.amount}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded-3xl p-5">
            <div className="flex gap-3 items-center mb-4">
              <Clock3 className="text-yellow-600" size={18} />
              <h3 className="text-lg font-semibold">Outstanding Payments</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {outstanding.length === 0 && (
                <p className="text-gray-500 col-span-3 text-center py-3 text-sm">
                  No outstanding payments.
                </p>
              )}
              {outstanding.map((item) => (
                <div
                  key={item.invoice || item._id}
                  className="bg-white border border-yellow-200 rounded-2xl p-4"
                >
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-semibold text-base">
                        {item.patient}
                      </h4>
                      <p className="text-gray-500 text-sm">{item.invoice}</p>
                    </div>
                    <BillingStatusBadge status={item.status} />
                  </div>
                  <div className="mt-3">
                    <p className="text-gray-500 text-sm">
                      Service: {item.service}
                    </p>
                    <p className="font-semibold text-base mt-1">
                      Due: {item.due}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() =>
                        openPaymentModal({
                          id: item._id,
                          label: item.invoice,
                          amount: item.due,
                          patient: item.patient,
                        })
                      }
                      className="flex-1 bg-teal-600 text-white rounded-xl py-2 text-sm"
                    >
                      Pay Now
                    </button>
                    <button
                      onClick={() => handleSendReminder(item._id)}
                      className="flex-1 border rounded-xl py-2 text-sm"
                    >
                      Remind
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showInvoiceModal && (
        <Modal
          title="Generate Invoice"
          onClose={() => setShowInvoiceModal(false)}
        >
          <form onSubmit={handleGenerateInvoice} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Service</label>
              <input
                value={invoiceForm.service}
                onChange={(e) =>
                  setInvoiceForm((f) => ({ ...f, service: e.target.value }))
                }
                className="w-full bg-slate-100 rounded-xl p-2.5 text-sm outline-none"
                placeholder="e.g. Consultation"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={invoiceForm.amount}
                onChange={(e) =>
                  setInvoiceForm((f) => ({ ...f, amount: e.target.value }))
                }
                className="w-full bg-slate-100 rounded-xl p-2.5 text-sm outline-none"
                placeholder="e.g. 150.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Due Date</label>
              <input
                type="date"
                value={invoiceForm.dueDate}
                onChange={(e) =>
                  setInvoiceForm((f) => ({ ...f, dueDate: e.target.value }))
                }
                className="w-full bg-slate-100 rounded-xl p-2.5 text-sm outline-none"
              />
            </div>
            {invoiceError && <ErrorMessage message={invoiceError} />}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="border px-4 py-2 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generating}
                className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-60"
              >
                {generating ? "Generating..." : "Generate Invoice"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {payTarget && (
        <Modal
          title={`Pay Invoice — ${payTarget.label}`}
          onClose={() => setPayTarget(null)}
        >
          <form onSubmit={handleSubmitPayment} className="space-y-3">
            {payTarget.patient && (
              <p className="text-sm text-gray-500">
                Patient:{" "}
                <span className="text-gray-800 font-medium">
                  {payTarget.patient}
                </span>
              </p>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm((f) => ({ ...f, amount: e.target.value }))
                }
                className="w-full bg-slate-100 rounded-xl p-2.5 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Payment Method
              </label>
              <select
                value={paymentForm.method}
                onChange={(e) =>
                  setPaymentForm((f) => ({ ...f, method: e.target.value }))
                }
                className="w-full bg-slate-100 rounded-xl p-2.5 text-sm outline-none"
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Bkash</option>
                <option>Nagad</option>
                <option>Rocket</option>
              </select>
            </div>
            {paymentError && <ErrorMessage message={paymentError} />}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayTarget(null)}
                className="border px-4 py-2 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={paying}
                className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-60"
              >
                {paying ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function BillingStatusBadge({ status }) {
  const styles = {
    Paid: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Partial: "bg-blue-100 text-blue-700",
    Overdue: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

/* APPOINTMENTS */
function AppointmentsPage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointmentType, setAppointmentType] = useState("");
  const [consultationMode, setConsultationMode] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);

  const [myAppointments, setMyAppointments] = useState([]);
  const [loadingMine, setLoadingMine] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    async function loadAppointmentData() {
      try {
        setLoading(true);
        const data = await api.get("/appointments/booking-data");

        const formattedDoctors = (data.doctors || []).map((doc) => ({
          ...doc,
          id: doc.id || doc._id,
        }));

        setDoctors(formattedDoctors);

        if (formattedDoctors?.length) {
          const firstDoctor = formattedDoctors[0];
          setSelectedDoctor(firstDoctor.id);
          const firstSlot = firstDoctor.availableSlots?.[0];
          if (firstSlot) {
            setSelectedDate(firstSlot.date);
            setSelectedTime(firstSlot.time);
          }
        }
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAppointmentData();
  }, []);

  async function loadMyAppointments() {
    try {
      setLoadingMine(true);
      const data = await api.get("/appointments/my");
      setMyAppointments(data.appointments || data || []);
    } catch (err) {
      setMyAppointments([]);
    } finally {
      setLoadingMine(false);
    }
  }

  useEffect(() => {
    loadMyAppointments();
  }, []);

  function handleSelectDoctor(doctor) {
    setSelectedDoctor(doctor.id);
    const firstSlot = doctor.availableSlots?.[0];
    setSelectedDate(firstSlot?.date || null);
    setSelectedTime(firstSlot?.time || null);
  }

  const currentDoctor = doctors.find((d) => d.id === selectedDoctor);
  const availableSlots = currentDoctor?.availableSlots || [];
  const uniqueDates = [...new Set(availableSlots.map((s) => s.date))];
  const slotsForSelectedDate = availableSlots.filter(
    (s) => s.date === selectedDate
  );

  async function handleConfirmBooking() {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setBookingMessage({
        type: "error",
        text: "Please select doctor, date, and time",
      });
      return;
    }
    try {
      setBooking(true);
      setBookingMessage(null);
      await api.post("/appointments", {
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        mode: consultationMode,
        reason,
      });
      setBookingMessage({
        type: "success",
        text: "Appointment booked successfully!",
      });
      // Reset form
      setAppointmentType("");
      setConsultationMode("");
      setReason("");
      setSelectedDate(null);
      setSelectedTime(null);
      // Close modal after 1.5 seconds
      setTimeout(() => setShowBookingModal(false), 1500);
      // Reload appointments
      loadMyAppointments();
    } catch (err) {
      setBookingMessage({ type: "error", text: err.message });
    } finally {
      setBooking(false);
    }
  }

  async function handleCancelAppointment(id) {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      setCancellingId(id);
      await api.delete(`/appointments/${id}`);
      setMyAppointments((prev) => prev.filter((a) => (a._id || a.id) !== id));
    } catch (err) {
      setBookingMessage({ type: "error", text: err.message });
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Book Appointment</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Schedule your appointment with our specialists
          </p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="bg-teal-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm hover:bg-teal-700"
        >
          <Calendar size={16} /> Book Now
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {!loadingMine && myAppointments.length > 0 && (
        <div className="bg-white border rounded-2xl p-5 mb-6">
          <h3 className="text-lg font-semibold mb-4">My Appointments</h3>
          <div className="grid grid-cols-2 gap-3">
            {myAppointments.map((item) => {
              const id = item._id || item.id;
              return (
                <div
                  key={`my-appt-${id}`}
                  className="border rounded-xl p-4 flex justify-between items-start"
                >
                  <div>
                    <h4 className="text-sm font-semibold">
                      {item.doctor
                        ? typeof item.doctor === "object"
                          ? `Dr. ${item.doctor.name || ""}`
                          : item.doctor
                        : "Doctor"}
                    </h4>
                    <p className="text-gray-500 text-xs">
                      {item.doctor?.department || item.type}
                    </p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {item.date
                          ? new Date(item.date).toLocaleDateString()
                          : "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {item.time}
                      </span>
                    </div>
                    <span className="inline-block mt-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                      {item.status}
                    </span>
                  </div>
                  {item.status !== "Cancelled" && (
                    <button
                      onClick={() => handleCancelAppointment(id)}
                      disabled={cancellingId === id}
                      className="text-red-600 border border-red-200 rounded-lg px-2.5 py-1 text-xs hover:bg-red-50 disabled:opacity-60"
                    >
                      {cancellingId === id ? "..." : "Cancel"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="bg-white border rounded-2xl p-4 mb-4">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  className="w-full bg-slate-100 rounded-xl py-2.5 pl-10 text-sm"
                  placeholder="Search doctors..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold px-1">Select a Doctor</h3>
              {doctors.length === 0 && (
                <p className="text-gray-500 text-center py-4 text-sm">
                  No doctors available.
                </p>
              )}
              {doctors.map((doctor) => (
                <div
                  key={`doctor-${doctor.id}`}
                  className={`bg-white border rounded-xl p-4 cursor-pointer transition ${
                    selectedDoctor === doctor.id
                      ? "border-teal-500 bg-teal-50 shadow-md"
                      : "hover:border-teal-300"
                  }`}
                  onClick={() => handleSelectDoctor(doctor)}
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-sm font-bold text-teal-700">
                      {doctor.initials}
                    </div>
                    <div>
                      <h4 className="font-semibold">{doctor.name}</h4>
                      <p className="text-gray-500 text-sm">
                        {doctor.specialty}
                      </p>
                      <span className="text-xs text-teal-600">
                        ⭐ {doctor.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-white border rounded-2xl p-5 mb-4">
              <h3 className="font-semibold mb-3">Available Dates</h3>
              {currentDoctor ? (
                <div className="grid grid-cols-2 gap-2">
                  {uniqueDates.length === 0 ? (
                    <p className="text-gray-500 text-sm">No dates available</p>
                  ) : (
                    uniqueDates.map((date, idx) => (
                      <button
                        key={`date-${date}-${idx}`}
                        onClick={() => {
                          setSelectedDate(date);
                          const firstSlot = availableSlots.find(
                            (s) => s.date === date
                          );
                          setSelectedTime(firstSlot?.time || null);
                        }}
                        className={`border rounded-lg py-2 px-3 text-sm transition ${
                          selectedDate === date
                            ? "bg-teal-600 text-white"
                            : "bg-slate-50 hover:border-teal-400"
                        }`}
                      >
                        {new Date(date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  Select a doctor first
                </p>
              )}
            </div>

            <div className="bg-white border rounded-2xl p-5">
              <h3 className="font-semibold mb-3">Available Times</h3>
              {selectedDate ? (
                <div className="grid grid-cols-2 gap-2">
                  {slotsForSelectedDate.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No times available
                    </p>
                  ) : (
                    slotsForSelectedDate.map((slot, idx) => (
                      <button
                        key={`time-${slot.time}-${idx}`}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`border rounded-lg py-2 text-sm transition ${
                          selectedTime === slot.time
                            ? "bg-teal-600 text-white"
                            : "bg-slate-50 hover:border-teal-400"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  Select a date first
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && <Loading label="Loading doctors..." />}

      {/* BOOKING MODAL */}
      {showBookingModal && (
        <Modal title="Confirm Appointment" onClose={() => setShowBookingModal(false)}>
          <div className="space-y-4">
            {currentDoctor && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <p className="text-sm text-teal-900">
                  <strong>Doctor:</strong> Dr. {currentDoctor.name}
                </p>
                <p className="text-sm text-teal-900">
                  <strong>Date:</strong>{" "}
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString()
                    : "—"}
                </p>
                <p className="text-sm text-teal-900">
                  <strong>Time:</strong> {selectedTime || "—"}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium block mb-1.5">
                Appointment Type
              </label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="">Select type</option>
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">
                Consultation Mode
              </label>
              <select
                value={consultationMode}
                onChange={(e) => setConsultationMode(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="">Select mode</option>
                <option value="In-person">In-person</option>
                <option value="Online">Online</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">
                Reason for Visit
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                rows="3"
                placeholder="Describe your symptoms..."
              ></textarea>
            </div>

            {bookingMessage && (
              <div>
                {bookingMessage.type === "success" ? (
                  <SuccessMessage message={bookingMessage.text} />
                ) : (
                  <ErrorMessage message={bookingMessage.text} />
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 border rounded-lg py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={
                  booking ||
                  !selectedDoctor ||
                  !selectedDate ||
                  !selectedTime
                }
                className="flex-1 bg-teal-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60"
              >
                {booking ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* NOTIFICATIONS */
function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        const data = await api.get("/notifications");
        setNotifications(data.notifications || data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read", {});
      setNotifications(notifications.map((n) => ({ ...n, unread: false })));
    } catch (err) {
      setError(err.message);
    }
  };

  const clearAll = async () => {
    try {
      await api.delete("/notifications");
      setNotifications([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredNotifications =
    activeFilter === "all"
      ? notifications
      : activeFilter === "unread"
      ? notifications.filter((n) => n.unread)
      : notifications.filter((n) => n.type === activeFilter);

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Stay updated with your health activities
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllRead}
            className="border px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
          >
            <CheckCircle2 size={16} />
            Mark All as Read
          </button>
          <button onClick={clearAll} className="border px-4 py-2 rounded-xl text-sm">
            Clear All
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}
      {loading ? (
        <Loading label="Loading notifications..." />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mt-6">
            <StatCard
              icon={<Bell size={18} />}
              value={notifications.length}
              label="Total"
            />
            <StatCard
              icon={<AlertCircle size={18} />}
              value={unreadCount}
              label="Unread"
            />
            <StatCard
              icon={<Calendar size={18} />}
              value={
                notifications.filter((n) => n.type === "appointment").length
              }
              label="Appointments"
            />
            <StatCard
              icon={<Pill size={18} />}
              value={
                notifications.filter((n) => n.type === "prescription").length
              }
              label="Prescriptions"
            />
          </div>

          <div className="bg-white rounded-2xl border p-5 mt-6">
            <h2 className="text-lg font-semibold mb-4">All Notifications</h2>
            <div className="flex gap-2 mb-4">
              <FilterButton
                text="All"
                active={activeFilter === "all"}
                onClick={() => setActiveFilter("all")}
              />
              <FilterButton
                text={`Unread ${unreadCount}`}
                active={activeFilter === "unread"}
                onClick={() => setActiveFilter("unread")}
              />
            </div>

            <div className="space-y-3">
              {filteredNotifications.length === 0 && (
                <p className="text-gray-500 text-center py-6 text-sm">
                  You're all caught up. No notifications.
                </p>
              )}
              {filteredNotifications.map((item) => (
                <div
                  key={`notif-${item.id}`}
                  className={`border rounded-2xl p-4 flex justify-between ${
                    item.unread ? "bg-blue-50 border-blue-200" : "bg-white"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-11 h-11 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
                      {getNotificationIcon(item.type)}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.message}</p>
                      <span className="text-gray-400 text-xs">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : item.time || ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    {item.unread && (
                      <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
                        New
                      </span>
                    )}
                    <CheckCircle2 className="text-slate-600" size={18} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white border rounded-2xl p-4 flex items-center gap-3">
      <div className="bg-cyan-100 text-cyan-600 p-3 rounded-xl">{icon}</div>
      <div>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-gray-500 text-sm">{label}</p>
      </div>
    </div>
  );
}

function FilterButton({ text, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm ${
        active ? "bg-slate-200" : "bg-slate-100 hover:bg-slate-200"
      }`}
    >
      {text}
    </button>
  );
}

/* SETTINGS */
function SettingsPage() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Male",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await api.get("/profile");
        setProfile((prev) => ({ ...prev, ...data }));
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function updateField(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      setSaveMessage(null);
      await api.put("/profile", profile);
      setSaveMessage({ type: "success", text: "Profile updated." });
    } catch (err) {
      setSaveMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900">Settings & Profile</h1>
      <p className="text-gray-500 text-sm mt-1">
        Manage your account settings and preferences
      </p>

      <div className="bg-slate-100 rounded-full mt-6 flex overflow-hidden">
        <Tab active icon={<User size={16} />} title="Profile" />
        <Tab icon={<Bell size={16} />} title="Notifications" />
        <Tab icon={<Lock size={16} />} title="Security" />
        <Tab icon={<Palette size={16} />} title="Preferences" />
        <Tab icon={<Shield size={16} />} title="Privacy" />
      </div>

      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="bg-white border rounded-3xl p-6 mt-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Personal Information
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          Update your personal details and profile picture
        </p>

        {loading ? (
          <Loading label="Loading profile..." />
        ) : (
          <>
            <div className="flex items-center gap-5 mt-6">
              <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center text-2xl text-teal-700">
                {(profile.firstName?.[0] || "").toUpperCase()}
                {(profile.lastName?.[0] || "").toUpperCase()}
              </div>
              <div>
                <button className="bg-teal-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm">
                  <Camera size={16} />
                  Change Photo
                </button>
                <p className="text-gray-500 text-xs mt-1.5">
                  JPG, PNG or GIF. Max size 2MB
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <InputField
                label="First Name"
                value={profile.firstName}
                onChange={(v) => updateField("firstName", v)}
              />
              <InputField
                label="Last Name"
                value={profile.lastName}
                onChange={(v) => updateField("lastName", v)}
              />
              <InputField
                label="Email"
                value={profile.email}
                onChange={(v) => updateField("email", v)}
              />
              <InputField
                label="Phone Number"
                value={profile.phone}
                onChange={(v) => updateField("phone", v)}
              />
              <InputField
                label="Date of Birth"
                type="date"
                value={profile.dob ? profile.dob.split("T")[0] : ""}
                onChange={(v) => updateField("dob", v)}
              />
              <div>
                <label className="font-medium mb-1.5 block text-sm">
                  Gender
                </label>
                <select
                  value={profile.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                  className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none text-sm"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="font-medium mb-1.5 block text-sm">
                Address
              </label>
              <textarea
                rows="3"
                value={profile.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="w-full bg-slate-100 rounded-xl p-3 outline-none resize-none text-sm"
              />
            </div>

            {saveMessage && (
              <p
                className={`mt-3 text-sm ${
                  saveMessage.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {saveMessage.text}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button className="border px-5 py-2.5 rounded-xl text-sm">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Tab({ icon, title, active }) {
  return (
    <button
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${
        active
          ? "bg-white rounded-full shadow text-slate-900"
          : "text-slate-700"
      }`}
    >
      {icon}
      {title}
    </button>
  );
}

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="font-medium mb-1.5 block text-sm">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full bg-slate-100 rounded-xl px-4 py-3 outline-none text-sm"
      />
    </div>
  );
}

/* ROOT */
export default function MediCarePortal() {
  const [page, setPage] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const [showLogin, setShowLogin] = useState(!getToken());
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "medicare-font-sizes";
    style.innerHTML = FONT_SIZE_STYLES;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById("medicare-font-sizes");
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    async function loadCurrentUser() {
      try {
        const data = await api.get("/auth/me");
        setCurrentUser(data);
      } catch (err) {
        console.error("Failed to load current user:", err.message);
        clearToken();
        setIsLoggedIn(false);
        setShowLogin(true);
      }
    }
    loadCurrentUser();
  }, [isLoggedIn]);

  if (!isLoggedIn || showLogin) {
    return (
      <MediCareLogin
        setShowLogin={setShowLogin}
        setIsLoggedIn={setIsLoggedIn}
        setUserRole={setUserRole}
      />
    );
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage setPage={setPage} />;
      case "labs":
        return <LabReportsPage />;
      case "billing":
        return <BillingPage />;
      case "appointments":
        return <AppointmentsPage />;
      case "notifications":
        return <NotificationsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage setPage={setPage} />;
    }
  };

  const initials = currentUser
    ? `${(currentUser.firstName?.[0] || "").toUpperCase()}${(
        currentUser.lastName?.[0] || ""
      ).toUpperCase()}`
    : null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        page={page}
        setPage={setPage}
        onLogout={() => {
          clearToken();
          setIsLoggedIn(false);
          setShowLogin(true);
          setCurrentUser(null);
        }}
      />
      <main className="flex-1 ml-64">
        <Topbar patientId={currentUser?.patientId} initials={initials} />
        {renderPage()}
      </main>
    </div>
  );
}