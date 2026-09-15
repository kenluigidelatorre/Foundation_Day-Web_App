const express = require("express");
const router = express.Router();
const pool = require("../db");

// ==============================
// GET ALL REGISTRATION LOGS
// ==============================
router.get("/", async (req, res) => {
  try {
    const { search = "" } = req.query;

    const result = await pool.query(
      `
            SELECT
                bl.id,
                s.student_id,
                s.full_name,
                s.program,
                s.block_year,
                b.booth_name,
                b.id AS booth_id,
                bl.visit_date,
                bl.visit_time
            FROM booth_logs bl
            INNER JOIN students s
                ON bl.student_id = s.id
            INNER JOIN booths b
                ON bl.booth_id = b.id
            WHERE
                s.student_id ILIKE $1
                OR s.full_name ILIKE $1
                OR s.program ILIKE $1
                OR b.booth_name ILIKE $1
            ORDER BY bl.created_at DESC
            `,
      [`%${search}%`],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GET LOGS ERROR:", error);

    res.status(500).json({
      message: "Failed to load registration logs.",
    });
  }
});

// ==============================
// CREATE REGISTRATION
// ==============================
router.post("/", async (req, res) => {
  const client = await pool.connect();

  try {
    const { student_id, full_name, program, block_year, booth_id } = req.body;

    if (!student_id || !full_name || !program || !block_year || !booth_id) {
      return res.status(400).json({
        message: "Please complete all required fields.",
      });
    }

    await client.query("BEGIN");

    // Find student
    let student = await client.query(
      `
            SELECT id
            FROM students
            WHERE student_id = $1
            `,
      [student_id],
    );

    let studentDbId;

    // Existing student
    if (student.rows.length > 0) {
      studentDbId = student.rows[0].id;

      await client.query(
        `
                UPDATE students
                SET full_name = $1,
                    program = $2,
                    block_year = $3
                WHERE id = $4
                `,
        [full_name, program, block_year, studentDbId],
      );
    } else {
      // New student
      const newStudent = await client.query(
        `
                INSERT INTO students
                (
                    student_id,
                    full_name,
                    program,
                    block_year
                )
                VALUES ($1, $2, $3, $4)
                RETURNING id
                `,
        [student_id, full_name, program, block_year],
      );

      studentDbId = newStudent.rows[0].id;
    }

    // Check duplicate booth visit
    const duplicate = await client.query(
      `
            SELECT id
            FROM booth_logs
            WHERE student_id = $1
            AND booth_id = $2
            `,
      [studentDbId, booth_id],
    );

    if (duplicate.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "This student is already registered for this booth.",
      });
    }

    // Create booth log
    const log = await client.query(
      `
            INSERT INTO booth_logs
            (
                student_id,
                booth_id
            )
            VALUES ($1, $2)
            RETURNING *
            `,
      [studentDbId, booth_id],
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Student registered successfully!",
      registration: log.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("CREATE LOG ERROR:", error);

    res.status(500).json({
      message: "Registration failed.",
    });
  } finally {
    client.release();
  }
});

// ==============================
// DELETE REGISTRATION
// ==============================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM booth_logs WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Registration not found.",
      });
    }

    res.json({
      message: "Registration deleted successfully.",
      deleted: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE LOG ERROR:", error);

    res.status(500).json({
      message: "Failed to delete registration.",
    });
  }
});

// ==============================
// EXPORT ROUTER
// ==============================
module.exports = router;
