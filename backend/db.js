const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL error:", err);
});

async function testDatabase() {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("PostgreSQL connected:", result.rows[0].now);
    } catch (error) {
        console.error("PostgreSQL connection failed:");
        console.error(error.message);
    }
}

module.exports = pool;