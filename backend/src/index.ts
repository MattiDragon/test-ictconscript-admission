import express from "express";
import sampleData from "./sample-data/data.json" with { type: "json" };
import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("./db.sqlite");

if (
  !db
    .prepare(
      `SELECT name FROM sqlite_schema WHERE type='table' AND name='events'`,
    )
    .get()
) {
  db.exec(`CREATE TABLE events(
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    isoTime TEXT NOT NULL,
    lat REAL,
    lon REAL
    )`);
  const addEntryStatement = db.prepare(
    `INSERT INTO events (id, title, body, isoTime, lat, lon) VALUES (?, ?, ?, ?, ?, ?)`,
  );
  sampleData.forEach((dataPoint) => {
    addEntryStatement.run(
      dataPoint.id,
      dataPoint.title,
      dataPoint.body,
      dataPoint.isoTime,
      dataPoint.lat,
      dataPoint.lon,
    );
  });
}

const prevId = db.prepare(`SELECT max(id) FROM events`).get()!!["max(id)"];
let nextId = ((prevId as number | null) ?? 0) + 1;

const app = express();

app.get("/health", (req, res) => {
  res.contentType("text/plain").send("OK");
});

app.use(express.json());

const listEntriesStatement = db.prepare(
  `SELECT * FROM events ORDER BY isoTime DESC`,
);
app.get("/entries", (req, res) => {
  const entries = listEntriesStatement.all();
  res.json(entries);
});

const getEntryStatement = db.prepare(`SELECT * FROM events WHERE id = ?`);
app.get("/entries/:id", (req, res) => {
  let id: number;
  try {
    id = parseInt(req.params.id, 10);
  } catch {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const event = getEntryStatement.get(id);
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ error: "Entry not found" });
  }
});

const addEntryStatement = db.prepare(
  `INSERT INTO events (id, title, body, isoTime, lat, lon) VALUES (?, ?, ?, ?, ?, ?)`,
);
app.post("/entries", (req, res) => {
  const payload = req.body;
  if (typeof payload.title !== "string" || payload.title.length > 120) {
    res
      .status(400)
      .json({ error: "Missing or invalid title, must be string <=120 chars" });
    return;
  }
  if (typeof payload.body !== "string") {
    res.status(400).json({ error: "Missing or invalid body, must be string" });
    return;
  }

  let lat = null;
  let lon = null;
  if (payload.lat !== undefined || payload.lon !== undefined) {
    if (typeof payload.lat !== "number" || typeof payload.lon !== "number") {
      res.status(400).json({
        error:
          "Invalid coordinates. If either is present, both lat and lon must be numbers",
      });
      return;
    }
    if (
      payload.lat < -90 ||
      payload.lat > 90 ||
      payload.lon < -180 ||
      payload.lon > 180
    ) {
      res.status(400).json({ error: "Coordinates out of range" });
      return;
    }
    lat = payload.lat;
    lon = payload.lon;
  }

  const id = nextId++;
  addEntryStatement.run(
    id,
    payload.title,
    payload.body,
    new Date().toISOString(),
    lat,
    lon,
  );

  res.json(getEntryStatement.get(id));
});

const port = parseInt(process.env.PORT ?? "8000");
app
  .listen(port, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Server is running on port ${port}`);
    }
  })
  .on("close", () => {
    db.close();
  });
