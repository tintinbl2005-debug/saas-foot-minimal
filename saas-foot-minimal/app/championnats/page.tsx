"use client";

import { Navbar } from "../../components/Navbar";
import { ChevronRight } from "lucide-react";

const LEAGUES = [
  { id: "premier-league", name: "Premier League", country: "Angleterre", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "from-purple-600/20" },
  { id: "la-liga", name: "La Liga", country: "Espagne", flag: "🇪🇸", color: "from-yellow-600/20" },
  { id: "ligue-1", name: "Ligue 1", country: "France", flag: "🇫🇷", color: "from-blue-600/20" },
  { id: "serie-a", name: "Serie A", country: "Italie", flag: "🇮🇹", color: "from-green-600/20" },
  { id: "bundesliga", name: "Bundesliga", country: "Allemagne", flag: "🇩🇪", color: "from-red-600/20" },
];

export default function ChampionnatsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c1ff72] selection:text-black">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Grands <span className="text-[#c1ff72]">Championnats</span>
          </h1>
          <p className="mt-3 text-white/60 text-lg">
            Sélectionnez une ligue pour analyser les forces en présence et les algorithmes prédictifs dédiés.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LEAGUES.map((league) => (
            <button
              key={league.id}
              className={`group flex items-center justify-between p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-r ${league.color} to-white/5 hover:border-[#c1ff72]/40 hover:bg-white/10 transition-all duration-300 text-left backdrop-blur-sm`}
            >
              <div className="flex items-center gap-6">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-black/40 border border-white/10 text-4xl shadow-inner">
                  {league.flag}
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight group-hover:text-[#c1ff72] transition-colors">
                    {league.name}
                  </h2>
                  <p className="text-sm text-white/40 font-medium mt-1">{league.country}</p>
                </div>
              </div>
              <div className="grid place-items-center h-12 w-12 rounded-full bg-black/30 group-hover:bg-[#c1ff72] transition-colors shrink-0 border border-white/5">
                <ChevronRight className="h-6 w-6 text-white/50 group-hover:text-black transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}