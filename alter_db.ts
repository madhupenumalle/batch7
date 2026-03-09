import Database from "better-sqlite3";
const db = new Database('./database.sqlite');
try {
  db.exec('ALTER TABLE colleges ADD COLUMN website TEXT;');
  console.log("Added website column");
} catch (e) {
  console.log("Column already exists");
}
