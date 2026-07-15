import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Heart, LayoutDashboard, Users, Calendar, Bell, Settings, LogOut, Search,
  FileText, ClipboardList, Stethoscope, Pill, Clock3, Phone, Video,
  AlertCircle, UserPlus, Eye, Edit, Plus, Download, CheckCircle2, Activity, MessageCircle,
  X, Trash2, Loader2, Check, XCircle,
} from "lucide-react";
import { api, removeToken, getFileUrl } from "../api";

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

// ---------- helpers ----------
const getId = (obj) => obj?._id || obj?.id;

// Some backends populate "patient" as a related object ({_id, name, ...})
// instead of a plain string. This safely extracts a displayable name either way.
const displayPatient = (val) => {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val.name || val.fullName || val._id || "";
  return String(val);
};

// Patient documents use firstName/lastName (not a single "name" field) —
// this combines them safely for display anywhere in this dashboard.
const patientFullName = (p) => `${p?.firstName || ""} ${p?.lastName || ""}`.trim() || "—";

// Generic safe-stringify for any field that might unexpectedly be an object
// (e.g. a populated reference) instead of a plain string/number.
const str = (val) => {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object") return val.name || val.title || val.label || val._id || "";
  return String(val);
};

// Field definitions per resource — adjust keys here if your backend schema differs.
const FORM_FIELDS = {
  patients: [
    { key: "firstName", label: "First Name", type: "text", required: true },
    { key: "lastName", label: "Last Name", type: "text", required: true },
    { key: "age", label: "Age", type: "number", required: true },
    { key: "phone", label: "Phone", type: "text" },
    { key: "medicalHistory", label: "Condition / Medical History", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
  ],
  appointments: [
    { key: "patient", label: "Patient Name", type: "text", required: true },
    { key: "time", label: "Time", type: "text", required: true, placeholder: "e.g. 10:30 AM" },
    { key: "type", label: "Type", type: "select", options: ["Video Call", "Phone Call", "In-Person"] },
    { key: "status", label: "Status", type: "select", options: ["Pending", "Confirmed", "Cancelled"] },
  ],
  prescriptions: [
    { key: "patient", label: "Patient Name", type: "text", required: true },
    { key: "medicine", label: "Medicine", type: "text", required: true },
    { key: "dose", label: "Dosage", type: "text", placeholder: "e.g. 500mg, twice daily" },
    { key: "status", label: "Status", type: "select", options: ["Active", "Pending", "Completed"] },
  ],
  reports: [
    { key: "title", label: "Report Title", type: "text", required: true },
    { key: "patient", label: "Patient Name", type: "text", required: true },
    { key: "date", label: "Date", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["Reviewed", "Pending", "Critical"] },
  ],
};

const RESOURCE_LABEL = {
  patients: "Patient",
  appointments: "Appointment",
  prescriptions: "Prescription",
  reports: "Report",
};

export default function DoctorDashboard({ setIsLoggedIn, setUserRole }) {
  const navigate = useNavigate();
  const params = useParams();
  const activePage = (params["*"] || "dashboard").split("/")[0] || "dashboard";
  // Backend restricts patient create/update to Admin & Receptionist, and delete to Admin only.
  // Mirror that here so Doctor users don't see buttons that will 403.
  const userRole = (localStorage.getItem("role") || "").toLowerCase();
  const canCreateUpdatePatients = ["admin", "receptionist"].includes(userRole);
  const canDeletePatients = userRole === "admin";
  const setActivePage = (id) => navigate(`/doctor/${id}`);
  const [searchText, setSearchText] = useState("");
  const q = searchText.toLowerCase();

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "doctor-font-sizes";
    style.innerHTML = FONT_SIZE_STYLES;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById("doctor-font-sizes");
      if (el) el.remove();
    };
  }, []);

  const [stats, setStats] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // toast for success / error feedback on actions
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
  const showToast = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 3000);
  };

  // modal state: { mode: 'add'|'edit'|'view'|'confirm-delete', resource, data }
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        statsData,
        patientsData,
        appointmentsData,
        reportsData,
        prescriptionsData,
      ] = await Promise.all([
        api.getStats(),
        api.list("patients"),
        api.list("appointments"),
        api.list("reports"),
        api.list("prescriptions"),
      ]);

      setStats([
        { title: "Patients", value: statsData?.totalPatients ?? 0, page: "patients", icon: Users },
        { title: "Appointments", value: statsData?.totalAppointments ?? 0, page: "appointments", icon: Calendar },
        { title: "Reports", value: statsData?.totalReports ?? 0, page: "reports", icon: FileText },
        { title: "Prescriptions", value: statsData?.totalPrescriptions ?? 0, page: "prescriptions", icon: Pill },
      ]);
      setPatients(patientsData?.patients || patientsData || []);
      setAppointments(appointmentsData?.appointments || appointmentsData || []);
      setReports(reportsData?.reports || reportsData || []);
      setPrescriptions(prescriptionsData?.prescriptions || prescriptionsData || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // refresh just the stats (cheap) after a mutation
  const refreshStats = async () => {
    try {
      const statsData = await api.getStats();
      setStats([
        { title: "Patients", value: statsData?.totalPatients ?? 0, page: "patients", icon: Users },
        { title: "Appointments", value: statsData?.totalAppointments ?? 0, page: "appointments", icon: Calendar },
        { title: "Reports", value: statsData?.totalReports ?? 0, page: "reports", icon: FileText },
        { title: "Prescriptions", value: statsData?.totalPrescriptions ?? 0, page: "prescriptions", icon: Pill },
      ]);
    } catch (err) {
      // stats refresh failing shouldn't block the UI
      console.error(err);
    }
  };

  const loadNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      const data = await api.get("/notifications");
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAllNotificationsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch (err) {
      showToast("error", err.message || "Failed to update notifications");
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete("/notifications");
      setNotifications([]);
    } catch (err) {
      showToast("error", err.message || "Failed to clear notifications");
    }
  };

  const RESOURCE_SETTERS = {
    patients: setPatients,
    appointments: setAppointments,
    prescriptions: setPrescriptions,
    reports: setReports,
  };

  // ---------- CRUD actions (all go through the real backend via api.js) ----------
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreate = async (resource, body) => {
    setActionLoading(true);
    try {
      const created = await api.create(resource, body);
      RESOURCE_SETTERS[resource]((prev) => [created, ...prev]);
      await refreshStats();
      showToast("success", `${RESOURCE_LABEL[resource]} added successfully`);
      closeModal();
    } catch (err) {
      showToast("error", err.message || "Failed to create");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (resource, id, body) => {
    setActionLoading(true);
    try {
      const updated = await api.update(resource, id, body);
      RESOURCE_SETTERS[resource]((prev) =>
        prev.map((item) => (getId(item) === id ? { ...item, ...updated } : item))
      );
      showToast("success", `${RESOURCE_LABEL[resource]} updated successfully`);
      closeModal();
    } catch (err) {
      showToast("error", err.message || "Failed to update");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (resource, id) => {
    setActionLoading(true);
    try {
      await api.remove(resource, id);
      RESOURCE_SETTERS[resource]((prev) => prev.filter((item) => getId(item) !== id));
      await refreshStats();
      showToast("success", `${RESOURCE_LABEL[resource]} deleted`);
      closeModal();
    } catch (err) {
      showToast("error", err.message || "Failed to delete");
    } finally {
      setActionLoading(false);
    }
  };

  // quick status change (e.g. Confirm / Cancel an appointment) without opening the full form
  const handleStatusChange = async (resource, id, status) => {
    setActionLoading(true);
    try {
      const updated = await api.updateAppointmentStatus(
        id,
        status
      );
      RESOURCE_SETTERS[resource]((prev) =>
        prev.map((item) => (getId(item) === id ? { ...item, ...updated } : item))
      );
      showToast("success", "Status updated");
    } catch (err) {
      showToast("error", err.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "patients", label: "Patients", icon: Users },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "consultation", label: "Consultation", icon: Video },
    { id: "notifications", label: "Notifications", icon: Bell, badge: notifications.filter(n => n.unread).length || undefined },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const filteredPatients = patients.filter(
    (p) =>
      patientFullName(p).toLowerCase().includes(q) ||
      str(p.medicalHistory).toLowerCase().includes(q) ||
      str(p.status).toLowerCase().includes(q)
  );
  const filteredAppointments = appointments.filter(
    (a) =>
      displayPatient(a.patient).toLowerCase().includes(q) ||
      str(a.type).toLowerCase().includes(q) ||
      str(a.status).toLowerCase().includes(q)
  );
  const filteredReports = reports.filter(
    (r) =>
      str(r.title).toLowerCase().includes(q) ||
      displayPatient(r.patient).toLowerCase().includes(q) ||
      str(r.status).toLowerCase().includes(q)
  );
  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      displayPatient(p.patient).toLowerCase().includes(q) ||
      str(p.medicine).toLowerCase().includes(q)
  );

  const StatusBadge = ({ status }) => {
    const color =
      status === "Active" || status === "Reviewed" || status === "Confirmed"
        ? "bg-green-100 text-green-700"
        : status === "Pending"
          ? "bg-yellow-100 text-yellow-700"
          : status === "Inactive"
            ? "bg-slate-100 text-slate-600"
            : "bg-red-100 text-red-700";
    return <span className={`${color} px-3 py-1 rounded-full text-xs font-semibold`}>{status}</span>;
  };

  const PageTitle = ({ title, desc, button }) => (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900">{title}</h1>
        <p className="text-slate-500 text-sm mt-1">{desc}</p>
      </div>
      {button}
    </div>
  );

  // ---------- generic Add/Edit form modal ----------
  const FormModal = () => {
    if (!modal || (modal.mode !== "add" && modal.mode !== "edit")) return null;
    const { resource, data } = modal;
    const fields = FORM_FIELDS[resource];
    const [form, setForm] = useState(() => {
      const init = {};
      fields.forEach((f) => {
        const raw = data?.[f.key];
        init[f.key] = f.key === "patient" ? displayPatient(raw) : (raw ?? "");
      });
      return init;
    });

    const submit = (e) => {
      e.preventDefault();
      const id = getId(data);
      if (modal.mode === "edit" && id) {
        handleUpdate(resource, id, form);
      } else {
        handleCreate(resource, form);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
        <div
          className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900">
              {modal.mode === "edit" ? `Edit ${RESOURCE_LABEL[resource]}` : `Add ${RESOURCE_LABEL[resource]}`}
            </h2>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-slate-600 block mb-1">{f.label}</label>
                {f.type === "select" ? (
                  <select
                    className="w-full bg-slate-100 rounded-xl px-4 py-2.5 outline-none text-sm"
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                  >
                    <option value="">Select...</option>
                    {f.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    className="w-full bg-slate-100 rounded-xl px-4 py-2.5 outline-none text-sm"
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 border px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {modal.mode === "edit" ? "Save Changes" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ---------- view detail modal ----------
  const ViewModal = () => {
    if (!modal || modal.mode !== "view") return null;
    const { resource, data } = modal;
    const fields = FORM_FIELDS[resource];
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900">{RESOURCE_LABEL[resource]} Details</h2>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2.5">
            {fields.map((f) => (
              <div key={f.key} className="flex justify-between border-b pb-2">
                <span className="text-slate-500 text-sm">{f.label}</span>
                <span className="font-semibold text-sm text-right">
                  {f.key === "status" ? (
                    <StatusBadge status={data?.[f.key] || "-"} />
                  ) : f.key === "patient" ? (
                    displayPatient(data?.[f.key]) || "-"
                  ) : (
                    data?.[f.key] || "-"
                  )}
                </span>
              </div>
            ))}
            {resource === "reports" && data?.file && (
              <a
                href={getFileUrl(data.file)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download File
              </a>
            )}
          </div>
          {(resource !== "patients" || canCreateUpdatePatients || canDeletePatients) && (
            <div className="flex gap-2 pt-4">
              {(resource !== "patients" || canCreateUpdatePatients) && (
                <button
                  onClick={() => setModal({ mode: "edit", resource, data })}
                  className="flex-1 border px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
              )}
              {(resource !== "patients" || canDeletePatients) && (
                <button
                  onClick={() => setModal({ mode: "confirm-delete", resource, data })}
                  className="flex-1 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------- delete confirmation modal ----------
  const ConfirmDeleteModal = () => {
    if (!modal || modal.mode !== "confirm-delete") return null;
    const { resource, data } = modal;
    const id = getId(data);
    const label =
      resource === "patients"
        ? patientFullName(data)
        : (displayPatient(data?.patient) || data?.title || "this item");
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
        <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500 w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Delete {RESOURCE_LABEL[resource]}?</h2>
          <p className="text-slate-500 text-sm mt-2">
            Are you sure you want to delete <span className="font-semibold">{label}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-2 mt-5">
            <button onClick={closeModal} className="flex-1 border px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50">
              Cancel
            </button>
            <button
              onClick={() => handleDelete(resource, id)}
              disabled={actionLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Toast = () => {
    if (!toast) return null;
    const isSuccess = toast.type === "success";
    return (
      <div
        className={`fixed top-5 right-5 z-[60] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold ${
          isSuccess ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}
      >
        {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        {toast.message}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col gap-4 justify-center items-center text-red-600">
        <p>{error}</p>
        <button onClick={loadData} className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex">
      <Toast />
      <FormModal />
      <ViewModal />
      <ConfirmDeleteModal />

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r fixed left-0 top-0 bottom-0 flex flex-col">
        <div className="px-4 py-5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow">
              <Heart className="text-white fill-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">MediCare+</h1>
              <p className="text-slate-500 text-xs">Doctor Portal</p>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition ${activePage === item.id ? "bg-teal-600 text-white shadow" : "text-slate-700 hover:bg-slate-100"
                }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
              {item.badge && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </div>

        <div className="p-3 bg-white border-t">
          <button
            onClick={() => {
              removeToken();
              localStorage.removeItem("role");
              setUserRole?.("");
              setIsLoggedIn(false);
              navigate("/login");
            }}

            className="w-full flex items-center gap-3 border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl font-semibold text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-60">
        {/* Topbar */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search patients, reports, appointments..."
              className="w-full bg-slate-100 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActivePage("notifications")} className="relative">
              <Bell className="w-5 h-5 text-slate-600" />
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {notifications.filter(n => n.unread).length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">DR</div>
              <h3 className="font-semibold text-slate-700 text-sm">Dr. Wilson</h3>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* DASHBOARD */}
          {activePage === "dashboard" && (
            <>
              <PageTitle
                title="Doctor Dashboard"
                desc="Professional medical overview and patient care center"
                button={
                  <button onClick={() => setActivePage("consultation")} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm shadow">
                    <Stethoscope className="w-4 h-4" /> Start Consultation
                  </button>
                }
              />

              <div className="grid grid-cols-4 gap-4 mt-6">
                {stats.map((item) => (
                  <button key={item.title} onClick={() => setActivePage(item.page)} className="bg-white rounded-2xl border p-5 hover:shadow-lg hover:-translate-y-0.5 transition text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                        <item.icon className="text-teal-600 w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm">{item.title}</p>
                        <h2 className="text-2xl font-black text-slate-900 mt-0.5">{item.value}</h2>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4">
                {[
                  { label: "View Patients", page: "patients", icon: Users },
                  { label: "Appointments", page: "appointments", icon: Calendar },
                  { label: "Write Prescription", page: "prescriptions", icon: Pill },
                  { label: "View Reports", page: "reports", icon: FileText },
                ].map((item) => (
                  <button key={item.page} onClick={() => setActivePage(item.page)} className="bg-white border rounded-2xl p-4 hover:shadow-md flex items-center gap-3 text-sm font-semibold">
                    <item.icon className="text-teal-600 w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6 mt-6">
                <div className="col-span-2 bg-white rounded-2xl border p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">Recent Patients</h2>
                    <button onClick={() => setActivePage("patients")} className="text-teal-600 font-semibold text-sm">View All</button>
                  </div>
                  <div className="space-y-3 mt-5">
                    {filteredPatients.length === 0 && (
                      <p className="text-slate-400 text-sm text-center py-6">No patients found.</p>
                    )}
                    {filteredPatients.slice(0, 5).map((p) => (
                      <div key={getId(p)} className="border rounded-2xl p-4 hover:bg-slate-50">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-base font-bold">{patientFullName(p)}</h3>
                            <p className="text-slate-500 text-sm mt-0.5">{p.medicalHistory}</p>
                            <p className="text-slate-500 text-xs">Age: {p.age}</p>
                          </div>
                          <StatusBadge status={p.status} />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => setModal({ mode: "view", resource: "patients", data: p })}
                            className="border px-3 py-1.5 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 text-sm"
                          >
                            <ClipboardList className="w-3.5 h-3.5" /> View Record
                          </button>
                          <a
                            href={p.phone ? `tel:${p.phone}` : undefined}
                            className={`border px-3 py-1.5 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 text-sm ${!p.phone ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            <Phone className="w-3.5 h-3.5" /> Contact
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border p-5">
                  <h2 className="text-xl font-black text-slate-900">Today's Appointments</h2>
                  <div className="space-y-3 mt-5">
                    {filteredAppointments.length === 0 && (
                      <p className="text-slate-400 text-sm text-center py-6">No appointments found.</p>
                    )}
                    {filteredAppointments.slice(0, 5).map((a) => (
                      <div key={getId(a)} className="border rounded-2xl p-4">
                        <h3 className="text-base font-bold">{displayPatient(a.patient)}</h3>
                        <p className="text-slate-500 text-sm flex gap-1.5 mt-2"><Clock3 className="w-3.5 h-3.5" />{a.time}</p>
                        <p className="text-slate-500 text-sm flex gap-1.5 mt-1"><Video className="w-3.5 h-3.5" />{a.type}</p>
                        <button onClick={() => setActivePage("consultation")} className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold text-sm mt-4">
                          Join Session
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PATIENTS */}
          {activePage === "patients" && (
            <>
              <PageTitle
                title="My Patients"
                desc="View patient conditions, records and care status"

              />
              <div className="bg-white rounded-2xl border p-5 mt-6">
                {filteredPatients.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-6">No patients found.</p>
                )}
                {filteredPatients.map((p) => (
                  <div key={getId(p)} className="border rounded-2xl p-4 mb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold">{patientFullName(p)}</h3>
                      <p className="text-slate-500 text-sm">{p.medicalHistory} • Age {p.age}</p>
                      <p className="text-slate-500 text-xs">{p.phone}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <StatusBadge status={p.status} />
                      <button
                        onClick={() => setModal({ mode: "view", resource: "patients", data: p })}
                        className="border px-3 py-1.5 rounded-xl flex gap-1.5 items-center text-sm hover:bg-slate-50"
                      >
                        <Eye className="w-3.5 h-3.5" /> Record
                      </button>
                      <a
                        href={p.phone ? `tel:${p.phone}` : undefined}
                        className={`border px-3 py-1.5 rounded-xl flex gap-1.5 items-center text-sm hover:bg-slate-50 ${!p.phone ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        <Phone className="w-3.5 h-3.5" /> Contact
                      </a>

                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* APPOINTMENTS */}
          {activePage === "appointments" && (
            <>
              <PageTitle
                title="Appointments"
                desc="Manage checkups, follow-ups and online sessions"

              />
              <div className="bg-white rounded-2xl border p-5 mt-6">
                {filteredAppointments.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-6">No appointments found.</p>
                )}
                {filteredAppointments.map((a) => (
                  <div key={getId(a)} className="border rounded-2xl p-4 mb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold">{displayPatient(a.patient)}</h3>
                      <p className="text-slate-500 text-sm">{a.time} • {a.type}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <StatusBadge status={a.status} />
                      {a.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleStatusChange("appointments", getId(a), "Confirmed")}
                            title="Confirm"
                            className="border border-green-200 text-green-600 p-2 rounded-xl hover:bg-green-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange("appointments", getId(a), "Cancelled")}
                            title="Cancel"
                            className="border border-red-200 text-red-600 p-2 rounded-xl hover:bg-red-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      <button onClick={() => setActivePage("consultation")} className="bg-teal-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-teal-700">
                        Join Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* PRESCRIPTIONS */}
          {activePage === "prescriptions" && (
            <>
              <PageTitle
                title="Prescriptions"
                desc="Create and manage patient medicine prescriptions"
                button={
                  <button
                    onClick={() => setModal({ mode: "add", resource: "prescriptions", data: null })}
                    className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold flex gap-2 items-center text-sm hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4" /> New Prescription
                  </button>
                }
              />
              <div className="bg-white rounded-2xl border p-5 mt-6">
                {filteredPrescriptions.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-6">No prescriptions found.</p>
                )}
                {filteredPrescriptions.map((p) => (
                  <div key={getId(p)} className="border rounded-2xl p-4 mb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold">{displayPatient(p.patient)}</h3>
                      <p className="text-slate-500 text-sm">{p.medicine}</p>
                      <p className="text-slate-500 text-xs">{p.dose}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <StatusBadge status={p.status} />
                      <button
                        onClick={() => setModal({ mode: "edit", resource: "prescriptions", data: p })}
                        className="border px-3 py-1.5 rounded-xl flex gap-1.5 items-center text-sm hover:bg-slate-50"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                       <a
    href={`http://localhost:5000/api/prescriptions/${getId(p)}/pdf`}
    target="_blank"
    rel="noreferrer"
    className="border px-3 py-1.5 rounded-xl flex gap-1.5 items-center text-sm hover:bg-slate-50"
  >
    <Download className="w-4 h-4" />
    PDF
  </a>

                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* REPORTS */}
          {activePage === "reports" && (
            <>
              <PageTitle
                title="Medical Reports"
                desc="Review lab reports and patient medical files"

              />
              <div className="bg-white rounded-2xl border p-5 mt-6">
                {filteredReports.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-6">No reports found.</p>
                )}
                {filteredReports.map((r) => (
                  <div key={getId(r)} className="border rounded-2xl p-4 mb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold">{r.title}</h3>
                      <p className="text-slate-500 text-sm">{displayPatient(r.patient)} • {r.date}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <StatusBadge status={r.status} />
                      <button
                        onClick={() => setModal({ mode: "view", resource: "reports", data: r })}
                        className="border px-3 py-1.5 rounded-xl flex gap-1.5 items-center text-sm hover:bg-slate-50"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* CONSULTATION */}
          {activePage === "consultation" && (
            <ConsultationPanel
              appointments={appointments}
              onSaveNotes={async (appointmentId, notes) => {
                setActionLoading(true);
                try {
                  await api.update("appointments", appointmentId, { notes });
                  showToast("success", "Notes saved");
                } catch (err) {
                  showToast("error", err.message || "Failed to save notes");
                } finally {
                  setActionLoading(false);
                }
              }}
              actionLoading={actionLoading}
            />
          )}

          {/* NOTIFICATIONS */}
          {activePage === "notifications" && (
            <>
              <PageTitle
                title="Notifications"
                desc="Important patient and appointment alerts"
                button={
                  <div className="flex gap-2">
                    <button onClick={markAllNotificationsRead} className="border px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50">
                      Mark All as Read
                    </button>
                    <button onClick={clearAllNotifications} className="border px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50">
                      Clear All
                    </button>
                  </div>
                }
              />
              <div className="bg-white rounded-2xl border p-5 mt-6">
                {notifLoading ? (
                  <p className="text-slate-400 text-sm text-center py-6">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-6">You're all caught up. No notifications.</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div key={n._id} className={`border rounded-2xl p-4 flex gap-4 items-center ${n.unread ? "bg-teal-50 border-teal-200" : ""}`}>
                        <AlertCircle className="text-red-500 w-5 h-5 shrink-0" />
                        <div>
                          <h2 className="text-sm font-bold">{n.title}</h2>
                          <p className="text-slate-500 text-sm">{n.message}</p>
                          <span className="text-slate-400 text-xs">{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* SETTINGS */}
          {activePage === "settings" && (
            <SettingsPanel showToast={showToast} />
          )}
        </div>
      </main>
    </div>
  );
}

// ---------- Consultation panel (separate so its local state doesn't reset the page) ----------
function ConsultationPanel({ appointments, onSaveNotes, actionLoading }) {
  const [selectedId, setSelectedId] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Live Consultation</h1>
          <p className="text-slate-500 text-sm mt-1">Start video consultation and communicate with patients</p>
        </div>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-slate-100 rounded-xl px-4 py-2.5 outline-none text-sm"
        >
          <option value="">Select patient / appointment...</option>
          {appointments.map((a) => (
            <option key={a._id || a.id} value={a._id || a.id}>{displayPatient(a.patient)} — {a.time}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="col-span-2 bg-white border rounded-2xl p-5">
          <div className="h-80 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
            <div className="text-center">
              <Video className="w-14 h-14 mx-auto mb-4" />
              <h2 className="text-2xl font-black">Video Session Room</h2>
              <p className="text-slate-300 text-sm mt-2">Patient consultation preview</p>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-teal-700">Start Call</button>
            <button className="border px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50">Share Report</button>
            <button className="border px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50">End Session</button>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <h2 className="text-xl font-black text-slate-900">Patient Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write consultation notes..."
            className="w-full h-60 bg-slate-100 rounded-xl p-4 outline-none mt-4 text-sm"
          />
          <button
            onClick={() => selectedId && onSaveNotes(selectedId, notes)}
            disabled={!selectedId || actionLoading}
            className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold text-sm mt-4 disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-teal-700"
          >
            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Notes
          </button>
          {!selectedId && (
            <p className="text-xs text-slate-400 mt-2">Select a patient above before saving notes.</p>
          )}
        </div>
      </div>
    </>
  );
}

// ---------- Settings panel ----------
function SettingsPanel({ showToast }) {
  const [form, setForm] = useState({ name: "Dr. Wilson", email: "doctor@medicare.com", specialty: "Cardiology", phone: "+880 1700 000000" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      // Adjust this endpoint to match your backend's profile-update route.
      await api.put("/doctor/profile", form);
      showToast("success", "Profile updated");
    } catch (err) {
      showToast("error", err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Doctor profile and account settings</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border p-6 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <input
            className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm"
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
          />
          <input
            className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="mt-5 bg-teal-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-60 hover:bg-teal-700"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
        <p className="text-xs text-slate-400 mt-3">
          Note: this saves to PUT /doctor/profile — update the endpoint in SettingsPanel if your backend uses a different route.
        </p>
      </div>
    </>
  );
}