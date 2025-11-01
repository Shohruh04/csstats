import React from "react";
import ReactDOM from "react-dom/client";
import { Leaderboard } from "./modules/Leaderboard";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">CS2 Office Leaderboard</h1>
        <Leaderboard />
      </div>
    </div>
  </React.StrictMode>
);
