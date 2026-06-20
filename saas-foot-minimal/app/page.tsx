"use client";

import { useRouter } from "next/navigation";
import { Search, Trophy, Calendar, ChevronRight, AlertCircle, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar"; // <-- IMPORT DE LA NAVBAR

export default function LandingPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamHome, setTeamHome] = useState("");
  const [teamAway, setTeamAway] = useState("");
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    fetch("https://foot-app-1.onrender.com/api/matches/today")
      .then((res) => res.json())
      .then((data) => {
        setMatches(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Erreur API:", err);
        setIsLoading(false);
      });
  }, []);

  const handleGenerate = () => {
    setSearchError("");
    if (!teamHome || !teamAway) {
      setSearchError("Veuillez renseigner les deux équipes.");
      return;
    }
    const matchFound = matches.find(
      (m) =>
        m.team_home.toLowerCase().includes(teamHome.toLowerCase()) &&
        m.team_away.toLowerCase().includes(teamAway.toLowerCase())
    );

    if (matchFound) {
      router.push(`/match/${matchFound.match_id}`);
    } else {
      setSearchError("Ce match n'est pas programmé aujourd'hui.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c1ff72] selection:text-black">
      
      {/* NOTRE NOUVELLE NAVBAR */}
      <Navbar />

      <main className="flex flex-col items-center pt-16 px-4 pb-20 mx-auto max-w-7xl">
        <div className="text-center max-w-4xl mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#c1ff72] text-sm font-semibold mb-2">
            <Zap className="h-4 w-4" />
            <span>Moteur d'analyse prédictive IA</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
            Trouvez l'Edge.<br /><span className="text-[#c1ff72]">Battez le marché.</span>
          </h1>
        </div>

        {/* BLOC DE RECHERCHE */}
        <div className="w-full max-w-4xl relative z-10 mb-24">
          <div className="flex flex-col md:flex-row items-center gap-4 bg-white/5 p-3 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none"><Trophy className="h-5 w-5 text-white/30" /></div>
              <input type="text" placeholder="Équipe Domicile..." value={teamHome} onChange={(e) => setTeamHome(e.target.value)} className="w-full bg-black/40 border border-transparent focus:border-[#c1ff72]/50 focus:ring-1 rounded-full py-5 pl-14 pr-6 text-lg text-white outline-none" />
            </div>
            <div className="bg-[#0a0a0a] border border-white/10 text-white/50 font-black text-xs uppercase p-4 rounded-full hidden md:block">VS</div>
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none"><Trophy className="h-5 w-5 text-white/30" /></div>
              <input type="text" placeholder="Équipe Extérieur..." value={teamAway} onChange={(e) => setTeamAway(e.target.value)} className="w-full bg-black/40 border border-transparent focus:border-[#c1ff72]/50 focus:ring-1 rounded-full py-5 pl-14 pr-6 text-lg text-white outline-none" />
            </div>
            <button onClick={handleGenerate} className="w-full md:w-auto h-full flex items-center justify-center gap-2 bg-[#c1ff72] hover:bg-[#aef25c] text-black rounded-full py-5 px-10 font-bold text-lg">
              <Search className="h-5 w-5" /> Générer
            </button>
          </div>
          {searchError && <div className="absolute -bottom-14 left-0 w-full flex justify-center"><span className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-400/10 px-5 py-2.5 rounded-full"><AlertCircle className="h-4 w-4" />{searchError}</span></div>}
        </div>

        {/* MATCHS DU JOUR (Sous la recherche) */}
        <div className="w-full max-w-5xl space-y-8 pb-20">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <div className="p-2 bg-[#c1ff72]/10 rounded-lg"><Calendar className="h-5 w-5 text-[#c1ff72]" /></div>
            <h2 className="text-2xl font-bold text-white">Matchs du jour</h2>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="h-28 rounded-[2rem] bg-white/5 animate-pulse" />
              <div className="h-28 rounded-[2rem] bg-white/5 animate-pulse" />
              <div className="h-28 rounded-[2rem] bg-white/5 animate-pulse" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {matches.map((m) => (
                <button key={m.match_id} onClick={() => router.push(`/match/${m.match_id}`)} className="group flex justify-between p-5 rounded-[2rem] border border-white/5 bg-white/5 hover:border-[#c1ff72]/50 text-left transition-colors">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      {m.logo_home && <img src={m.logo_home} alt="" className="w-5 h-5" />}
                      <span className="font-semibold">{m.team_home}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {m.logo_away && <img src={m.logo_away} alt="" className="w-5 h-5" />}
                      <span className="font-semibold">{m.team_away}</span>
                    </div>
                    <div className="text-xs text-[#c1ff72] font-bold uppercase">{m.competition} • {m.heure}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/50 group-hover:text-[#c1ff72]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}