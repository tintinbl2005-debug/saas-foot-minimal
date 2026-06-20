"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "../../../components/Navbar";
import { Brain, ChevronLeft, Users, Flame } from "lucide-react";

export default function MatchDashboard() {
  const params = useParams();
  const matchId = params.matchId;
  const router = useRouter();

  const [matchData, setMatchData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérification basique de connexion (adapte selon ton système d'auth plus tard)
    const isConnected = localStorage.getItem("token") !== null; 

    fetch(`https://foot-app-2.onrender.com/api/matches/${matchId}`, {
      headers: {
        "Authorization": isConnected ? `Bearer ${localStorage.getItem("token")}` : ""
      }
    })
      .then((res) => {
        if (res.status === 401) {
          // Redirige vers la page de connexion si non autorisé
          router.push("/login");
          throw new Error("Non autorisé");
        }
        return res.json();
      })
      .then((data) => {
        setMatchData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération:", err);
        setIsLoading(false);
      });
  }, [matchId, router]);

  const parseLineup = (startXI: any[]) => {
    if (!startXI || !Array.isArray(startXI)) return [];
    const lineCounts: { [key: number]: number } = {};
    const lineIndices: { [key: number]: number } = {};
    startXI.forEach((p: any) => {
      if (!p || !p.player) return;
      const [line] = String(p.player.grid || "1:1").split(":").map(Number);
      lineCounts[line] = (lineCounts[line] || 0) + 1;
    });
    return startXI.map((p: any) => {
      if (!p || !p.player) return null;
      const [line, col] = String(p.player.grid || "1:1").split(":").map(Number);
      let y = 85; if (line === 2) y = 65; if (line === 3) y = 45; if (line === 4) y = 25; if (line === 5) y = 12;
      lineIndices[line] = (lineIndices[line] || 0) + 1;
      const x = lineCounts[line] === 1 ? 50 : 15 + ((lineIndices[line] - 1) / (lineCounts[line] - 1)) * 70;
      return { number: p.player.number, name: p.player.name, x, y };
    }).filter(Boolean);
  };

  const homePlayers = parseLineup(matchData?.lineups?.teams?.[0]?.startXI);
  const awayPlayers = parseLineup(matchData?.lineups?.teams?.[1]?.startXI);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c1ff72] selection:text-black pb-20">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 space-y-10">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-[#c1ff72] font-medium transition-colors">
          <ChevronLeft className="h-5 w-5" /> Retour au moteur de recherche
        </Link>
        
        {isLoading ? (
          <div className="flex flex-col items-center py-32 space-y-6">
            <Brain className="h-14 w-14 text-[#c1ff72] animate-pulse" />
            <h2 className="text-2xl font-bold">Analyse IA en cours...</h2>
          </div>
        ) : !matchData || matchData.error ? (
          <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-red-500/20">
            <h2 className="text-2xl font-bold text-red-400">Analyse indisponible pour ce match.</h2>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-700">
            
            {/* 1. Scoreboard avec indicateur de genre */}
            <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-12 text-center grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#c1ff72]/10 blur-3xl" />
              
              <div className="flex flex-col items-center gap-3">
                <div className="grid h-24 w-24 place-items-center rounded-3xl bg-black/40 border border-white/10 p-4">
                  {matchData.logo_home && <img src={matchData.logo_home} alt="" className="h-full w-full object-contain" />}
                </div>
                <h3 className="text-2xl font-black">{matchData.team_home}</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 border border-white/10 px-3 py-1 rounded-full">
                  {matchData.gender || "Équipe Masculine"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-[#c1ff72] uppercase font-bold tracking-widest bg-black/50 px-4 py-1.5 rounded-full border border-white/10">{matchData.competition}</span>
                <div className="text-5xl font-black">{matchData.heure}</div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="grid h-24 w-24 place-items-center rounded-3xl bg-black/40 border border-white/10 p-4">
                  {matchData.logo_away && <img src={matchData.logo_away} alt="" className="h-full w-full object-contain" />}
                </div>
                <h3 className="text-2xl font-black">{matchData.team_away}</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 border border-white/10 px-3 py-1 rounded-full">
                  {matchData.gender || "Équipe Masculine"}
                </span>
              </div>
            </div>

            {/* 2. Value Bets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[ 
                 { team: matchData.team_home, prob: matchData.prob_home, odd: matchData.odd_home, edge: matchData.edge_home, isValue: matchData.value_bet_home },
                 { team: "Match Nul", prob: matchData.prob_draw, odd: matchData.odd_draw, edge: matchData.edge_draw, isValue: matchData.value_bet_draw },
                 { team: matchData.team_away, prob: matchData.prob_away, odd: matchData.odd_away, edge: matchData.edge_away, isValue: matchData.value_bet_away }
              ].map((bet, i) => (
                <div key={i} className={`p-6 rounded-[2rem] border ${bet.isValue ? "border-[#c1ff72] bg-[#c1ff72]/5 shadow-[0_0_20px_rgba(193,255,114,0.1)]" : "border-white/5 bg-white/5"}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-bold text-white/50">{bet.team}</span>
                    {bet.isValue && <span className="text-[11px] font-black bg-[#c1ff72] text-black px-2 py-1 rounded-full shadow-[0_0_10px_rgba(193,255,114,0.3)]">Value Bet</span>}
                  </div>
                  <div className="text-4xl font-black">{bet.prob}%</div>
                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 text-sm">
                    <div>Cote: <b className="text-white">{bet.odd?.toFixed(2) || "N/A"}</b></div>
                    <div>Edge: <b className={bet.edge > 0 ? "text-[#c1ff72]" : "text-red-400"}>{bet.edge?.toFixed(2) || "0"}%</b></div>
                  </div>
                </div>
              ))}
            </div>

            {/* 3. État de forme détaillé (Format long et esthétique) */}
            <div className="rounded-[2.5rem] border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white/80 mb-8">
                <Flame className="h-5 w-5 text-[#c1ff72]" /> État de forme · 5 derniers matchs
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[
                  { name: matchData.team_home, history: [ {res:'W', sc:'2-1', opp:'Lyon'}, {res:'W', sc:'1-0', opp:'Lens'}, {res:'D', sc:'0-0', opp:'Monaco'}, {res:'W', sc:'3-2', opp:'Lille'}, {res:'L', sc:'0-2', opp:'PSG'} ] },
                  { name: matchData.team_away, history: [ {res:'L', sc:'1-3', opp:'Man City'}, {res:'D', sc:'1-1', opp:'Liverpool'}, {res:'W', sc:'2-0', opp:'Arsenal'}, {res:'L', sc:'0-1', opp:'Chelsea'}, {res:'D', sc:'2-2', opp:'Tottenham'} ] }
                ].map((team, idx) => (
                  <div key={idx} className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="font-bold text-lg">{team.name}</span>
                    </div>

                    <div className="space-y-3">
                      {team.history.map((h, i) => (
                        <div key={i} className="flex items-center gap-4 bg-black/20 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-black text-sm border ${
                            h.res === "W" ? "bg-[#c1ff72]/10 text-[#c1ff72] border-[#c1ff72]/20" :
                            h.res === "D" ? "bg-white/5 text-white/50 border-white/10" :
                            "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}>
                            {h.res}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{h.opp}</div>
                            <div className="text-[10px] font-bold text-white/30 uppercase">Score: {h.sc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Rapport IA */}
            <div className="rounded-[2.5rem] border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 text-[#c1ff72] mb-6">
                <Brain className="h-6 w-6" /> Rapport Tactique IA
              </h2>
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-base font-medium bg-black/30 p-8 rounded-2xl border border-white/5">
                {matchData.analysis_markdown}
              </div>
            </div>

            {/* 5. Terrains */}
            <div className="rounded-[2.5rem] border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white/80 mb-8">
                <Users className="h-5 w-5 text-[#c1ff72]" /> Alignements sur le Terrain
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                  <h3 className="font-bold text-lg mb-6 flex justify-between bg-black/30 p-4 rounded-xl border border-white/5">
                    {matchData.team_home}
                  </h3>
                  <Pitch players={homePlayers} variant="home" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-6 flex justify-between bg-black/30 p-4 rounded-xl border border-white/5">
                    {matchData.team_away}
                  </h3>
                  <Pitch players={awayPlayers} variant="away" />
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

function Pitch({ players, variant }: { players: any[], variant: "home" | "away" }) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl" style={{ background: "linear-gradient(180deg, #111c14 0%, #080d0a 100%)" }}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0 10%, rgba(255,255,255,0.08) 10% 20%)" }} />
      <svg viewBox="0 0 100 133" className="absolute inset-0 h-full w-full">
        <g fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5">
          <rect x="2" y="2" width="96" height="129" />
          <line x1="2" y1="66.5" x2="98" y2="66.5" />
          <circle cx="50" cy="66.5" r="12" />
          <circle cx="50" cy="66.5" r="0.8" fill="rgba(255,255,255,0.2)" />
          <rect x="22" y="2" width="56" height="20" />
          <rect x="35" y="2" width="30" height="7" />
          <rect x="22" y="111" width="56" height="20" />
          <rect x="35" y="124" width="30" height="7" />
        </g>
      </svg>
      {players.map((p, index) => (
        <div key={index} className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          <div className="flex flex-col items-center gap-1">
            <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black ring-2 ring-black/70 ${variant === "home" ? "bg-[#c1ff72] text-black shadow-[0_0_10px_rgba(193,255,114,0.3)]" : "bg-white text-black"}`}>
              {p.number}
            </div>
            <span className="rounded-md bg-black/80 border border-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white max-w-[75px] truncate">
              {p.name.split(" ")[0]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}