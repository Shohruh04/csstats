import React from "react";

type Player = {
  steamid: string;
  name: string;
  kills: number;
  deaths: number;
};

export const Leaderboard: React.FC = () => {
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchLeaderboard = React.useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("http://localhost:3001/leaderboard");
      const data = await res.json();
      if (!data?.ok) throw new Error("Backend error");
      setPlayers(data.players || []);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLeaderboard();
    const id = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(id);
  }, [fetchLeaderboard]);

  return (
    <div className="bg-slate-800 rounded-lg shadow p-4">
      {loading && <div>Загрузка...</div>}
      {error && <div className="text-red-400 mb-2">Ошибка: {error}</div>}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-slate-300 uppercase text-xs">
                <th className="py-2">Имя</th>
                <th className="py-2">Kills</th>
                <th className="py-2">Deaths</th>
                <th className="py-2">K/D</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => {
                const kd = p.kills - p.deaths;
                return (
                  <tr key={p.steamid} className="border-t border-slate-700">
                    <td className="py-2 pr-4 font-medium">{p.name}</td>
                    <td className="py-2 pr-4">{p.kills}</td>
                    <td className="py-2 pr-4">{p.deaths}</td>
                    <td className="py-2 pr-4">{kd}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {players.length === 0 && (
            <div className="text-slate-400 py-2">Пока нет данных</div>
          )}
        </div>
      )}
    </div>
  );
};
