import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "database.sqlite");
const db = new Database(dbPath);

const insertCollege = db.prepare(`
  INSERT INTO colleges (college_name, location, latitude, longitude, courses, fees, placement_rate, scholarships, website)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateCollege = db.prepare(`
  UPDATE colleges SET website = ? WHERE college_name = ?
`);

const colleges = [
  [
    "BVC Engineering College",
    "Odalarevu, Dr. B. R. Ambedkar Konaseema",
    16.4444, 81.9811,
    JSON.stringify(["CSE", "ECE", "ME", "CE", "EEE"]),
    "₹55,000/year",
    "75%",
    "Jagananna Vidya Deevena",
    "https://bvcgroup.in/bvce/"
  ],
  [
    "Amalapuram Institute of Management Sciences and College of Engineering (AIMS)",
    "Mummidivaram, Dr. B. R. Ambedkar Konaseema",
    16.6430, 82.1160,
    JSON.stringify(["CSE", "ECE", "EEE", "ME"]),
    "₹45,000/year",
    "70%",
    "Jagananna Vidya Deevena",
    "http://aimscollege.in/"
  ],
  [
    "Srinivasa Institute of Engineering and Technology (SIET)",
    "Cheyyeru, Amalapuram, Dr. B. R. Ambedkar Konaseema",
    16.6025, 82.0231,
    JSON.stringify(["CSE", "ECE", "ME", "CE", "AI&ML"]),
    "₹50,000/year",
    "72%",
    "Jagananna Vidya Deevena",
    "https://sriniet.edu.in/"
  ],
  [
    "Swarnandhra College of Engineering and Technology",
    "Narsapur (Near Konaseema)",
    16.4385, 81.6984,
    JSON.stringify(["CSE", "ECE", "IT", "ME", "CE", "EEE"]),
    "₹60,000/year",
    "80%",
    "Jagananna Vidya Deevena",
    "https://swarnandhra.ac.in/"
  ],
  [
    "BVC Institute of Technology & Science (BVCITS)",
    "Amalapuram, Dr. B. R. Ambedkar Konaseema",
    16.5770, 82.0030,
    JSON.stringify(["CSE", "ECE", "EEE", "ME", "CE", "AI&ML"]),
    "₹55,000/year",
    "78%",
    "Jagananna Vidya Deevena",
    "https://bvcits.edu.in/"
  ]
];

for (const c of colleges) {
  const exists = db.prepare("SELECT * FROM colleges WHERE college_name = ?").get(c[0]);
  if (!exists) {
    insertCollege.run(...c);
    console.log(`Inserted ${c[0]}`);
  } else {
    updateCollege.run(c[8], c[0]);
    console.log(`Updated website for ${c[0]}`);
  }
}

console.log("Done seeding Konaseema colleges.");
