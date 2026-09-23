
const express = require("express");

const logger = require("./middleware/logger");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

const PORT = 8080;

// Built-in middleware to parse JSON request bodies
app.use(express.json());

// Custom logger middleware
app.use(logger);

// Home route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Management API is running"
  });
});

// Modular student routes
app.use("/students", studentRoutes);

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// General error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `Server running at http://localhost:${PORT}`
  );
});