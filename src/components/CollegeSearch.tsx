import { useState, useEffect } from "react";
import { Search, MapPin, GraduationCap, IndianRupee, Briefcase, ExternalLink } from "lucide-react";

export default function CollegeSearch() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  
  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    const res = await fetch("/api/colleges");
    const data = await res.json();
    setColleges(data);
  };

  const filteredColleges = colleges.filter(c => {
    const matchesSearch = c.college_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCourse = true;
    if (filterCourse) {
      const courses = typeof c.courses === "string" && c.courses.startsWith("[") 
        ? JSON.parse(c.courses) 
        : (typeof c.courses === "string" ? c.courses.split(",") : c.courses);
      
      matchesCourse = Array.isArray(courses) && courses.some((course: string) => 
        course.toLowerCase().includes(filterCourse.toLowerCase())
      );
    }
    
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="flex h-full flex-col bg-slate-50/50 dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Find Your Dream College</h2>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by college name or location..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-indigo-400"
            />
          </div>
          <div className="relative w-full sm:w-64">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              placeholder="Filter by course (e.g. CSE)"
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-indigo-400"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredColleges.map((college) => (
            <div key={college.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <div className="p-6">
                <h3 className="mb-3 text-xl font-bold leading-tight text-slate-900 dark:text-white">{college.college_name}</h3>
                
                <div className="mb-5 flex items-start gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-indigo-500" />
                  <span>{college.location}</span>
                </div>
                
                <div className="mt-auto space-y-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <div className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 rounded-full bg-indigo-100 p-1 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                      <GraduationCap size={14} />
                    </div>
                    <div>
                      <span className="block font-semibold text-slate-700 dark:text-slate-300">Courses</span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {typeof college.courses === "string" && college.courses.startsWith("[") 
                          ? JSON.parse(college.courses).join(", ") 
                          : college.courses}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                      <IndianRupee size={14} />
                    </div>
                    <div>
                      <span className="block font-semibold text-slate-700 dark:text-slate-300">Fees</span>
                      <span className="text-slate-600 dark:text-slate-400">{college.fees}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 rounded-full bg-amber-100 p-1 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                      <Briefcase size={14} />
                    </div>
                    <div>
                      <span className="block font-semibold text-slate-700 dark:text-slate-300">Placement</span>
                      <span className="text-slate-600 dark:text-slate-400">{college.placement_rate}</span>
                    </div>
                  </div>
                </div>

                {college.website && (
                  <div className="mt-6 flex flex-col gap-2 rounded-xl bg-indigo-50 p-4 dark:bg-indigo-900/20">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">Official Website</span>
                    <a 
                      href={college.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <span className="truncate">{college.website}</span>
                      <ExternalLink size={14} className="shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {filteredColleges.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center dark:border-slate-800">
              <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                <Search size={32} className="text-slate-400" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">No colleges found</p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
