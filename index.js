// const express = require("express");
// const app = express();

// app.use(express.json());

// let latestCommand = null;
// let latestStatus = {
//   temperature: null,
//   humidity: null,
// };

// app.get("/", (req, res) => {
//   res.send("Backend is running");
// });

// app.post("/api/command", (req, res) => {
//   const { command } = req.body;

//   if (!command) {
//     return res.status(400).json({ error: "Missing command" });
//   }

//   latestCommand = command;

//   res.json({
//     success: true,
//     command,
//   });
// });

// app.get("/api/command", (req, res) => {
//   const cmd = latestCommand;
//   latestCommand = null;

//   res.json({
//     command: cmd,
//   });
// });

// app.post("/api/status", (req, res) => {
//   const { temperature, humidity } = req.body;

//   latestStatus = {
//     temperature,
//     humidity,
//   };

//   res.json({
//     success: true,
//     status: latestStatus,
//   });
// });

// app.get("/api/status", (req, res) => {
//   res.json(latestStatus);
// });

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on port ${PORT}`);
// });

import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

let latestFrame = null;
let clients = [];

app.use(
  "/api/camera/upload",
  express.raw({
    type: ["image/jpeg", "application/octet-stream"],
    limit: "2mb",
  }),
);

app.post("/api/camera/upload", (req, res) => {
  if (!req.body || req.body.length === 0) {
    return res.status(400).json({ error: "No frame received" });
  }

  latestFrame = Buffer.from(req.body);

  clients.forEach((client) => {
    client.write(`--frame\r\n`);
    client.write(`Content-Type: image/jpeg\r\n`);
    client.write(`Content-Length: ${latestFrame.length}\r\n\r\n`);
    client.write(latestFrame);
    client.write(`\r\n`);
  });

  res.status(200).json({ success: true, size: latestFrame.length });
});

app.get("/api/camera/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "multipart/x-mixed-replace; boundary=frame",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
});

app.get("/api/camera/latest", (req, res) => {
  if (!latestFrame) return res.status(404).send("No frame yet");

  res.setHeader("Content-Type", "image/jpeg");
  res.setHeader("Cache-Control", "no-store");
  res.send(latestFrame);
});

app.listen(PORT, () => {
  console.log(`Camera backend running on port ${PORT}`);
});
