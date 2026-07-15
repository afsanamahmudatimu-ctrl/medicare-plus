import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Mail,
  Lock,
  UserRound,
  Stethoscope,
  ShieldCheck,
  ClipboardList,
  ArrowLeft,
  LogIn,
  UserPlus,
} from "lucide-react";
import { api, setToken } from "/src/api";

const roles = [
  { name: "Patient", icon: UserRound, hint: "Patient health portal" },
  { name: "Doctor", icon: Stethoscope, hint: "Doctor consultation portal" },
  { name: "Admin", icon: ShieldCheck, hint: "Full hospital control" },
  { name: "Receptionist", icon: ClipboardList, hint: "Front desk management" },
];

const ROLE_HOME = {
  Patient: "/patient",
  Doctor: "/doctor",
  Admin: "/admin",
  Receptionist: "/receptionist",
};

export default function MediCareLogin({ setShowLogin, setIsLoggedIn, setUserRole }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [selectedRole, setSelectedRole] = useState("Patient");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register-এ
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    if (mode === "register" && (!firstName.trim() || !lastName.trim())) {
      setError("Please enter your first and last name.");
      return;
    }

    try {
      setSubmitting(true);

      const data =
        mode === "login"
          ? await api.login({
            email,
            password
          })
          : await api.register({
            firstName,
            lastName,
            email,
            password,
            phone,
            role: selectedRole
          });

      if (!data?.token) {
        throw new Error("Login succeeded but no token was returned.");
      }

      setToken(data.token);

localStorage.setItem("role", data.user.role);

setUserRole(data.user.role);

setIsLoggedIn(true);

setShowLogin?.(false);

navigate(ROLE_HOME[data.user.role] || "/");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] grid lg:grid-cols-2">
      <section className="hidden lg:flex bg-[#0f2c54] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center">
              <Heart className="text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">MediCare+</h1>
              <p className="text-slate-300">Hospital Management System</p>
            </div>
          </div>
        </div>

        <div className="relative max-w-xl">
          <p className="uppercase tracking-[4px] text-teal-300 font-bold">Secure Login</p>
          <h2 className="text-6xl font-black leading-tight mt-5">
            One platform for every hospital role.
          </h2>
          <p className="text-xl text-slate-300 mt-6 leading-relaxed">
            Admin, doctor, patient and receptionist can enter their own
            dashboard from this single login screen.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-5">
          {roles.map((role) => (
            <div
              key={role.name}
              className="bg-white/10 border border-white/10 rounded-3xl p-6 backdrop-blur"
            >
              <role.icon className="text-teal-300" />
              <h3 className="text-xl font-bold mt-5">{role.name}</h3>
              <p className="text-slate-300 mt-2">{role.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white border border-slate-200 rounded-[32px] shadow-xl p-8 md:p-10">
          <button
            onClick={() => (setShowLogin ? setShowLogin(false) : navigate("/"))}
            className="flex items-center gap-2 text-slate-600 hover:text-teal-600 font-semibold mb-8"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div>
            <h1 className="text-5xl font-black text-slate-900">
              {mode === "login" ? "Sign In" : "Create Account"}
            </h1>
            <p className="text-slate-500 text-lg mt-3">
              {mode === "login"
                ? "Select your role and continue to dashboard."
                : "Register a new patient account."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            {roles.map((role) => (
              <button
                key={role.name}
                type="button"
                onClick={() => setSelectedRole(role.name)}
                className={`border rounded-2xl p-5 text-left transition ${selectedRole === role.name
                    ? "bg-teal-600 text-white border-teal-600 shadow-lg"
                    : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                  }`}
              >
                <role.icon className="w-6 h-6" />
                <h3 className="font-bold mt-3">{role.name}</h3>
                <p
                  className={`text-sm mt-1 ${selectedRole === role.name ? "text-teal-50" : "text-slate-500"
                    }`}
                >
                  {role.hint}
                </p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700">First Name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-100 rounded-2xl px-5 py-4 mt-2 outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Last Name</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-100 rounded-2xl px-5 py-4 mt-2 outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700">Email</label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-slate-100 rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="example@medicare.com"
                  type="email"
                />
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="font-semibold text-slate-700">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-100 rounded-2xl px-5 py-4 mt-2 outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="+880 1XXXXXXXXX"
                />
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700">Password</label>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-slate-100 rounded-2xl pl-12 pr-5 py-4 outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter password"
                  type="password"
                />
              </div>
            </div>

            {error && (
              <p className="bg-red-50 text-red-600 border border-red-100 rounded-2xl px-5 py-3 font-semibold">
                {error}
              </p>
            )}

            <button
              disabled={submitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-3 transition disabled:opacity-60"
            >
              {mode === "login" ? (
                <>
                  <LogIn className="w-5 h-5" />
                  {submitting ? "Signing in..." : `Login as ${selectedRole}`}
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {submitting ? "Creating account..." : "Create Account"}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-6">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="text-teal-600 font-bold hover:underline"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-teal-600 font-bold hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </section>
    </div>
  );
}