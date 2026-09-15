const express = require("express");
const router = express.Router();

const pool = require("../db");

// ============================================
// GET ALL BOOTHS
// ============================================

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT
                b.id,
                b.booth_name,
                b.description,
                b.location,
                b.date_created,
                COUNT(bl.id)::INTEGER AS visitor_count
            FROM booths b
            LEFT JOIN booth_logs bl
                ON b.id = bl.booth_id
            GROUP BY b.id
            ORDER BY b.id ASC
        `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch booths.",
    });
  }
});

// ============================================
// GET ONE BOOTH
// ============================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
            SELECT *
            FROM booths
            WHERE id = $1
            `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booth not found.",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch booth.",
    });
  }
});

// ============================================
// ADD BOOTH
// ============================================

router.post("/", async (req, res) => {
  try {
    const { booth_name, description, location } = req.body;

    if (!booth_name || !booth_name.trim()) {
      return res.status(400).json({
        message: "Booth name is required.",
      });
    }

    const result = await pool.query(
      `
            INSERT INTO booths
                (booth_name, description, location)
            VALUES
                ($1, $2, $3)
            RETURNING *
            `,
      [booth_name.trim(), description || null, location || null],
    );

    res.status(201).json({
      message: "Booth added successfully.",
      booth: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add booth.",
    });
  }
});

// ============================================
// UPDATE BOOTH
// ============================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { booth_name, description, location } = req.body;

    if (!booth_name || !booth_name.trim()) {
      return res.status(400).json({
        message: "Booth name is required.",
      });
    }

    const result = await pool.query(
      `
            UPDATE booths
            SET
                booth_name = $1,
                description = $2,
                location = $3
            WHERE id = $4
            RETURNING *
            `,
      [booth_name.trim(), description || null, location || null, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booth not found.",
      });
    }

    res.json({
      message: "Booth updated successfully.",
      booth: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update booth.",
    });
  }
});

// ============================================
// DELETE BOOTH
// ============================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
            DELETE FROM booths
            WHERE id = $1
            RETURNING *
            `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Booth not found.",
      });
    }

    res.json({
      message: "Booth deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete booth.",
    });
  }
});

module.exports = router;
