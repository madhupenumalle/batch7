import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, LogOut } from "lucide-react";

export default function Admin() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCollege, setCurrentCollege] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    const res = await fetch("/api/colleges");
    const data = await res.json();
    setColleges(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this college?")) {
      await fetch(`/api/colleges/${id}`, { method: "DELETE" });
      fetchColleges();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = currentCollege.id ? "PUT" : "POST";
    const url = currentCollege.id ? `/api/colleges/${currentCollege.id}` : "/api/colleges";
    
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...currentCollege,
        courses: typeof currentCollege.courses === "string" 
          ? currentCollege.courses.split(",").map((c: string) => c.trim()) 
          : currentCollege.courses
      }),
    });
    
    setShowModal(false);
    fetchColleges();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setCurrentCollege({ college_name: "", location: "", latitude: "", longitude: "", courses: "", fees: "", placement_rate: "", scholarships: "", website: "" });
                setShowModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              <Plus size={20} /> Add College
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-medium">College Name</th>
                  <th className="p-4 font-medium">Location</th>
                  <th className="p-4 font-medium">Fees</th>
                  <th className="p-4 font-medium">Placement</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {colleges.map((college) => (
                  <tr key={college.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4 font-medium">{college.college_name}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{college.location}</td>
                    <td className="p-4">{college.fees}</td>
                    <td className="p-4">{college.placement_rate}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setCurrentCollege({
                            ...college,
                            courses: Array.isArray(college.courses) ? college.courses.join(", ") : 
                                     (typeof college.courses === "string" && college.courses.startsWith("[")) ? JSON.parse(college.courses).join(", ") : college.courses
                          });
                          setShowModal(true);
                        }}
                        className="mr-3 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(college.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 dark:bg-slate-900">
            <h2 className="mb-6 text-xl font-bold">{currentCollege.id ? "Edit College" : "Add College"}</h2>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">College Name</label>
                <input
                  type="text"
                  value={currentCollege.college_name}
                  onChange={(e) => setCurrentCollege({ ...currentCollege, college_name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={currentCollege.location}
                  onChange={(e) => setCurrentCollege({ ...currentCollege, location: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Courses (comma separated)</label>
                <input
                  type="text"
                  value={currentCollege.courses}
                  onChange={(e) => setCurrentCollege({ ...currentCollege, courses: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={currentCollege.latitude}
                  onChange={(e) => setCurrentCollege({ ...currentCollege, latitude: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={currentCollege.longitude}
                  onChange={(e) => setCurrentCollege({ ...currentCollege, longitude: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Fees</label>
                <input
                  type="text"
                  value={currentCollege.fees}
                  onChange={(e) => setCurrentCollege({ ...currentCollege, fees: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Placement Rate</label>
                <input
                  type="text"
                  value={currentCollege.placement_rate}
                  onChange={(e) => setCurrentCollege({ ...currentCollege, placement_rate: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">Scholarships</label>
                <input
                  type="text"
                  value={currentCollege.scholarships}
                  onChange={(e) => setCurrentCollege({ ...currentCollege, scholarships: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium">Website URL</label>
                <input
                  type="url"
                  value={currentCollege.website || ""}
                  onChange={(e) => setCurrentCollege({ ...currentCollege, website: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800"
                  placeholder="https://example.edu"
                />
              </div>
              <div className="col-span-2 mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                >
                  Save College
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
