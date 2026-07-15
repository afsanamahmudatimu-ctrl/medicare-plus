import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import {
  Search,
  Bell,
  Menu,
  Plus,
  Eye,
  Pencil,
  Filter,
  Download,
  Trash2,
} from "lucide-react";

export default function PatientRecords() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
const navigate = useNavigate();
const openEditModal = (patient) => {
  navigate(`/patients/edit/${patient._id}`);
};
  async function loadPatients(currentPage = 1, keyword = "") {
    try {
      setLoading(true);

      const data = await api.get(
        `/patients?page=${currentPage}&search=${keyword}`
      );

      setPatients(data.patients);
      setPage(data.page);
      setPages(data.pages);
      setTotal(data.total);

      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    loadPatients(1, e.target.value);
  };

  const nextPage = () => {
    if (page < pages) {
      loadPatients(page + 1, search);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      loadPatients(page - 1, search);
    }
  };

  const deletePatient = async (id) => {
    if (!window.confirm("Delete this patient?")) return;

    try {
      await api.delete(`/patients/${id}`);
      loadPatients(page, search);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-8 py-5 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Menu size={24} />
          <div className="relative">
            <Search
              className="absolute left-4 top-3 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search patients, doctors, appointments..."
              className="w-[700px] pl-12 pr-4 py-3 rounded-xl bg-gray-100 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Bell size={22} />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center text-lg font-semibold">
              AF
            </div>
            <span className="font-medium">Afsanamahmudatimu</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="p-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-bold text-slate-900">
              Patient Records
            </h1>
            <p className="text-gray-600 text-xl mt-2">
              Manage and view patient information
            </p>
            <p className="text-gray-500 mt-2">
              Total Patients : {total}
            </p>
          </div>

          <button
onClick={() => navigate("/patients/add")}
className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 text-xl"
>
    <Plus size={24}/>
    Add Patient
</button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1">
              <Search
                className="absolute left-5 top-3 text-gray-400"
                size={22}
              />
              <input
                type="text"
                placeholder="Search patients..."
                value={search}
                onChange={handleSearch}
                className="w-full pl-14 py-4 bg-gray-100 rounded-xl outline-none"
              />
            </div>

            <button className="border p-4 rounded-xl">
              <Filter />
            </button>

            <button className="border p-4 rounded-xl">
              <Download />
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">Loading Patients...</div>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
              {error}
            </div>
          )}

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-4">Patient</th>
                <th>Age/Gender</th>
                <th>Blood</th>
                <th>Status</th>
                <th>Last Visit</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {patients.map((patient) => (
                <tr key={patient._id} className="border-b">
                  <td className="py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-cyan-700">
                        {patient.firstName?.charAt(0)}
                        {patient.lastName?.charAt(0)}
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-gray-500">{patient.patientId}</p>
                      </div>
                    </div>
                  </td>

                  <td>
                    {patient.age} / {patient.gender}
                  </td>

                  <td>
                    <span className="border px-4 py-2 rounded-xl">
                      {patient.bloodGroup || "-"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        patient.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>

                  <td>{new Date(patient.createdAt).toLocaleDateString()}</td>

                  <td>
                    <div className="flex gap-4">
                      <button
onClick={()=>navigate(`/patients/${patient._id}`)}
>
                        <Eye />
                      </button>
                      <button
onClick={()=>openEditModal(patient)}
>
                        <Pencil />
                      </button>
                      <button onClick={() => deletePatient(patient._id)}>
                        <Trash2 className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={prevPage}
              disabled={page === 1}
              className="border px-4 py-2 rounded"
            >
              Previous
            </button>

            <span>
              Page {page} of {pages}
            </span>

            <button
              onClick={nextPage}
              disabled={page === pages}
              className="border px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}