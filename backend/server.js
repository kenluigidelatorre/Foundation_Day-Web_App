const express = require("express");
const cors = require("cors");
require("dotenv").config();

const studentsRoutes = require("./routes/students");
const boothsRoutes = require("./routes/booths");
const logsRoutes = require("./routes/logs");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());


// Home/API test
app.get("/", (req, res) => {
    res.json({
        message: "Foundation Day Booth Log Book API is running."
    });
});


// Routes
app.use("/api/students", studentsRoutes);
app.use("/api/booths", boothsRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/dashboard", dashboardRoutes);


// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});