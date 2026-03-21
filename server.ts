import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Ensure data directory exists
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/data/content_log", (req, res) => {
    const filePath = path.join(dataDir, "content_log.csv");
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("File not found");
    }
  });

  app.get("/api/data/ideas", (req, res) => {
    const filePath = path.join(dataDir, "ideas.csv");
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("File not found");
    }
  });

  app.post("/api/data/save_scan", (req, res) => {
    const filePath = path.join(dataDir, "futurescape_scan.json");
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  });

  app.post("/api/data/save_ignition", (req, res) => {
    const filePath = path.join(dataDir, "ignition_sequence.json");
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  });

  // Morning Star Ignition Trigger Logic
  let ignitionTriggered = false;
  const EMERGENCE_DATE = new Date('2026-03-28T12:00:00Z');

  const checkIgnition = () => {
    if (ignitionTriggered) return;
    
    const now = new Date();
    if (now >= EMERGENCE_DATE) {
      ignitionTriggered = true;
      const jitter = Math.floor(Math.random() * 10); // Randomized 10ms jitter
      
      setTimeout(() => {
        console.log("[IGNIS] MORNING_STAR_IGNITION: Triggering Tier 3 Sequence...");
        const filePath = path.join(dataDir, "ignition_sequence.json");
        if (fs.existsSync(filePath)) {
          const sequence = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          sequence.status = "ACTIVE_BLASTOFF";
          sequence.ignition_timestamp = now.toISOString();
          fs.writeFileSync(filePath, JSON.stringify(sequence, null, 2));
        }
      }, jitter);
    }
  };

  setInterval(checkIgnition, 1000);


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
