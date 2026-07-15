import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, removeToken } from "../api";
import {
  Heart, Users, Calendar, CreditCard, Bell, Settings, LogOut, Search,
  FlaskConical, Stethoscope, BarChart3, UserPlus, AlertTriangle, Bed,
  Plus, Eye, Edit, Trash2, Download, UserCheck, Building2, Pill,
  Package, ShieldAlert, FileBarChart, KeyRound, CheckCircle2, Loader2, X
} from "lucide-react";

// --- Field configs used to auto-generate Add / Edit / View forms for every resource ---
// NOTE: these resource keys must match the string you pass to api.list() / api.create() /
// api.update() / api.remove() — i.e. they must match your backend route names.
const fieldConfigs = {
  patients: [
    { key: "firstName", label: "First Name", type: "text" },
    { key: "lastName", label: "Last Name", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
    { key: "age", label: "Age", type: "number" },
    { key: "bloodGroup", label: "Blood Group", type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
  ],
  doctors: [
    { key: "name", label: "Name", type: "text" },
    { key: "dept", label: "Department", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["Active", "On Leave"] },
  ],
  // Matches backend Appointment schema:
  // patient: ObjectId (ref Patient), doctor: ObjectId (ref Doctor), date: Date,
  // time: String, type: enum [Consultation, Follow-up, Emergency],
  // mode: enum [In-person, Online], status: enum [Confirmed, Completed, Cancelled, No-show]
  appointments: [
    { key: "patient", label: "Patient", type: "patient" },
    { key: "doctor", label: "Doctor", type: "doctor" },
    { key: "date", label: "Date", type: "date" },
    { key: "time", label: "Time", type: "time" },
    { key: "type", label: "Type", type: "select", options: ["Consultation", "Follow-up", "Emergency"] },
    { key: "mode", label: "Mode", type: "select", options: ["In-person", "Online"] },
    { key: "status", label: "Status", type: "select", options: ["Confirmed", "Completed", "Cancelled", "No-show"] },
  ],
  billing: [
    { key: "invoiceNo", label: "Invoice No", type: "text" }, // invoice -> invoiceNo
    { key: "patient", label: "Patient", type: "patient" }, // now a proper dropdown instead of raw ObjectId text
    { key: "amount", label: "Amount", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["Pending", "Paid"] },
  ],
  labs: [
    { key: "reportType", label: "Report Name", type: "text" }, // report -> reportType
    { key: "patient", label: "Patient", type: "patient" },
    { key: "doctor", label: "Doctor", type: "doctor" },
    { key: "status", label: "Status", type: "select", options: ["Pending", "Processing", "Completed"] },
  ],
  beds: [
    { key: "ward", label: "Ward", type: "text" },
    { key: "total", label: "Total Beds", type: "number" },
    { key: "available", label: "Available", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["Available", "Limited", "Full"] },
  ],
  departments: [
    { key: "name", label: "Department Name", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
  ],
  pharmacy: [
    { key: "medicine", label: "Medicine Name", type: "text" },
    { key: "stock", label: "Stock", type: "number" },
    { key: "price", label: "Price", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["Active", "Low Stock", "Out of Stock"] },
  ],
  inventory: [
    { key: "item", label: "Item Name", type: "text" },
    { key: "quantity", label: "Quantity", type: "number" },
    { key: "unit", label: "Unit", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["Available", "Low Stock", "Out of Stock"] },
  ],
  staff: [
    { key: "name", label: "Name", type: "text" },
    { key: "role", label: "Role", type: "text" },
    { key: "shift", label: "Shift", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["Active", "On Leave"] },
  ],
  roles: [
    { key: "role", label: "Role Name", type: "text" },
    { key: "access", label: "Access Level", type: "text" },
    { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
  ],
};

export default function AdminDashboard({
  setIsLoggedIn,
  setUserRole,
}) {
  const navigate = useNavigate();
  const params = useParams();
  const rawParam = params["*"] ? params["*"].split("/")[0] : "";
  const activePage = rawParam === "" ? "dashboard" : rawParam;
  const setActivePage = (id) => navigate(`/admin/${id}`);
  const [searchText, setSearchText] = useState("");
  const q = searchText.toLowerCase();

  // --- Live data state (replaces hardcoded arrays) ---
  const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, totalAppointments: 0, revenue: 0 });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [patientOptions, setPatientOptions] = useState([]);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [labs, setLabs] = useState([]);
  const [beds, setBeds] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pharmacy, setPharmacy] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Add / Edit / View modal state ---
  // modal = { mode: "add" | "edit" | "view", resource, setter, fields, title, item }
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!modal) return;
    setFormData(modal.mode === "add" ? {} : { ...modal.item });
  }, [modal]);

  function openAddModal(resource, setter, title) {
    setModal({ mode: "add", resource, setter, fields: fieldConfigs[resource] || [], title, item: null });
  }
  function openEditModal(resource, setter, title, item) {
    setModal({ mode: "edit", resource, setter, fields: fieldConfigs[resource] || [], title, item });
  }
  function openViewModal(resource, setter, title, item) {
    setModal({ mode: "view", resource, setter, fields: fieldConfigs[resource] || [], title, item });
  }
  function closeModal() {
    setModal(null);
    setFormData({});
  }

  async function handleModalSubmit(e) {
    e.preventDefault();
    if (!modal || modal.mode === "view") return closeModal();
    setSaving(true);
    try {
      if (modal.mode === "add") {
        const created = await api.create(modal.resource, formData);
        modal.setter((prev) => [...prev, created]);
      } else if (modal.mode === "edit") {
        const updated = await api.update(modal.resource, modal.item._id, formData);
        modal.setter((prev) => prev.map((it) => (it._id === modal.item._id ? updated : it)));
      }
      closeModal();
    } catch (err) {
      alert(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  // --- Load everything on mount ---
  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        setError(null);
        const [
          statsData, patientsData, doctorsData, appointmentsData, billsData,
          labsData, bedsData, departmentsData, pharmacyData, inventoryData,
          staffData, rolesData,
        ] = await Promise.all([
          api.getStats(),
          api.list("patients"),
          api.list("doctors"),
          api.list("appointments"),
          api.list("billing"),
          api.list("labs"),
          api.list("beds"),
          api.list("departments"),
          api.list("pharmacy"),
          api.list("inventory"),
          api.list("staff"),
          api.list("roles"),
        ]);

        setStats(statsData);
        const patientList = (patientsData?.patients || []).map((p) => ({
          ...p,
          name: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
        }));

        setPatients(patientList);
        setPatientOptions(patientList);

        setDoctorOptions(doctorsData);
        setDoctors(doctorsData);
        setAppointments(appointmentsData);
        setBills(billsData);
        setLabs(labsData);
        setBeds(bedsData);
        setDepartments(departmentsData);
        setPharmacy(pharmacyData);
        setInventory(inventoryData);
        setStaff(staffData);
        setRoles(rolesData);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const loadNotifications = async () => {
    try {
      setNotifLoading(true);
      const data = await api.get("/notifications");
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllNotificationsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    } catch (err) {
      alert(err.message || "Failed to update notifications");
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete("/notifications");
      setNotifications([]);
    } catch (err) {
      alert(err.message || "Failed to clear notifications");
    }
  };

  // --- Generic delete handler shared across resources ---
  async function handleDelete(resource, id, setter) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.remove(resource, id);
      setter((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "patients", label: "Patients", icon: Users },
    { id: "doctors", label: "Doctors", icon: Stethoscope },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "labs", label: "Lab Reports", icon: FlaskConical },
    { id: "beds", label: "Beds & Wards", icon: Bed },
    { id: "departments", label: "Departments", icon: Building2 },
    { id: "pharmacy", label: "Pharmacy", icon: Pill },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "emergency", label: "Emergency", icon: ShieldAlert },
    { id: "reports", label: "Reports", icon: FileBarChart },
    { id: "staff", label: "Staff", icon: UserCheck },
    { id: "roles", label: "User Roles", icon: KeyRound },
    { id: "notifications", label: "Notifications", icon: Bell, badge: notifications.filter(n => n.unread).length || undefined },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const statCards = [
    { title: "Total Patients", value: stats.totalPatients, icon: Users, page: "patients" },
    { title: "Doctors", value: stats.totalDoctors, icon: Stethoscope, page: "doctors" },
    { title: "Appointments", value: stats.totalAppointments, icon: Calendar, page: "appointments" },
    { title: "Revenue", value: `$${stats.revenue}`, icon: CreditCard, page: "billing" },
  ];

  const activities = [
    { title: "New patient registered", user: patients[0]?.name || "—", time: "10 mins ago", icon: Users, page: "activityPatient" },
    { title: "Lab report uploaded", user: labs[0]?.doctor?.name || "—", time: "25 mins ago", icon: FlaskConical, page: "activityLab" },
    { title: "Appointment approved", user: appointments[0]?.doctor?.name || "—", time: "1 hour ago", icon: Calendar, page: "activityAppointment" },
    { title: "Billing completed", user: "Finance Department", time: "2 hours ago", icon: CreditCard, page: "activityBilling" },
  ];

  const filteredPatients = patients.filter((p) =>
    p.firstName?.toLowerCase().includes(q) ||
    p.lastName?.toLowerCase().includes(q) ||
    p.patientId?.toLowerCase().includes(q)
  );
  const filteredDoctors = doctors.filter((d) => d.name?.toLowerCase().includes(q) || d.dept?.toLowerCase().includes(q));
  const filteredAppointments = appointments.filter((a) =>
    a.patient?.name?.toLowerCase().includes(q) || a.doctor?.name?.toLowerCase().includes(q)
  );
  const filteredBills = bills.filter((b) => b.patient?.toLowerCase?.().includes(q) || b.invoiceNo?.toLowerCase().includes(q));
  const filteredLabs = labs.filter((l) => l.reportType?.toLowerCase().includes(q) || l.patient?.toLowerCase?.().includes(q));
  const filteredStaff = staff.filter((s) =>
    s.firstName?.toLowerCase().includes(q) ||
    s.lastName?.toLowerCase().includes(q) ||
    s.role?.toLowerCase().includes(q)
  );

  const StatusBadge = ({ status }) => {
    const color =
      ["Paid", "Completed", "Available", "Confirmed", "Active"].includes(status)
        ? "bg-green-100 text-green-700"
        : ["Waiting", "Pending", "Limited", "Processing", "Low Stock", "On Leave"].includes(status)
          ? "bg-yellow-100 text-yellow-700"
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

  const ActionButtons = ({ onView, onEdit, onDelete }) => (
    <div className="flex gap-2">
      <button onClick={onView} className="p-2 rounded-xl border hover:bg-slate-50"><Eye className="w-4 h-4" /></button>
      <button onClick={onEdit} className="p-2 rounded-xl border hover:bg-slate-50"><Edit className="w-4 h-4" /></button>
      <button onClick={onDelete} className="p-2 rounded-xl border hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
    </div>
  );

  const getDisplayName = (val) => {
    if (val === null || val === undefined) return "";
    if (typeof val === "object") {
      if (val.firstName || val.lastName) return `${val.firstName || ""} ${val.lastName || ""}`.trim();
      if (val.name) return val.name;
      return "";
    }
    return val;
  };

  const SimpleListPage = ({ title, desc, data, columns, buttonText, buttonIcon: ButtonIcon, resource, setter }) => (
    <>
      <PageTitle
        title={title}
        desc={desc}
        button={
          <button
            onClick={() => openAddModal(resource, setter, title)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold flex gap-2 items-center text-sm shadow"
          >
            {ButtonIcon && <ButtonIcon className="w-4 h-4" />}
            {buttonText}
          </button>
        }
      />
      <div className="bg-white rounded-2xl border p-5 mt-6">
        {data.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-8">No records found.</p>
        )}
        {data.map((item) => (
          <div key={item._id} className="border rounded-2xl p-4 mb-3 flex justify-between items-center hover:bg-slate-50">
            <div>
              <h3 className="text-base font-bold">{getDisplayName(item[columns[0]])}</h3>
              <p className="text-slate-500 text-sm mt-1">
                {columns.slice(1, -1).map((c) => `${c}: ${getDisplayName(item[c])}`).join(" • ")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={item.status} />
              <ActionButtons
                onView={() => openViewModal(resource, setter, title, item)}
                onEdit={() => openEditModal(resource, setter, title, item)}
                onDelete={() => handleDelete(resource, item._id, setter)}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const ActivityDetail = ({ icon: Icon, title, desc, children }) => (
    <>
      <PageTitle title={title} desc={desc} />
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="col-span-2 bg-white border rounded-2xl p-6">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <Icon className="text-indigo-600 w-7 h-7" />
          </div>
          <div className="mt-6">{children}</div>
        </div>
        <div className="bg-white border rounded-2xl p-6">
          <h2 className="text-xl font-black text-slate-900">Quick Actions</h2>
          <div className="space-y-3 mt-5">
            <button onClick={() => setActivePage("dashboard")} className="w-full border rounded-xl py-3 text-sm font-semibold hover:bg-slate-50">
              Back Dashboard
            </button>
            <button onClick={() => setActivePage("notifications")} className="w-full border rounded-xl py-3 text-sm font-semibold hover:bg-slate-50">
              View Notifications
            </button>
            <button className="w-full bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold">
              Mark as Reviewed
            </button>
          </div>
        </div>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center">
        <div className="bg-white border rounded-2xl p-8 max-w-md text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-lg font-black mt-4">Could not load data</h2>
          <p className="text-slate-500 text-sm mt-2">{error}</p>
          <p className="text-slate-400 text-xs mt-3">
            Make sure the backend server is running at http://localhost:5000
            and you are logged in.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r fixed left-0 top-0 bottom-0 flex flex-col">
        <div className="px-4 py-5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow">
              <Heart className="text-white fill-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">MediCare+</h1>
              <p className="text-slate-500 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition ${activePage === item.id ? "bg-indigo-600 text-white shadow" : "text-slate-700 hover:bg-slate-100"
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
              setUserRole("");
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
              placeholder="Search patients, doctors, reports..."
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
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">AD</div>
              <h3 className="font-semibold text-slate-700 text-sm">Admin</h3>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* DASHBOARD */}
          {activePage === "dashboard" && (
            <>
              <PageTitle
                title="Admin Dashboard"
                desc="Hospital overview and complete management system"
                button={
                  <button onClick={() => openAddModal("staff", setStaff, "Add Staff")} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm shadow">
                    <UserPlus className="w-4 h-4" />
                    Add Staff
                  </button>
                }
              />

              <div className="grid grid-cols-4 gap-4 mt-6">
                {statCards.map((item) => (
                  <button key={item.title} onClick={() => setActivePage(item.page)} className="bg-white rounded-2xl border p-5 hover:shadow-lg hover:-translate-y-0.5 transition text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <item.icon className="text-indigo-600 w-6 h-6" />
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
                  { label: "Manage Patients", page: "patients", icon: Users },
                  { label: "Appointments", page: "appointments", icon: Calendar },
                  { label: "Lab Reports", page: "labs", icon: FlaskConical },
                  { label: "Bed Status", page: "beds", icon: Bed },
                  { label: "Departments", page: "departments", icon: Building2 },
                  { label: "Pharmacy", page: "pharmacy", icon: Pill },
                  { label: "Inventory", page: "inventory", icon: Package },
                  { label: "Emergency", page: "emergency", icon: ShieldAlert },
                ].map((item) => (
                  <button key={item.page} onClick={() => setActivePage(item.page)} className="bg-white border rounded-2xl p-4 hover:shadow-md flex items-center gap-3 text-sm font-semibold">
                    <item.icon className="text-indigo-600 w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6 mt-6">
                <div className="col-span-2 bg-white rounded-2xl border p-5">
                  <h2 className="text-xl font-black text-slate-900">Recent Activity</h2>
                  <p className="text-slate-500 text-sm mt-1">Click activity to view details</p>
                  <div className="space-y-3 mt-5">
                    {activities.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setActivePage(item.page)}
                        className="w-full border rounded-2xl p-4 flex items-center justify-between hover:bg-indigo-50 transition text-left"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <item.icon className="text-indigo-600 w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold">{item.title}</h3>
                            <p className="text-slate-500 text-xs">{item.user}</p>
                          </div>
                        </div>
                        <p className="text-slate-500 text-xs">{item.time}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border p-5">
                  <h2 className="text-xl font-black text-slate-900">Alerts</h2>
                  <p className="text-slate-500 text-sm mt-1">Important notifications</p>
                  <div className="space-y-3 mt-5">
                    {["Emergency room nearing capacity", "3 pending lab approvals", "New doctor registration pending"].map((alert) => (
                      <button key={alert} onClick={() => setActivePage("notifications")} className="w-full border rounded-2xl p-4 flex gap-3 text-left hover:bg-red-50">
                        <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                          <AlertTriangle className="text-red-600 w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{alert}</h3>
                          <p className="text-slate-500 text-xs mt-0.5">High Priority</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ACTIVITY DETAILS */}
          {activePage === "activityPatient" && (
            <ActivityDetail icon={Users} title="New Patient Registered" desc="Patient registration activity details">
              <h2 className="text-2xl font-black text-slate-900">{patients[0]?.name || "No patient yet"}</h2>
              <p className="text-slate-500 text-sm mt-2">New patient record has been created successfully.</p>
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Patient ID:</b> {patients[0]?.patientId || "—"}</div>
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Age:</b> {patients[0]?.age || "—"}</div>
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Blood:</b> {patients[0]?.blood || "—"}</div>
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Status:</b> {patients[0]?.status || "—"}</div>
              </div>
              <button onClick={() => setActivePage("patients")} className="mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">Open Patient Records</button>
            </ActivityDetail>
          )}

          {activePage === "activityLab" && (
            <ActivityDetail icon={FlaskConical} title="Lab Report Uploaded" desc="New laboratory report activity details">
              <h2 className="text-2xl font-black text-slate-900">{labs[0]?.reportType || "No report yet"}</h2>
              <p className="text-slate-500 text-sm mt-2">Latest lab report uploaded for review.</p>
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Patient:</b> {labs[0]?.patient || "—"}</div>
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Doctor:</b> {labs[0]?.doctor || "—"}</div>
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Report:</b> {labs[0]?.report || "—"}</div>
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Status:</b> {labs[0]?.status || "—"}</div>
              </div>
              <button onClick={() => setActivePage("labs")} className="mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">Open Lab Reports</button>
            </ActivityDetail>
          )}

          {activePage === "activityAppointment" && (
            <ActivityDetail icon={Calendar} title="Appointment Approved" desc="Appointment approval activity details">
              <h2 className="text-2xl font-black text-slate-900">Appointment Confirmed</h2>
              <p className="text-slate-500 text-sm mt-2">Latest appointment request approved.</p>
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Patient:</b> {getDisplayName(appointments[0]?.patient) || "—"}</div>
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Doctor:</b> {getDisplayName(appointments[0]?.doctor) || "—"}</div>
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Time:</b> {appointments[0]?.time || "—"}</div>
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Status:</b> {appointments[0]?.status || "—"}</div>
              </div>
              <button onClick={() => setActivePage("appointments")} className="mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">Open Appointments</button>
            </ActivityDetail>
          )}

          {activePage === "activityBilling" && (
            <ActivityDetail icon={CreditCard} title="Billing Completed" desc="Billing and payment activity details">
              <h2 className="text-2xl font-black text-slate-900">{bills[0]?.invoice || "No invoice yet"}</h2>
              <p className="text-slate-500 text-sm mt-2">Finance department completed the payment successfully.</p>
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Patient:</b> {getDisplayName(bills[0]?.patient) || "—"}</div>
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Amount:</b> ${bills[0]?.amount ?? "—"}</div>
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Invoice:</b> {bills[0]?.invoiceNo || "—"}</div>
                <div className="bg-slate-100 rounded-xl p-4 text-sm"><b>Status:</b> {bills[0]?.status || "—"}</div>
              </div>
              <button onClick={() => setActivePage("billing")} className="mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">Open Billing</button>
            </ActivityDetail>
          )}

          {/* LIST PAGES */}
          {activePage === "patients" && (
            <SimpleListPage title="Patient Management" desc="View, edit and manage patient records" data={filteredPatients} columns={["name", "patientId", "age", "gender", "bloodGroup", "status"]} buttonText="Add Patient" buttonIcon={Plus} resource="patients" setter={setPatients} />
          )}
          {activePage === "doctors" && (
            <SimpleListPage title="Doctor Management" desc="Manage doctors, departments and availability" data={filteredDoctors} columns={["name", "dept", "patients", "status"]} buttonText="Add Doctor" buttonIcon={UserPlus} resource="doctors" setter={setDoctors} />
          )}
          {activePage === "appointments" && (
            <SimpleListPage title="Appointments" desc="Approve and manage hospital appointments" data={filteredAppointments} columns={["patient", "doctor", "time", "status"]} buttonText="New Appointment" buttonIcon={Plus} resource="appointments" setter={setAppointments} />
          )}
          {activePage === "billing" && (
            <SimpleListPage title="Billing & Revenue" desc="Track invoices, payments and hospital revenue" data={filteredBills} columns={["invoiceNo", "patient", "amount", "status"]} buttonText="Add Invoice" buttonIcon={Plus} resource="billing" setter={setBills} />
          )}
          {activePage === "labs" && (
            <SimpleListPage title="Lab Reports" desc="Review test reports and lab approvals" data={filteredLabs} columns={["reportType", "patient", "doctor", "status"]} buttonText="Add Report" buttonIcon={FlaskConical} resource="labs" setter={setLabs} />
          )}
          {activePage === "beds" && (
            <SimpleListPage title="Beds & Wards" desc="Ward-wise bed availability and allocation" data={beds} columns={["ward", "total", "available", "status"]} buttonText="Allocate Bed" buttonIcon={Bed} resource="beds" setter={setBeds} />
          )}
          {activePage === "departments" && (
            <SimpleListPage title="Departments" desc="Manage hospital departments and patient flow" data={departments} columns={["name", "doctors", "patients", "status"]} buttonText="Add Department" buttonIcon={Building2} resource="departments" setter={setDepartments} />
          )}
          {activePage === "pharmacy" && (
            <SimpleListPage title="Pharmacy" desc="Manage medicines, stock and prices" data={pharmacy} columns={["medicine", "stock", "price", "status"]} buttonText="Add Medicine" buttonIcon={Pill} resource="pharmacy" setter={setPharmacy} />
          )}
          {activePage === "inventory" && (
            <SimpleListPage title="Inventory" desc="Track hospital equipment and supplies" data={inventory} columns={["item", "quantity", "unit", "status"]} buttonText="Add Item" buttonIcon={Package} resource="inventory" setter={setInventory} />
          )}
          {activePage === "staff" && (
            <SimpleListPage title="Staff Management" desc="Manage receptionist, nurses, lab assistants and hospital staff" data={filteredStaff} columns={["name", "role", "shift", "status"]} buttonText="Add Staff" buttonIcon={UserPlus} resource="staff" setter={setStaff} />
          )}
          {activePage === "roles" && (
            <SimpleListPage title="User Roles & Permissions" desc="Manage role-based access control" data={roles} columns={["role", "access", "users", "status"]} buttonText="Add Role" buttonIcon={KeyRound} resource="roles" setter={setRoles} />
          )}

          {/* EMERGENCY */}
          {activePage === "emergency" && (
            <>
              <PageTitle title="Emergency Management" desc="Monitor emergency cases and response teams" />
              <div className="grid grid-cols-3 gap-4 mt-6">
                {["Emergency room nearing capacity", "Ambulance team on standby", "ICU beds limited"].map((item) => (
                  <div key={item} className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <ShieldAlert className="text-red-600 w-7 h-7" />
                    <h2 className="text-lg font-black mt-4 text-red-700">{item}</h2>
                    <p className="text-slate-600 text-sm mt-2">High priority action required</p>
                    <button className="mt-4 bg-red-600 text-white px-5 py-2 rounded-xl font-semibold text-sm">Take Action</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* REPORTS */}
          {activePage === "reports" && (
            <>
              <PageTitle
                title="Hospital Reports"
                desc="Analytics, revenue and operational summaries"
                button={
                  <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex gap-2 items-center text-sm">
                    <Download className="w-4 h-4" /> Download Report
                  </button>
                }
              />
              <div className="grid grid-cols-3 gap-4 mt-6">
                {["Monthly Revenue", "Patient Growth", "Doctor Performance", "Lab Efficiency", "Bed Occupancy", "Emergency Cases"].map((item) => (
                  <div key={item} className="bg-white border rounded-2xl p-5 hover:shadow-lg">
                    <FileBarChart className="text-indigo-600 w-7 h-7" />
                    <h2 className="text-lg font-black mt-4">{item}</h2>
                    <p className="text-slate-500 text-sm mt-1">View detailed report and analytics</p>
                    <button className="mt-4 border px-4 py-2 rounded-xl font-semibold text-sm">View Report</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* NOTIFICATIONS */}
          {activePage === "notifications" && (
            <>
              <PageTitle title="Notifications" desc="Important hospital alerts and admin updates" />
              <div className="grid grid-cols-2 gap-4 mt-6">
                {["Emergency room nearing capacity", "3 pending lab approvals", "New doctor registration pending", "Billing review required"].map((n) => (
                  <div key={n} className="bg-white border rounded-2xl p-5 flex items-center gap-4">
                    <AlertTriangle className="text-red-500 w-6 h-6 shrink-0" />
                    <div>
                      <h2 className="text-base font-bold">{n}</h2>
                      <p className="text-slate-500 text-sm">High Priority</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* SETTINGS */}
          {activePage === "settings" && (
            <>
              <PageTitle title="Settings" desc="Admin profile and system configuration" />
              <div className="bg-white rounded-2xl border p-6 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <input className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm" defaultValue="Admin" />
                  <input className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm" defaultValue="admin@medicare.com" />
                  <input className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm" defaultValue="Hospital Admin" />
                  <input className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm" defaultValue="Full Access" />
                </div>
                <button className="mt-5 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm">Save Changes</button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* --- Add / Edit / View Modal --- */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-slate-900">
                {modal.mode === "add" ? `Add ${modal.title}` : modal.mode === "edit" ? `Edit ${modal.title}` : `View ${modal.title}`}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {modal.fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{f.label}</label>

                  {f.type === "patient" ? (
                    <select
                      disabled={modal.mode === "view"}
                      value={formData.patient || ""}
                      onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                      className="w-full bg-slate-100 px-4 py-2.5 rounded-xl outline-none text-sm disabled:opacity-60"
                    >
                      <option value="">Select Patient</option>
                      {patientOptions.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.firstName} {p.lastName} ({p.patientId})
                        </option>
                      ))}
                    </select>
                  ) : f.type === "doctor" ? (
                    <select
                      disabled={modal.mode === "view"}
                      value={formData.doctor || ""}
                      onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                      className="w-full bg-slate-100 px-4 py-2.5 rounded-xl outline-none text-sm disabled:opacity-60"
                    >
                      <option value="">Select Doctor</option>
                      {doctorOptions.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "select" ? (
                    <select
                      disabled={modal.mode === "view"}
                      value={formData[f.key] ?? ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full bg-slate-100 px-4 py-2.5 rounded-xl outline-none text-sm disabled:opacity-60"
                    >
                      <option value="" disabled>Select {f.label}</option>
                      {f.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      disabled={modal.mode === "view"}
                      value={formData[f.key] ?? ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full bg-slate-100 px-4 py-2.5 rounded-xl outline-none text-sm disabled:opacity-60"
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 border px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50">
                  {modal.mode === "view" ? "Close" : "Cancel"}
                </button>
                {modal.mode !== "view" && (
                  <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow disabled:opacity-60">
                    {saving ? "Saving..." : "Save"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}