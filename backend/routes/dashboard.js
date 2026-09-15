const express = require("express");
const router = express.Router();

const pool = require("../db");

// ============================================
// GET DASHBOARD STATISTICS
// ============================================

router.get("/stats", async (req, res) => {
  try {
    // ----------------------------------------
    // TOTAL STUDENTS
    // ----------------------------------------

    const studentsResult = await pool.query(`
            SELECT COUNT(*) AS total
            FROM students
        `);

    // ----------------------------------------
    // TOTAL BOOTHS
    // ----------------------------------------

    const boothsResult = await pool.query(`
            SELECT COUNT(*) AS total
            FROM booths
        `);

    // ----------------------------------------
    // TOTAL BOOTH VISITS
    // ----------------------------------------

    const visitsResult = await pool.query(`
            SELECT COUNT(*) AS total
            FROM booth_logs
        `);

    // ----------------------------------------
    // BOOTH ACTIVITY
    // ----------------------------------------

    const activityResult = await pool.query(`
            SELECT
                b.id,
                b.booth_name,
                COUNT(bl.id) AS visitor_count
            FROM booths b
            LEFT JOIN booth_logs bl
                ON b.id = bl.booth_id
            GROUP BY b.id, b.booth_name
            ORDER BY COUNT(bl.id) DESC
        `);

    // ----------------------------------------
    // TOTAL VISITS
    // ----------------------------------------

    const totalVisits = Number(visitsResult.rows[0].total);

    // ----------------------------------------
    // BOOTH ACTIVITY WITH PERCENTAGE
    // ----------------------------------------

    const boothActivity = activityResult.rows.map((booth) => {
      const visitorCount = Number(booth.visitor_count);

      let percentage = 0;

      if (totalVisits > 0) {
        percentage = Math.round((visitorCount / totalVisits) * 100);
      }

      return {
        id: booth.id,
        booth_name: booth.booth_name,
        visitor_count: visitorCount,
        percentage: percentage,
      };
    });

    // ----------------------------------------
    // MOST VISITED BOOTH
    // ----------------------------------------

    let mostVisitedBooth = null;

    if (boothActivity.length > 0) {
      mostVisitedBooth = boothActivity[0];
    }

    // ----------------------------------------
    // RECENT REGISTRATIONS
    // ----------------------------------------

    const recentResult = await pool.query(`
            SELECT
                bl.id,
                s.student_id,
                s.full_name,
                s.program,
                s.block_year,
                b.booth_name,
                bl.visit_date,
                bl.visit_time
            FROM booth_logs bl
            INNER JOIN students s
                ON bl.student_id = s.id
            INNER JOIN booths b
                ON bl.booth_id = b.id
            ORDER BY bl.created_at DESC
            LIMIT 10
        `);

    // ----------------------------------------
    // SEND RESPONSE
    // ----------------------------------------

    res.json({
      totalStudents: Number(studentsResult.rows[0].total),

      totalBooths: Number(boothsResult.rows[0].total),

      totalVisits: totalVisits,

      mostVisitedBooth: mostVisitedBooth,

      boothActivity: boothActivity,

      recentRegistrations: recentResult.rows,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Failed to load dashboard statistics.",
      error: error.message,
    });
  }
});

// DELETE REGISTRATION
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
            DELETE FROM booth_logs
            WHERE id = $1
            RETURNING id
            `,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Registration not found.",
      });
    }

    res.json({
      message: "Registration deleted successfully!",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete registration.",
    });
  }
});

module.exports = router;
