import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const colleges = db.prepare("SELECT * FROM colleges").all();
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch colleges" });
  }
});

router.post("/", (req, res) => {
  const { college_name, location, latitude, longitude, courses, fees, placement_rate, scholarships, website } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO colleges (college_name, location, latitude, longitude, courses, fees, placement_rate, scholarships, website)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      college_name, location, latitude, longitude, 
      JSON.stringify(courses), fees, placement_rate, scholarships, website || null
    );
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: "Failed to add college" });
  }
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { college_name, location, latitude, longitude, courses, fees, placement_rate, scholarships, website } = req.body;
  try {
    const stmt = db.prepare(`
      UPDATE colleges 
      SET college_name = ?, location = ?, latitude = ?, longitude = ?, courses = ?, fees = ?, placement_rate = ?, scholarships = ?, website = ?
      WHERE id = ?
    `);
    stmt.run(
      college_name, location, latitude, longitude, 
      JSON.stringify(courses), fees, placement_rate, scholarships, website || null, id
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update college" });
  }
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  try {
    db.prepare("DELETE FROM colleges WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete college" });
  }
});

export default router;
