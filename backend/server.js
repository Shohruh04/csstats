const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const PORT = 3001;

// Initialize DB
const db = new Database("cs2stats.db");
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS players (
  steamid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kills INTEGER NOT NULL DEFAULT 0,
  deaths INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
`);

const upsertPlayer = db.prepare(`
INSERT INTO players (steamid, name, kills, deaths, updated_at)
VALUES (@steamid, @name, @kills, @deaths, @updated_at)
ON CONFLICT(steamid) DO UPDATE SET
  name = excluded.name,
  kills = excluded.kills,
  deaths = excluded.deaths,
  updated_at = excluded.updated_at;
`);

const listLeaderboard = db.prepare(`
SELECT steamid, name, kills, deaths FROM players
ORDER BY kills DESC, deaths ASC, name ASC;
`);

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5174", "http://127.0.0.1:5174"],
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "cs2-stats-backend",
    endpoints: ["/gsi (POST)", "/leaderboard (GET)"],
  });
});

// Endpoint for CS2 GSI
app.post("/gsi", (req, res) => {
  try {
    const payload = req.body || {};
    console.log("GSI payload received");
    console.log(payload);
    // Если прислан блок allplayers (наблюдатель/GOTV), обрабатываем всех игроков
    if (payload.allplayers && typeof payload.allplayers === "object") {
      for (const [maybeSteamId, p] of Object.entries(payload.allplayers)) {
        if (!p || typeof p !== "object") continue;
        const state = p.state || {};
        const match = p.match_stats || {};
        const steamid = p.steamid || maybeSteamId;
        const name = p.name || "Unknown";
        const kills = Number.isFinite(state.kills)
          ? state.kills
          : Number.isFinite(match.kills)
          ? match.kills
          : 0;
        const deaths = Number.isFinite(state.deaths)
          ? state.deaths
          : Number.isFinite(match.deaths)
          ? match.deaths
          : 0;
        if (!steamid) continue;
        upsertPlayer.run({
          steamid: String(steamid),
          name: String(name),
          kills: Number(kills) || 0,
          deaths: Number(deaths) || 0,
          updated_at: new Date().toISOString(),
        });
      }
      return res.json({ ok: true, mode: "allplayers" });
    }

    // Fallback: одиночный локальный игрок
    const player = payload.player || {};
    const state = player.state || {};
    const steamid = player.steamid || player.steam || payload.provider?.steamid;
    const name = player.name || "Unknown";
    const kills = Number.isFinite(state.kills)
      ? state.kills
      : Number.isFinite(player.match_stats?.kills)
      ? player.match_stats.kills
      : 0;
    const deaths = Number.isFinite(state.deaths)
      ? state.deaths
      : Number.isFinite(player.match_stats?.deaths)
      ? player.match_stats.deaths
      : 0;

    if (!steamid) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing steamid in GSI payload" });
    }

    upsertPlayer.run({
      steamid: String(steamid),
      name: String(name),
      kills: Number(kills) || 0,
      deaths: Number(deaths) || 0,
      updated_at: new Date().toISOString(),
    });

    res.json({ ok: true, mode: "single" });
  } catch (err) {
    console.error("Error handling /gsi payload", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

// Leaderboard endpoint
app.get("/leaderboard", (_req, res) => {
  try {
    const rows = listLeaderboard.all();
    res.json({ ok: true, players: rows });
  } catch (err) {
    console.error("Error fetching leaderboard", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`CS2 Stats backend listening on http://localhost:${PORT}`);
});
