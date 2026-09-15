const express = require("express");
const router = express.Router();

const pool = require("../db");

// GET ALL STUDENTS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT *
            FROM students
            ORDER BY created_at DESC
        `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch students.",
    });
  }
});

module.exports = router;
