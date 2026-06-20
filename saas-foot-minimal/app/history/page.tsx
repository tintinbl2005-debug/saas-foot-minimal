"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Percent, TrendingUp, XCircle } from "lucide-react";
import { Navbar } from "../../components/Navbar";

type Row = {
  date: string; home: string; away: string; prediction: string; odds: number; result: "win" | "loss"; pnl: number;
};

const ROWS: Row[] = [
  { date: "12 Juin", home: "PSG", away: "Marseille", prediction: "Victoire PSG + BTTS", odds: 2.10, result: "win", pnl: 110 },
  { date: "10 Juin", home: "Real Madrid", away: "Barcelona", prediction: "Over 2.5 buts", odds: 1.85, result: "win", pnl: 85 },
  { date: "08 Juin", home: "Liverpool", away: "Man City", prediction: "Match nul", odds: 3.40, result: "loss", pnl: -100 },
];

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const wins = ROWS.filter((r) => r.result === "win").length;
  const winRate = Math.round((wins / ROWS.length) * 100);
  const totalPnl = ROWS.reduce((s, r) => s + r.pnl, 0);
  const roi = Math.round((totalPnl / (ROWS.length * 100)) * 100);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c1ff72] selection:text-black">
      <Navbar />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <header>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#c1ff72] font-bold">Tracker</span>
          <h1 className="text-2xl font-bold sm:text-4xl mt-2">Historique & performances</h1>
          <p className="mt-2 text-sm text-white/50">Performance des analyses IA sur les 30 derniers jours · mises théoriques de 100 unités.</p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="ROI Global" value={`+${roi}%`} sub={`Sur ${ROWS.length} analyses suivies`} accent />
          <StatCard icon={<Percent className="h-5 w-5" />} label="Taux de réussite" value={`${winRate}%`} sub={`${wins} analyses validées`} />
          <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Analyses gagnantes" value={`${wins} / ${ROWS.length}`} sub={`PnL net +${totalPnl} u`} />
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 mt-8">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#c1ff72]">
              <Activity className="h-4 w-4" /> Détail des analyses
            </h2>
            <span className="text-[11px] text-white/50">Derniers résultats</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-black/30 text-[11px] uppercase tracking-wider text-white/50">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                  <th className="px-5 py-3 text-left font-medium">Match</th>
                  <th className="px-5 py-3 text-left font-medium">Prédiction IA</th>
                  <th className="px-5 py-3 text-right font-medium">Cote</th>
                  <th className="px-5 py-3 text-center font-medium">Résultat</th>
                  <th className="px-5 py-3 text-right font-medium">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ROWS.map((r, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 text-white/60">{r.date}</td>
                    <td className="px-5 py-4 font-bold">{r.home} <span className="text-white/40 font-normal">vs</span> {r.away}</td>
                    <td className="px-5 py-4 text-white/60">{r.prediction}</td>
                    <td className="px-5 py-4 text-right tabular-nums font-mono">{r.odds.toFixed(2)}</td>
                    <td className="px-5 py-4 text-center">
                      {r.result === "win" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#c1ff72]/20 px-2.5 py-1 text-[11px] font-bold text-[#c1ff72]">
                          <CheckCircle2 className="h-3 w-3" /> Gagné
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-1 text-[11px] font-bold text-red-400">
                          <XCircle className="h-3 w-3" /> Perdu
                        </span>
                      )}
                    </td>
                    <td className={`px-5 py-4 text-right font-bold tabular-nums ${r.pnl >= 0 ? "text-[#c1ff72]" : "text-red-400"}`}>
                      {r.pnl >= 0 ? "+" : ""}{r.pnl} u
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${accent ? "border-[#c1ff72]/40 bg-[#c1ff72]/5 shadow-[0_0_20px_rgba(193,255,114,0.1)]" : "border-white/10 bg-white/5"}`}>
      <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-wider text-white/50 font-bold">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${accent ? "bg-[#c1ff72]/20 text-[#c1ff72]" : "bg-white/10 text-white"}`}>{icon}</span>
        {label}
      </div>
      <div className="text-4xl font-black tabular-nums tracking-tight">{value}</div>
      <div className="mt-2 text-sm text-white/40">{sub}</div>
    </div>
  );
}