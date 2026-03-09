import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, MapPin } from "lucide-react";

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapBoundsUpdater({ colleges }: { colleges: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (colleges.length > 0) {
      const validColleges = colleges.filter(c => c.latitude && c.longitude);
      if (validColleges.length > 0) {
        const bounds = L.latLngBounds(validColleges.map(c => [c.latitude, c.longitude]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }
  }, [colleges, map]);
  return null;
}

export default function CollegeMap() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter] = useState<[number, number]>([17.3850, 78.4867]); // Default Hyderabad
  const [mapZoom] = useState(6);

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    const res = await fetch("/api/colleges");
    const data = await res.json();
    setColleges(data);
  };

  const filteredColleges = colleges.filter(c => 
    c.college_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col sm:flex-row gap-3 max-w-4xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colleges by name or location (e.g., Konaseema)..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setSearchQuery("Konaseema")}
              className="flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
            >
              <MapPin size={18} />
              Konaseema
            </button>
            <button 
              onClick={() => setSearchQuery("")}
              className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-0">
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBoundsUpdater colleges={filteredColleges} />
          {filteredColleges.map((college) => (
            college.latitude && college.longitude && (
              <Marker key={college.id} position={[college.latitude, college.longitude]}>
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-sm mb-1">{college.college_name}</h3>
                    <p className="text-xs text-slate-600 mb-2">{college.location}</p>
                    <div className="text-xs space-y-1 mb-2">
                      <p><strong>Courses:</strong> {
                        typeof college.courses === "string" && college.courses.startsWith("[") 
                          ? JSON.parse(college.courses).join(", ") 
                          : college.courses
                      }</p>
                      <p><strong>Fees:</strong> {college.fees}</p>
                      <p><strong>Placement:</strong> {college.placement_rate}</p>
                    </div>
                    {college.website && (
                      <div className="mt-3 border-t border-slate-200 pt-2">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Official Website:</p>
                        <a 
                          href={college.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="break-all text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          {college.website}
                        </a>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
