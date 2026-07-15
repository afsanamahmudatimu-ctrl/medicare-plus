import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, removeToken } from "../api";

import {
  Heart, LayoutDashboard, Calendar, Bell, Settings, LogOut, Search,
  Users, ClipboardList, CreditCard, UserPlus, Clock3, Stethoscope,
  Bed, AlertCircle, Phone, Plus, CheckCircle2, XCircle, Eye, Edit,
  Trash2, Download, ShieldAlert, Wallet, Loader2
} from "lucide-react";

const FONT_SIZE_STYLES = `
  :root {
    --font-size: 16px;
  }
  html {
    font-size: var(--font-size);
  }
  h1 { font-size: var(--text-2xl); font-weight: var(--font-weight-medium); line-height: 1.5; }
  h2 { font-size: var(--text-xl); font-weight: var(--font-weight-medium); line-height: 1.5; }
  h3 { font-size: var(--text-lg); font-weight: var(--font-weight-medium); line-height: 1.5; }
  h4 { font-size: var(--text-base); font-weight: var(--font-weight-medium); line-height: 1.5; }
  label { font-size: var(--text-base); font-weight: var(--font-weight-medium); line-height: 1.5; }
  button { font-size: var(--text-base); font-weight: var(--font-weight-medium); line-height: 1.5; }
  input { font-size: var(--text-base); font-weight: var(--font-weight-normal); line-height: 1.5; }
`;

export default function ReceptionistDashboard({ setIsLoggedIn, setUserRole }) {
  const navigate = useNavigate();
  const params = useParams();
  const activePage = (params["*"] || "dashboard").split("/")[0] || "dashboard";
  const setActivePage = (id) => navigate(`/receptionist/${id}`);

  // Data States
  const [searchText, setSearchText] = useState("");
  const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, totalAppointments: 0, revenue: 0 });
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  // Doctors now come from the real /doctors API (not hardcoded) because the
  // Appointment schema requires a real Doctor ObjectId.
  const [doctors, setDoctors] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");
const [notifications, setNotifications] = useState([]);
const [notifLoading, setNotifLoading] = useState(true);
const [bills, setBills] = useState([]);
const [billsLoading, setBillsLoading] = useState(true);
const [payingId, setPayingId] = useState(null);
  // Form States
  const [registrationForm, setRegistrationForm] = useState({
    fullName: "", age: "", phone: "", email: "", bloodGroup: "", gender: "", doctorName: "", department: "", address: "", symptoms: ""
  });
  // doctorId (not doctorName) is stored here — the Appointment schema needs
  // a real Doctor ObjectId, and "date" is now tracked separately from "time".
  const [appointmentForm, setAppointmentForm] = useState({
    patientId: "", doctorId: "", date: "", time: "", type: "Consultation", notes: ""
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load Main Data Layer
 const loadData = async () => {
  try {
    setDataLoading(true);
    const [statsData, patientsData, appointmentsData, billsData, doctorsData] = await Promise.all([
      api.getStats(),
      api.list("patients"),
      api.list("appointments"),
      api.list("billing"),
      api.list("doctors"),
    ]);

    setStats(statsData || { totalPatients: 0, totalDoctors: 0, totalAppointments: 0, revenue: 0 });
    setPatients(patientsData?.patients || patientsData || []);
    setAppointments(appointmentsData || []);
    setBills(Array.isArray(billsData) ? billsData : []);
    setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
    setDataError("");
  } catch (error) {
    console.error("Dashboard Data Fetch Error:", error);
    setDataError(error.message || "Failed to load dashboard data. Please try again.");
  } finally {
    setDataLoading(false);
    setBillsLoading(false);
  }
};

  useEffect(() => {
    loadData();
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
const handlePayBill = async (id) => {
  try {
    setPayingId(id);
    await api.post(`/billing/${id}/pay`, {});
    loadData();
  } catch (err) {
    alert(err.message || "Payment failed");
  } finally {
    setPayingId(null);
  }
};
  // Inject Custom Design Baseline Styles
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "receptionist-font-sizes";
    style.innerHTML = FONT_SIZE_STYLES;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById("receptionist-font-sizes");
      if (el) el.remove();
    };
  }, []);

  // Static / Dynamic Placeholders for non-API sections
  

  const beds = [
    { ward: "General Ward", total: 40, available: 12, status: "Available" },
    { ward: "Emergency Ward", total: 20, available: 5, status: "Available" },
    { ward: "ICU", total: 12, available: 2, status: "Limited" },
    { ward: "Maternity Ward", total: 25, available: 13, status: "Available" },
  ];

  // Client-Side Search Filters
  const q = searchText.toLowerCase();

  const filteredAppointments = appointments.filter((a) => {
    const patientName = `${a.patient?.firstName || ""} ${a.patient?.lastName || ""}`.toLowerCase();
    const doctorName = (a.doctor?.name || "").toLowerCase();
    const status = (a.status || "").toLowerCase();
    return patientName.includes(q) || doctorName.includes(q) || status.includes(q);
  });

  const filteredPatients = patients.filter((p) => {
    const fullName = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
    const patientId = (p.patientId || "").toLowerCase();
    const history = (p.medicalHistory || "").toLowerCase();
    return fullName.includes(q) || patientId.includes(q) || history.includes(q);
  });

  const filteredBills = bills.filter(
  (b) =>
    (b.invoiceNo || "").toLowerCase().includes(q) ||
    (b.patient || "").toLowerCase().includes(q) ||
    (b.status || "").toLowerCase().includes(q)
);

  // Dynamic Handlers
  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;
    setRegistrationForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm(prev => ({ ...prev, [name]: value }));
  };

  // Submit Patient Registration
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      const nameParts = registrationForm.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

     await api.create("patients", {
  firstName,
  lastName,
  age: parseInt(registrationForm.age) || 0,
  phone: registrationForm.phone,
  email: registrationForm.email,
  gender: registrationForm.gender,
  bloodGroup: registrationForm.bloodGroup || undefined,
  address: registrationForm.address,
  medicalHistory: registrationForm.symptoms,
  status: "Active",
});

      alert("Patient registered successfully!");
      setRegistrationForm({
        fullName: "", age: "", phone: "", email: "", bloodGroup: "", gender: "", doctorName: "", department: "", address: "", symptoms: ""
      });
      loadData();
      setActivePage("patients");
    } catch (err) {
      alert(err.message || "Failed to register patient");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit New Appointment Schedule
  // Payload now matches the Appointment mongoose schema exactly:
  // patient (ObjectId), doctor (ObjectId), date (Date), time (String),
  // type (enum), status (enum).
  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);
      const selectedPatient = patients.find(p => p._id === appointmentForm.patientId);

      if (!selectedPatient) {
        alert("Please select a valid registered patient.");
        return;
      }
      if (!appointmentForm.doctorId) {
        alert("Please select a doctor.");
        return;
      }

      await api.create("appointments", {
        patient: selectedPatient._id,
        doctor: appointmentForm.doctorId,
        date: appointmentForm.date,
        time: appointmentForm.time,
        type: appointmentForm.type,
        status: "Confirmed",
        notes: appointmentForm.notes
      });

      alert("Appointment scheduled successfully!");
      setAppointmentForm({
        patientId: "", doctorId: "", date: "", time: "", type: "Consultation", notes: ""
      });
      loadData();
      setActivePage("appointments");
    } catch (err) {
      alert(err.message || "Failed to schedule appointment");
    } finally {
      setFormSubmitting(false);
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "patients", label: "Patients", icon: Users },
    { id: "registration", label: "Registration", icon: ClipboardList },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "beds", label: "Beds", icon: Bed },
    { id: "emergency", label: "Emergency", icon: ShieldAlert },
    { id: "notifications", label: "Notifications", icon: Bell, badge: notifications.filter(n => n.unread).length || undefined },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const StatusBadge = ({ status }) => {
    const color =
      status === "Paid" || status === "Completed" || status === "Available" || status === "Confirmed" || status === "Stable"
        ? "bg-green-100 text-green-700"
        : status === "Waiting" || status === "Pending" || status === "Limited"
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

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex">
      {/* Sidebar Navigation */}
      <aside className="w-60 bg-white border-r flex flex-col fixed left-0 top-0 bottom-0 z-50">
        <div className="px-4 py-5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow">
              <Heart className="text-white fill-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">MediCare+</h1>
              <p className="text-slate-500 text-xs">Reception Desk</p>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
                activePage === item.id || (item.id === "appointments" && activePage === "add-appointment") ? "bg-cyan-600 text-white shadow" : "text-slate-700 hover:bg-slate-100"
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
            className="w-full flex items-center gap-3 border border-red-200 text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl font-semibold text-sm transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Layout Block */}
      <main className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Topbar Status & Global Search Bar */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search patients, doctors, appointments..."
              className="w-full bg-slate-100 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActivePage("notifications")} className="relative p-2 hover:bg-slate-100 rounded-full transition">
              <Bell className="w-5 h-5 text-slate-600" />
              {notifications.filter(n => n.unread).length > 0 && (
  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
    {notifications.filter(n => n.unread).length}
  </span>
)}
            </button>
            <div className="flex items-center gap-2 border-l pl-4">
              <div className="w-9 h-9 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-sm">RC</div>
              <h3 className="font-semibold text-slate-700 text-sm">Receptionist</h3>
            </div>
          </div>
        </div>

        {/* Dynamic Inner Body Interface Panels */}
        <div className="p-6 flex-1">
          {dataLoading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-cyan-600 animate-spin" />
              <p className="text-slate-500 font-medium text-sm">Loading systems data...</p>
            </div>
          ) : dataError ? (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-start gap-4 max-w-xl mx-auto mt-12">
              <AlertCircle className="text-red-600 shrink-0 w-6 h-6" />
              <div>
                <h3 className="text-red-800 font-bold text-base">System Error encountered</h3>
                <p className="text-red-700 text-sm mt-1">{dataError}</p>
                <button onClick={loadData} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-semibold">Retry Verification</button>
              </div>
            </div>
          ) : (
            <>
              {/* DASHBOARD TAB VIEW */}
              {activePage === "dashboard" && (
                <>
                  <PageTitle
                    title="Receptionist Dashboard"
                    desc="Professional front desk overview and patient flow"
                    button={
                      <button onClick={() => setActivePage("registration")} className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm shadow transition">
                        <UserPlus className="w-4 h-4" /> Register Patient
                      </button>
                    }
                  />

                  {/* Quantitative Financial & Patient Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white rounded-2xl border p-5 shadow-sm">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Patients</p>
                      <h2 className="text-3xl font-black text-slate-900 mt-1">{stats.totalPatients || 0}</h2>
                    </div>
                    <div className="bg-white rounded-2xl border p-5 shadow-sm">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Doctors</p>
                      <h2 className="text-3xl font-black text-slate-900 mt-1">{stats.totalDoctors || 0}</h2>
                    </div>
                    <div className="bg-white rounded-2xl border p-5 shadow-sm">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Appointments</p>
                      <h2 className="text-3xl font-black text-slate-900 mt-1">{stats.totalAppointments || 0}</h2>
                    </div>
                    <div className="bg-white rounded-2xl border p-5 shadow-sm">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Revenue</p>
                      <h2 className="text-3xl font-black text-slate-900 mt-1">৳ {stats.revenue || 0}</h2>
                    </div>
                  </div>

                  {/* Operational Flow Shortcuts Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <button onClick={() => setActivePage("add-appointment")} className="bg-white border rounded-2xl p-4 hover:shadow-md flex items-center gap-3 text-sm font-semibold transition">
                      <Plus className="text-cyan-600 w-4 h-4" /> New Appointment
                    </button>
                    <button onClick={() => setActivePage("registration")} className="bg-white border rounded-2xl p-4 hover:shadow-md flex items-center gap-3 text-sm font-semibold transition">
                      <UserPlus className="text-cyan-600 w-4 h-4" /> New Patient
                    </button>
                    <button onClick={() => setActivePage("billing")} className="bg-white border rounded-2xl p-4 hover:shadow-md flex items-center gap-3 text-sm font-semibold transition">
                      <Wallet className="text-cyan-600 w-4 h-4" /> Collect Bill
                    </button>
                    <button onClick={() => setActivePage("emergency")} className="bg-red-50 border border-red-200 rounded-2xl p-4 hover:shadow-md flex items-center gap-3 text-sm font-semibold transition">
                      <ShieldAlert className="text-red-600 w-4 h-4" /> <span className="text-red-600">Emergency Admission</span>
                    </button>
                  </div>

                  {/* Core Content Scheduling Modules */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900">Today's Appointment Queue</h2>
                        <button onClick={() => setActivePage("appointments")} className="text-cyan-600 font-bold text-sm hover:underline">View All</button>
                      </div>
                      <div className="space-y-3 mt-5">
                        {filteredAppointments.length === 0 ? (
                          <p className="text-slate-400 text-sm text-center py-6">No scheduled appointments match your query.</p>
                        ) : (
                          filteredAppointments.slice(0, 5).map((item, index) => (
                            <div key={index} className="border rounded-2xl p-4 flex justify-between items-center hover:bg-slate-50 transition">
                              <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center shrink-0">
                                  <Stethoscope className="text-cyan-600 w-4 h-4" />
                                </div>
                                <div>
                                  <h3 className="text-base font-bold text-slate-900">{item.patient?.firstName} {item.patient?.lastName}</h3>
                                  <p className="text-slate-500 text-sm">{item.doctor?.name || "Unassigned Doctor"}</p>
                                  <p className="text-slate-500 text-xs flex items-center gap-1.5 mt-1"><Clock3 className="w-3.5 h-3.5" /> {item.time || "TBD"}</p>
                                </div>
                              </div>
                              <StatusBadge status={item.status} />
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Practitioner Availability Sidecard */}
                    <div className="bg-white rounded-2xl border p-5 shadow-sm">
                      <h2 className="text-xl font-black text-slate-900">Physician Availability</h2>
                      <div className="space-y-3 mt-5">
                        {doctors.length === 0 ? (
                          <p className="text-slate-400 text-sm text-center py-6">No doctors on file.</p>
                        ) : (
                          doctors.map((doc) => (
                            <div key={doc._id} className="border rounded-xl p-4 hover:bg-slate-50 transition">
                              <h3 className="font-bold text-sm text-slate-900">{doc.name}</h3>
                              <p className="text-slate-500 text-xs mt-0.5">{doc.dept || doc.department}</p>
                              <div className="mt-3"><StatusBadge status={doc.status || "Active"} /></div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* BEDS MANAGEMENT TAB */}
              {activePage === "beds" && (
                <>
                  <PageTitle title="Available Beds" desc="Ward-wise bed availability and allocation status" />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    {beds.map((bed, index) => (
                      <div key={index} className="bg-white rounded-2xl border p-5 hover:shadow-lg transition">
                        <Bed className="text-cyan-600 w-7 h-7" />
                        <h2 className="text-lg font-black mt-4 text-slate-900">{bed.ward}</h2>
                        <p className="text-slate-500 text-sm mt-1">Total Beds: {bed.total}</p>
                        <p className="text-3xl font-black mt-3 text-slate-900">{bed.available}</p>
                        <p className="text-slate-500 text-sm mb-3">Available Beds</p>
                        <StatusBadge status={bed.status} />
                        <button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-xl font-semibold text-sm transition">
                          Allocate Bed
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* INVOICING & BILLING TAB */}
              {activePage === "billing" && (
  <>
    <PageTitle
      title="Pending Bills"
      desc="Manage invoices and patient payments"
      button={
        <button className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-semibold flex gap-2 items-center text-sm transition">
          <Download className="w-4 h-4" /> Export Invoices
        </button>
      }
    />
    <div className="bg-white rounded-2xl border p-5 mt-6 shadow-sm">
      {billsLoading ? (
        <p className="text-slate-400 text-sm py-4 text-center">Loading bills...</p>
      ) : filteredBills.length === 0 ? (
        <p className="text-slate-400 text-sm py-4 text-center">No outstanding records match this query criteria.</p>
      ) : (
        filteredBills.map((bill) => (
          <div key={bill._id} className="border rounded-2xl p-4 mb-3 flex justify-between items-center hover:bg-slate-50 transition">
            <div>
              <h3 className="text-base font-bold text-slate-900">{bill.invoiceNo}</h3>
              <p className="text-slate-500 text-sm">{bill.patient}</p>
              <p className="text-lg font-black text-slate-900 mt-1">৳ {bill.amount}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={bill.status} />
              {bill.status !== "Paid" && (
                <button
                  onClick={() => handlePayBill(bill._id)}
                  disabled={payingId === bill._id}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition disabled:opacity-60"
                >
                  {payingId === bill._id ? "Processing..." : "Pay Now"}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  </>
)}
              {/* GENERAL APPOINTMENTS WORKFLOW VIEW */}
              {activePage === "appointments" && (
                <>
                  <PageTitle
                    title="Appointments Scheduler"
                    desc="Create, approve and manage appointment schedule"
                    button={
                      <button onClick={() => setActivePage("add-appointment")} className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-semibold flex gap-2 items-center text-sm transition shadow">
                        <Plus className="w-4 h-4" /> Add Appointment
                      </button>
                    }
                  />
                  <div className="bg-white rounded-2xl border p-5 mt-6 shadow-sm">
                    {filteredAppointments.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-6">No matching appointments found.</p>
                    ) : (
                      filteredAppointments.map((item, index) => (
                        <div key={index} className="border rounded-2xl p-4 mb-3 flex justify-between items-center hover:bg-slate-50 transition">
                          <div>
                            <h3 className="text-base font-bold text-slate-900">{item.patient?.firstName} {item.patient?.lastName}</h3>
                            <p className="text-slate-500 text-sm mt-0.5">{item.doctor?.name || "General Practitioner"}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{item.time || "TBD"} • {item.type || "General Checkup"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={item.status} />
                            <button className="p-2 rounded-xl border hover:bg-slate-100"><Eye className="w-4 h-4 text-slate-600" /></button>
                            <button className="p-2 rounded-xl border hover:bg-slate-100"><Edit className="w-4 h-4 text-slate-600" /></button>
                            <button className="p-2 rounded-xl border border-red-100 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* ADD APPOINTMENT FORM VIEW */}
              {activePage === "add-appointment" && (
                <>
                  <PageTitle title="Schedule New Appointment" desc="Book slots for registered hospital patients" />
                  <form onSubmit={handleAppointmentSubmit} className="bg-white rounded-2xl border p-6 mt-6 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 mb-5">Appointment Specification</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Select Registered Patient with Full Name display */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Select Patient *</label>
                        <select required name="patientId" value={appointmentForm.patientId} onChange={handleAppointmentChange} className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border focus:border-cyan-600 transition h-[46px]">
                          <option value="">-- Choose Patient --</option>
                          {patients.map(p => (
                            <option key={p._id} value={p._id}>
                              {p.firstName} {p.lastName} ({p.patientId || "No ID"})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Select Doctor — real Doctor _id from the API, required by the schema */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Assign Practitioner *</label>
                        <select required name="doctorId" value={appointmentForm.doctorId} onChange={handleAppointmentChange} className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border focus:border-cyan-600 transition h-[46px]">
                          <option value="">-- Choose Doctor --</option>
                          {doctors.map((d) => (
                            <option key={d._id} value={d._id}>{d.name} ({d.dept || d.department})</option>
                          ))}
                        </select>
                      </div>

                      {/* Appointment Date — sent as its own "date" field to match the schema */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Appointment Date *</label>
                        <input required type="date" name="date" value={appointmentForm.date} onChange={handleAppointmentChange} className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border focus:border-cyan-600 transition" />
                      </div>

                      {/* Appointment Time */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Target Time Slot *</label>
                        <input required type="time" name="time" value={appointmentForm.time} onChange={handleAppointmentChange} className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border focus:border-cyan-600 transition" />
                      </div>

                      {/* Appointment Type — options now match the schema enum exactly */}
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">Consultation Category</label>
                        <select name="type" value={appointmentForm.type} onChange={handleAppointmentChange} className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border focus:border-cyan-600 transition h-[46px]">
                          <option value="Consultation">Consultation</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Emergency">Emergency</option>
                        </select>
                      </div>

                      {/* Notes */}
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700">Clinical Notes / Symptoms Context</label>
                        <textarea name="notes" value={appointmentForm.notes} onChange={handleAppointmentChange} placeholder="Write any specific checkup requirements or front-desk intake logs here..." className="bg-slate-100 px-4 py-3 rounded-xl outline-none h-24 text-sm border focus:border-cyan-600 transition" />
                      </div>

                      <button type="submit" disabled={formSubmitting} className="md:col-span-2 bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm disabled:opacity-50 transition shadow mt-2">
                        {formSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />} Secure Appointment Slot
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* PATIENTS MASTER ARCHIVE LIST */}
              {activePage === "patients" && (
                <>
                  <PageTitle
                    title="Patient Directory"
                    desc="Patient queue, waiting list and quick actions"
                    button={
                      <button onClick={() => setActivePage("registration")} className="bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-semibold flex gap-2 items-center text-sm transition">
                        <UserPlus className="w-4 h-4" /> Add New Patient
                      </button>
                    }
                  />
                  <div className="bg-white rounded-2xl border p-5 mt-6 shadow-sm">
                    {filteredPatients.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-6">No matching patient records found.</p>
                    ) : (
                      filteredPatients.map((p) => (
                        <div key={p._id || p.patientId} className="border rounded-2xl p-4 mb-3 flex justify-between items-center hover:bg-slate-50 transition">
                          <div>
                            <h3 className="text-base font-bold text-slate-900">{p.firstName} {p.lastName}</h3>
                            <p className="text-slate-500 text-sm">{p.patientId || "No-ID"} • Age {p.age} • {p.medicalHistory || "No history on file"}</p>
                            <p className="text-slate-400 text-xs mt-0.5">{p.phone || "No Phone Contact Info"}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={p.status || "Stable"} />
                            <button className="border hover:bg-slate-50 px-4 py-2 rounded-xl flex gap-1.5 items-center text-sm font-semibold transition">
                              <Phone className="w-3.5 h-3.5 text-slate-500" /> Contact
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* PATIENT REGISTRATION SUBMISSION INTERFACE */}
              {activePage === "registration" && (
                <>
                  <PageTitle title="New Patient Registration" desc="Add new patient information and create hospital record" />
                  <form onSubmit={handleRegistrationSubmit} className="bg-white rounded-2xl border p-6 mt-6 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900 mb-5">Patient Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required name="fullName" value={registrationForm.fullName} onChange={handleRegistrationChange} placeholder="Patient Full Name" className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border focus:border-cyan-600 transition" />
                      <input name="age" type="number" value={registrationForm.age} onChange={handleRegistrationChange} placeholder="Age" className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border focus:border-cyan-600 transition" />
                      <input required name="phone" value={registrationForm.phone} onChange={handleRegistrationChange} placeholder="Phone Number" className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border focus:border-cyan-600 transition" />
                      <input name="email" type="email" value={registrationForm.email} onChange={handleRegistrationChange} placeholder="Email Address" className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border focus:border-cyan-600 transition" />
                      <select name="bloodGroup" value={registrationForm.bloodGroup} onChange={handleRegistrationChange} className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border focus:border-cyan-600 transition h-[46px]">
  <option value="">-- Select Blood Group --</option>
  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
    <option key={bg} value={bg}>{bg}</option>
  ))}
</select>
                      <select required name="gender" value={registrationForm.gender} onChange={handleRegistrationChange} className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border focus:border-cyan-600 transition h-[46px]">
  <option value="">-- Select Gender --</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
  <option value="Other">Other</option>
</select>
                      <input name="doctorName" value={registrationForm.doctorName} onChange={handleRegistrationChange} placeholder="Assign Doctor Name" className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border focus:border-cyan-600 transition" />
                      <input name="department" value={registrationForm.department} onChange={handleRegistrationChange} placeholder="Department" className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border focus:border-cyan-600 transition" />
                      
                      <textarea name="address" value={registrationForm.address} onChange={handleRegistrationChange} placeholder="Patient Address" className="md:col-span-2 bg-slate-100 px-4 py-3 rounded-xl outline-none h-24 text-sm border focus:border-cyan-600 transition" />
                      <textarea name="symptoms" value={registrationForm.symptoms} onChange={handleRegistrationChange} placeholder="Health Problem / Symptoms Description" className="md:col-span-2 bg-slate-100 px-4 py-3 rounded-xl outline-none h-24 text-sm border focus:border-cyan-600 transition" />
                      
                      <button type="submit" disabled={formSubmitting} className="md:col-span-2 bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm disabled:opacity-50 transition shadow">
                        {formSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Submit Patient Admission
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* EMERGENCY ADMISSION GRID */}
              {activePage === "emergency" && (
                <>
                  <PageTitle title="Emergency Admission Hub" desc="Handle urgent trauma cases and critical bed distribution" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
                      <ShieldAlert className="text-red-600 w-7 h-7" />
                      <h2 className="text-lg font-black mt-4 text-red-700">Critical Trauma Admission</h2>
                      <p className="text-slate-600 text-sm mt-2">Active telemetry tracking required for priority check-ins.</p>
                      <button onClick={() => {
                        setRegistrationForm(prev => ({ ...prev, symptoms: "CRITICAL: Emergency Trauma Unit Request" }));
                        setActivePage("registration");
                      }} className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition">
                        Admit Now
                      </button>
                    </div>
                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                      <Bed className="text-cyan-600 w-7 h-7" />
                      <h2 className="text-lg font-black mt-4 text-slate-900">Immediate Trauma Beds</h2>
                      <p className="text-3xl font-black text-slate-900 mt-3">32 Available</p>
                    </div>
                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                      <Stethoscope className="text-cyan-600 w-7 h-7" />
                      <h2 className="text-lg font-black mt-4 text-slate-900">Emergency On-Duty</h2>
                      <p className="text-slate-500 text-sm mt-2">Dr. Davis is cleared for immediate surgeries.</p>
                      <div className="mt-3"><StatusBadge status="Available" /></div>
                    </div>
                  </div>
                </>
              )}

              {/* NOTIFICATIONS TAB */}
              {activePage === "notifications" && (
  <>
    <PageTitle
      title="Hospital Notifications"
      desc="Real-time emergency updates and administration alerts"
      button={
        <div className="flex gap-2">
          <button onClick={markAllNotificationsRead} className="border px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
            Mark All as Read
          </button>
          <button onClick={clearAllNotifications} className="border px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
            Clear All
          </button>
        </div>
      }
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {notifLoading ? (
        <p className="text-slate-400 text-sm text-center py-6 md:col-span-2">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-6 md:col-span-2">No notifications right now.</p>
      ) : (
        notifications.map((n) => (
          <div key={n._id} className={`bg-white border rounded-2xl p-5 flex gap-3 items-start shadow-sm ${n.unread ? "border-cyan-300 bg-cyan-50" : ""}`}>
            {n.type === "alert" ? (
              <XCircle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="text-cyan-600 w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-semibold text-slate-800">{n.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{n.message}</p>
              <span className="text-slate-400 text-xs">{new Date(n.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))
      )}
    </div>
  </>
)}
              {/* PROFILE/SYSTEM SETTINGS TAB */}
              {activePage === "settings" && (
                <>
                  <PageTitle title="System Settings" desc="Front-desk parameters, profile customizations and scaling settings" />
                  <div className="bg-white rounded-2xl border p-6 mt-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border" defaultValue="Receptionist Station A" />
                      <input className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border" defaultValue="reception@medicare.com" />
                      <input className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border" defaultValue="+880 1700 000000" />
                      <input className="bg-slate-100 px-4 py-3 rounded-xl outline-none text-sm border" defaultValue="Front Desk Operations" />
                    </div>
                    <button onClick={() => alert("Settings configuration saved successfully.")} className="mt-5 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition shadow">
                      Save System Changes
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}