
import React, { useEffect, useState } from "react";
import {api} from "../api";
import {
  Heart,
  Shield,
  BarChart3,
  Smartphone,
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Bed,
  Pill,
  FlaskConical,
  CreditCard,
  AlertCircle,
  Bell,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";


export default function MediCareLandingPage({ setShowLogin }) {

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
  const fetchStats = async () => {
    try {
      
      const res = await api.getLandingStats();
      
  
      if (res) {
        setStats(res);
      }
    } catch (error) {
      console.log("Stats fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchStats();
}, []);

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: "Role-Based Access",
      desc: "Granular permissions for admins, doctors, patients, and receptionists.",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-teal-500" />,
      title: "Real-Time Analytics",
      desc: "Live dashboards with occupancy rates, patient flow, and revenue metrics.",
    },
    {
      icon: <Smartphone className="w-8 h-8 text-cyan-500" />,
      title: "Mobile-First Design",
      desc: "Fully responsive interface for tablets and mobile devices.",
    },
  ];

  const modules = [
    {
      icon: <LayoutDashboard className="w-8 h-8 text-teal-600" />,
      title: "Admin Dashboard",
    },
    {
      icon: <Calendar className="w-8 h-8 text-sky-600" />,
      title: "Appointments",
    },
    {
      icon: <FileText className="w-8 h-8 text-violet-600" />,
      title: "Patient Records",
    },
    {
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      title: "Doctor Management",
    },
    {
      icon: <Bed className="w-8 h-8 text-orange-600" />,
      title: "Bed & Ward",
    },
    {
      icon: <Pill className="w-8 h-8 text-green-600" />,
      title: "Pharmacy",
    },
    {
      icon: <FlaskConical className="w-8 h-8 text-pink-600" />,
      title: "Laboratory",
    },
    {
      icon: <CreditCard className="w-8 h-8 text-cyan-600" />,
      title: "Billing & Payments",
    },
    {
      icon: <AlertCircle className="w-8 h-8 text-red-600" />,
      title: "Emergency Services",
    },
    {
      icon: <Bell className="w-8 h-8 text-purple-600" />,
      title: "Notifications",
    },
  ];

  return (
    <div className="bg-[#f5f7fa] min-h-screen text-gray-800">

      {/* NAVBAR */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-teal-600 rounded-xl flex items-center justify-center">
              <Heart className="text-white w-5 h-5 fill-white" />
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              MediCare+
            </h1>
          </div>

          {/* MENU */}
          <nav className="hidden md:flex items-center gap-10 font-medium text-slate-600">
            <a href="#features" className="hover:text-teal-600 transition">
              Features
            </a>

            <a href="#modules" className="hover:text-teal-600 transition">
              Modules
            </a>

            <a href="#roles" className="hover:text-teal-600 transition">
              Roles
            </a>

            <a href="#testimonials" className="hover:text-teal-600 transition">
              Testimonials
            </a>
          </nav>

          {/* BUTTONS */}
          <div className="flex items-center gap-5">

            {/* UPDATED SIGN IN BUTTON */}
            <button
              onClick={() => setShowLogin(true)}
              className="hidden md:block font-semibold text-slate-700 hover:text-teal-600 transition"
            >
              Sign In
            </button>

            <button className="bg-teal-600 hover:bg-teal-700 transition text-white font-semibold px-6 py-3 rounded-xl">
              Get Started Free
            </button>

          </div>
        </div>
      </header>

  



      {/* HERO SECTION */}
      <section className="bg-[#0f2c54] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-900/40 border border-teal-500/30 rounded-full px-5 py-2 text-teal-300 mb-8">
              <div className="w-3 h-3 rounded-full bg-teal-400"></div>
              Trusted by 300+ hospitals worldwide
            </div>

            <h1 className="text-5xl lg:text-7xl font-black leading-tight">
              The Operating <br />
              System <br />
              <span className="text-teal-400">
                for Modern Hospitals
              </span>
            </h1>

            <p className="mt-8 text-xl text-slate-300 leading-relaxed max-w-2xl">
              MediCare+ unifies every department — from emergency to
              pharmacy — into one intelligent platform built for doctors,
              administrators, and patients.
            </p>

            <div className="flex flex-wrap gap-5 mt-10">
              <button className="bg-teal-500 hover:bg-teal-600 transition px-8 py-4 rounded-2xl font-bold flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>

              <button className="border border-slate-500 hover:border-white hover:bg-white/10 transition px-8 py-4 rounded-2xl font-semibold">
                View Live Demo
              </button>
            </div>

            <div className="flex flex-wrap gap-8 mt-12 text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-teal-400" />
                No setup fee
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-teal-400" />
                HIPAA compliant
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-teal-400" />
                24/7 support
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <div className="flex justify-between">
                <Users className="text-teal-400" />
                <span className="text-teal-400 font-bold"> {stats?.patientGrowth || ""}</span>
              </div>

              <h2 className="text-5xl font-black mt-8">{stats?.activePatients || 0}</h2>

              <p className="text-slate-300 mt-2">Active Patients</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <div className="flex justify-between">
                <Calendar className="text-cyan-400" />
                <span className="text-cyan-400 font-bold">{stats?.newAppointments || 0}</span>
              </div>

              <h2 className="text-5xl font-black mt-8">{stats?.appointments || 0}</h2>

              <p className="text-slate-300 mt-2">Today's Appointments</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <div className="flex justify-between">
                <Bed className="text-blue-400" />
                <span className="text-teal-400 font-bold">
                  {stats?.occupiedBeds || 0} / {stats?.totalBeds || 0}
                </span>
              </div>

              <h2 className="text-5xl font-black mt-8">{ stats?.bedOccupancy || "0%"}</h2>

              <p className="text-slate-300 mt-2">Bed Occupancy</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <div className="flex justify-between">
                <FlaskConical className="text-violet-400" />
                <span className="text-teal-400 font-bold">
                  ↓ 23% faster
                </span>
              </div>

              <h2 className="text-5xl font-black mt-8">{stats?.labPending || 0}</h2>

              <p className="text-slate-300 mt-2">
                Lab Results Pending
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10 text-center">

          <div>
            <h2 className="text-5xl font-black"> {stats?.patients || 0}
</h2>
            <p className="mt-3 text-lg">Patients Managed</p>
          </div>

          <div>
            <h2 className="text-5xl font-black">{stats?.doctors || 0}</h2>
            <p className="mt-3 text-lg">Doctors Connected</p>
          </div>

          <div>
            <h2 className="text-5xl font-black">{stats?.hospitals || 0}</h2>
            <p className="mt-3 text-lg">Hospitals Deployed</p>
          </div>

          <div>
            <h2 className="text-5xl font-black">{stats?.uptime || "0%"}</h2>
            <p className="mt-3 text-lg">System Uptime</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28">
        <div className="max-w-7xl mx-auto px-6">

          <p className="text-teal-600 uppercase tracking-[4px] font-bold">
            Platform Features
          </p>

          <h2 className="text-5xl font-black text-slate-900 mt-5 max-w-4xl leading-tight">
            Everything your hospital needs in one system
          </h2>

          <p className="text-xl text-slate-500 mt-6 max-w-3xl leading-relaxed">
            Built from the ground up for healthcare workflows.
            No bolt-ons, no integrations to manage.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            {features.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl border border-slate-200 p-10 hover:shadow-xl transition"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                  {item.icon}
                </div>

                <h3 className="text-2xl font-bold mt-8">
                  {item.title}
                </h3>

                <p className="text-slate-500 leading-relaxed mt-5">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section id="modules" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">

          <p className="text-teal-600 uppercase tracking-[4px] font-bold">
            10 Integrated Modules
          </p>

          <h2 className="text-5xl font-black text-slate-900 mt-5">
            Every department. One platform.
          </h2>

          <p className="text-xl text-slate-500 mt-6 max-w-3xl">
            From front desk to pharmacy, MediCare+ connects every
            part of your hospital.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mt-20">
            {modules.map((item, index) => (
              <div
                key={index}
                className="bg-[#f8fafc] border border-slate-200 rounded-3xl p-10 flex flex-col items-center text-center hover:shadow-lg transition"
              >
                <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-sm">
                  {item.icon}
                </div>

                <h3 className="font-bold text-lg mt-8">
                  {item.title}
                </h3>

                <ArrowRight className="mt-6 text-slate-400 w-5 h-5" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#0f2c54] text-white py-28">
        <div className="max-w-7xl mx-auto px-6">

          <p className="uppercase tracking-[4px] text-teal-400 font-bold">
            How It Works
          </p>

          <h2 className="text-5xl font-black mt-5">
            Live in 48 hours, not 48 weeks
          </h2>

          <p className="text-xl text-slate-300 mt-6 max-w-3xl leading-relaxed">
            Our onboarding team handles the heavy lifting.
            Your staff are trained and running before the first week.
          </p>

          <div className="grid lg:grid-cols-3 gap-16 mt-24">
            {[
              {
                num: "01",
                title: "Set Up Your Hospital",
                desc: "Import patient data, configure departments, and set roles with guided setup.",
              },
              {
                num: "02",
                title: "Assign Roles & Permissions",
                desc: "Create accounts for admins, doctors, receptionists, and patients.",
              },
              {
                num: "03",
                title: "Run Your Hospital Smarter",
                desc: "Connected workflows improve outcomes and reduce operational errors.",
              },
            ].map((step, index) => (
              <div key={index}>
                <h1 className="text-7xl font-black text-teal-700">
                  {step.num}
                </h1>

                <div className="border-t border-dashed border-teal-600 my-8"></div>

                <h3 className="text-3xl font-bold">
                  {step.title}
                </h3>

                <p className="text-slate-300 text-lg leading-relaxed mt-5">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    
{/* ================= ROLE BASED ACCESS SECTION ================= */}

<section id="roles" className="py-28 bg-[#f5f7fa]">
  <div className="max-w-7xl mx-auto px-6">

    <p className="text-teal-600 uppercase tracking-[4px] font-bold">
      Role-Based Access
    </p>

    <h2 className="text-5xl font-black text-slate-900 mt-5 max-w-4xl leading-tight">
      The right tools for every team member
    </h2>

    <p className="text-xl text-slate-500 mt-6 max-w-3xl leading-relaxed">
      Four purpose-built portals ensure each user sees exactly what
      they need — nothing more, nothing less.
    </p>

    {/* GRID */}
    <div className="grid lg:grid-cols-2 gap-8 mt-20">

      {/* ADMIN */}
      <div className="bg-white rounded-3xl overflow-hidden border border-teal-200 hover:shadow-xl transition duration-300">
        <div
          className="h-72 bg-cover bg-center relative"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200')",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="absolute bottom-6 left-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-4xl font-black text-white">
                Administrator
              </h3>

              <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full font-semibold text-sm">
                Full Control
              </span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <p className="text-slate-500 text-lg leading-relaxed">
            Complete hospital oversight with analytics, staff
            management, resource allocation, and system
            configuration.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              "Real-time hospital metrics",
              "Staff & schedule management",
              "Financial reporting",
              "System configuration",
            ].map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-3 text-lg"
              >
                <CheckCircle2 className="text-teal-600 w-5 h-5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* DOCTOR */}
      <div className="bg-white rounded-3xl overflow-hidden border border-blue-200 hover:shadow-xl transition duration-300">
        <div
          className="h-72 bg-cover bg-center relative"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=1200')",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="absolute bottom-6 left-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-4xl font-black text-white">
                Doctor
              </h3>

              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm">
                Clinical View
              </span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <p className="text-slate-500 text-lg leading-relaxed">
            Patient-centric tools for diagnosis, prescriptions,
            lab orders, and treatment tracking.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              "Digital prescriptions",
              "Patient diagnosis tools",
              "Lab report management",
              "Treatment monitoring",
            ].map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-3 text-lg"
              >
                <CheckCircle2 className="text-blue-600 w-5 h-5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* PATIENT */}
      <div className="bg-white rounded-3xl overflow-hidden border border-pink-200 hover:shadow-xl transition duration-300">
        <div
          className="h-72 bg-cover bg-center relative"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200')",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="absolute bottom-6 left-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-4xl font-black text-white">
                Patient
              </h3>

              <span className="bg-pink-100 text-pink-700 px-4 py-2 rounded-full font-semibold text-sm">
                Personal Portal
              </span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <p className="text-slate-500 text-lg leading-relaxed">
            Patients can book appointments, access medical history,
            download prescriptions, and receive notifications.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              "Online appointment booking",
              "Digital prescriptions",
              "Medical history access",
              "Lab reports & notifications",
            ].map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-3 text-lg"
              >
                <CheckCircle2 className="text-pink-600 w-5 h-5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RECEPTIONIST */}
      <div className="bg-white rounded-3xl overflow-hidden border border-orange-200 hover:shadow-xl transition duration-300">
        <div
          className="h-72 bg-cover bg-center relative"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200')",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="absolute bottom-6 left-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-4xl font-black text-white">
                Receptionist
              </h3>

              <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold text-sm">
                Front Desk Access
              </span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <p className="text-slate-500 text-lg leading-relaxed">
            Efficient front-desk management tools for handling
            appointments, registration, billing support,
            and visitor coordination.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              "Patient registration",
              "Appointment scheduling",
              "Billing assistance",
              "Visitor & queue management",
            ].map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-3 text-lg"
              >
                <CheckCircle2 className="text-orange-600 w-5 h-5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  </div>
</section>
```


      {/* TESTIMONIAL SECTION */}

      <section
        id="testimonials"
        className="py-28 bg-[#f5f7fa]"
      >
        <div className="max-w-7xl mx-auto px-6">

          <p className="text-teal-600 uppercase tracking-[4px] font-bold">
            Testimonials
          </p>

          <h2 className="text-5xl font-black text-slate-900 mt-5">
            Trusted by healthcare leaders
          </h2>

          <div className="grid lg:grid-cols-3 gap-8 mt-20">
            {[
              {
                name: "Dr. Amanda Chen",
                role: "Chief Medical Officer, St. Mercy Hospital",
                image:
                  "https://randomuser.me/api/portraits/women/44.jpg",
                review:
                  "MediCare+ transformed how our hospital operates. Patient wait times dropped 34% in the first quarter.",
              },

              {
                name: "James Okafor",
                role:
                  "Hospital Administrator, NorthView Medical Center",
                image:
                  "https://randomuser.me/api/portraits/men/32.jpg",
                review:
                  "The role-based dashboards are exactly what we needed. Billing errors dropped to near zero.",
              },

              {
                name: "Dr. Priya Nair",
                role:
                  "Head of Emergency Medicine, City General",
                image:
                  "https://randomuser.me/api/portraits/women/68.jpg",
                review:
                  "Real-time bed status and instant lab results help us make faster clinical decisions.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl border border-slate-200 p-10 hover:shadow-xl transition"
              >
                <div className="flex text-yellow-400 text-2xl">
                  ★★★★★
                </div>

                <p className="text-slate-600 text-xl leading-relaxed mt-8">
                  "{item.review}"
                </p>

                <div className="border-t border-slate-200 mt-10 pt-8 flex items-center gap-4">
                  <img
                    src={item.image}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover"
                  />

                  <div>
                    <h4 className="font-bold text-xl text-slate-900">
                      {item.name}
                    </h4>

                    <p className="text-slate-500 mt-1">
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
        {/* ================= CTA SECTION ================= */}

      <section className="relative py-32 overflow-hidden">

        {/* BACKGROUND IMAGE */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1400')",
          }}
        ></div>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-teal-700/85"></div>

        {/* CONTENT */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">

          <h2 className="text-5xl lg:text-7xl font-black leading-tight">
            Ready to modernize your hospital?
          </h2>

          <p className="text-xl lg:text-2xl text-teal-50 mt-10 leading-relaxed max-w-4xl mx-auto">
            Join 300+ hospitals already running on MediCare+.
            No long contracts, no upfront hardware costs —
            just better care.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mt-14">

            <button className="bg-white text-teal-700 hover:bg-slate-100 transition px-10 py-5 rounded-2xl font-bold text-lg flex items-center gap-3">
              Start Free Trial — No Credit Card
              <ArrowRight className="w-5 h-5" />
            </button>

            <button className="border border-white/60 hover:bg-white/10 transition px-10 py-5 rounded-2xl font-bold text-lg">
              Book a Demo
            </button>

          </div>

          <p className="mt-12 text-teal-100 text-lg">
            HIPAA compliant · SOC 2 Type II · ISO 27001 certified
          </p>

        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="bg-[#071f46] text-white py-24">

        <div className="max-w-7xl mx-auto px-6">

          <div className="grid lg:grid-cols-4 gap-14">

            {/* BRAND */}
            <div>

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
                  <Heart className="text-white fill-white w-5 h-5" />
                </div>

                <h2 className="text-3xl font-black">
                  MediCare+
                </h2>

              </div>

              <p className="text-slate-300 text-lg leading-relaxed mt-8 max-w-sm">
                The all-in-one hospital management platform
                for modern healthcare institutions.
              </p>

            </div>

            {/* PRODUCT */}
            <div>

              <h3 className="font-bold text-2xl mb-8">
                Product
              </h3>

              <ul className="space-y-5 text-slate-300 text-lg">

                <li className="hover:text-white cursor-pointer transition">
                  Features
                </li>

                <li className="hover:text-white cursor-pointer transition">
                  Modules
                </li>

                <li className="hover:text-white cursor-pointer transition">
                  Security
                </li>

                <li className="hover:text-white cursor-pointer transition">
                  Pricing
                </li>

                <li className="hover:text-white cursor-pointer transition">
                  Changelog
                </li>

              </ul>

            </div>

            {/* ROLES */}
            <div>

              <h3 className="font-bold text-2xl mb-8">
                Roles
              </h3>

              <ul className="space-y-5 text-slate-300 text-lg">

                <li className="hover:text-white cursor-pointer transition">
                  For Admins
                </li>

                <li className="hover:text-white cursor-pointer transition">
                  For Doctors
                </li>

                <li className="hover:text-white cursor-pointer transition">
                  For Patients
                </li>

                <li className="hover:text-white cursor-pointer transition">
                  For Receptionists
                </li>

              </ul>

            </div>

            {/* COMPANY */}
            <div>

              <h3 className="font-bold text-2xl mb-8">
                Company
              </h3>

              <ul className="space-y-5 text-slate-300 text-lg">

                <li className="hover:text-white cursor-pointer transition">
                  About Us
                </li>

                <li className="hover:text-white cursor-pointer transition">
                  Blog
                </li>

                <li className="hover:text-white cursor-pointer transition">
                  Careers
                </li>

                <li className="hover:text-white cursor-pointer transition">
                  Contact
                </li>

                <li className="hover:text-white cursor-pointer transition">
                  Privacy Policy
                </li>

              </ul>

            </div>

          </div>

          {/* BOTTOM */}
          <div className="border-t border-slate-700 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">

            <p className="text-slate-400 text-lg">
              © 2026 MediCare+. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-8 text-slate-400">

              <span className="hover:text-white cursor-pointer transition">
                Terms of Service
              </span>

              <span className="hover:text-white cursor-pointer transition">
                Privacy Policy
              </span>

              <span className="hover:text-white cursor-pointer transition">
                Cookie Policy
              </span>

            </div>

          </div>

        </div>
      </footer>
    </div>
  );
}