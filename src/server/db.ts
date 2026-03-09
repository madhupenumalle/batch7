import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "../../database.sqlite");

export const db = new Database(dbPath);

// Initialize database tables
try {
  db.exec("ALTER TABLE colleges ADD COLUMN website TEXT;");
} catch (e) {
  // Column already exists
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student'
  );

  CREATE TABLE IF NOT EXISTS colleges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    college_name TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    courses TEXT,
    fees TEXT,
    placement_rate TEXT,
    scholarships TEXT,
    website TEXT
  );

  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats (id)
  );
`);

// Seed initial data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM colleges").get() as { count: number };
if (count.count === 0) {
  const insertCollege = db.prepare(`
    INSERT INTO colleges (college_name, location, latitude, longitude, courses, fees, placement_rate, scholarships)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertCollege.run(
    "Indian Institute of Technology Hyderabad",
    "Hyderabad, Telangana",
    17.5947, 78.1228,
    JSON.stringify(["CSE", "ECE", "ME", "CE"]),
    "₹2,00,000/year",
    "95%",
    "Merit-cum-Means, SC/ST Scholarships"
  );

  insertCollege.run(
    "International Institute of Information Technology",
    "Hyderabad, Telangana",
    17.4455, 78.3489,
    JSON.stringify(["CSE", "ECE"]),
    "₹3,00,000/year",
    "98%",
    "Pratibha Scholarship"
  );

  insertCollege.run(
    "Jawaharlal Nehru Technological University",
    "Hyderabad, Telangana",
    17.4933, 78.3914,
    JSON.stringify(["CSE", "IT", "ECE", "EEE", "ME", "CE"]),
    "₹50,000/year",
    "85%",
    "State Govt Fee Reimbursement"
  );
  
  insertCollege.run(
    "Andhra University College of Engineering",
    "Visakhapatnam, Andhra Pradesh",
    17.7294, 83.3162,
    JSON.stringify(["CSE", "ECE", "ME", "CE", "EEE"]),
    "₹40,000/year",
    "80%",
    "Jagananna Vidya Deevena"
  );
}
