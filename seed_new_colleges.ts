import Database from "better-sqlite3";
const db = new Database('./database.sqlite');

try {
  const insert = db.prepare(`
    INSERT INTO colleges (college_name, location, latitude, longitude, courses, fees, placement_rate, scholarships, website)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    "Aditya University",
    "Surampalem",
    17.0898,
    82.0670,
    JSON.stringify(["CSE", "ECE", "IT", "ME", "CE", "EEE"]),
    "₹90,000/year",
    "85%",
    "Merit-based scholarships available",
    "https://aditya.ac.in/"
  );

  insert.run(
    "SRKR Engineering College",
    "Bhimavaram",
    16.5448,
    81.5212,
    JSON.stringify(["CSE", "ECE", "IT", "ME", "CE", "EEE", "AI&DS"]),
    "₹85,000/year",
    "80%",
    "Government fee reimbursement applicable",
    "https://srkrec.edu.in/"
  );
  console.log("Added Aditya University and SRKR");
} catch (e) {
  console.error(e);
}
