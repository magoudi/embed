const express = require("express");
const app = express();

app.use(express.json());

let latestCommand = null;
let latestStatus = {
  temperature: null,
  humidity: null,
};

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/api/command", (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: "Missing command" });
  }

  latestCommand = command;

  res.json({
    success: true,
    command,
  });
});

app.get("/api/command", (req, res) => {
  const cmd = latestCommand;
  latestCommand = null;

  res.json({
    command: cmd,
  });
});

app.post("/api/status", (req, res) => {
  const { temperature, humidity } = req.body;

  latestStatus = {
    temperature,
    humidity,
  };

  res.json({
    success: true,
    status: latestStatus,
  });
});

app.get("/api/status", (req, res) => {
  res.json(latestStatus);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
