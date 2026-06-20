"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BrainCircuit, TrendingUp, AlertTriangle } from "lucide-react";

export default function MatchAnalysis() {
  const { matchId } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Appel direct à ton API Python sur Render
    fetch(`https://foot-app-2.onrender.com/api/matches/${matchId}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération de l'analyse:", err);
        setLoading(false);
      });
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center space-y-4">
        <BrainCircuit className="h-12 w-12 text-[#c1ff72] animate-pulse" />
        <p className="text-xl font-bold animate-pulse">L'IA de PronoIA analyse la rencontre...</p>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-xl font-bold">Impossible de charger l'analyse de ce match.</p>
        <button onClick={() => router.push("/")} className="mt-4 px-6 py-2 bg-white/10 rounded-full hover:bg-white/20">Retour à l'accueil</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c1ff72] selection:text-black pb-20">
      {/* Navbar simplifiée */}
      <nav className="w-full p-4 flex items-center border-b border-white/10">
        <button onClick={() => router.push("/")} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors mr-4">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="font-black text-xl tracking-tighter">PRONO<span className="text-[#c1ff72]">IA</span></div>
      </nav>

      <main className="max-w-5xl mx-auto pt-10 px-4 space-y-8">
        {/* En-tête du match */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white/5 p-8 rounded-[2rem] border border-white/10">
          <div className="flex items-center gap-6 w-full md:w-2/5 justify-end">
            <h2 className="text-2xl md:text-3xl font-bold text-right">{data.team_home}</h2>
            {data.logo_home && <img src={data.logo_home} alt="Logo Domicile" className="w-16 h-16 object-contain" />}
          </div>
          <div className="text-center w-full md:w-1/5 py-6 md:py-0">
            <div className="text-sm text-[#c1ff72] font-bold uppercase mb-2">{data.competition}</div>
            <div className="text-3xl font-black bg-black/50 px-6 py-2 rounded-full inline-block">{data.heure}</div>
          </div>
          <div className="flex items-center gap-6 w-full md:w-2/5 justify-start">
            {data.logo_away && <img src={data.logo_away} alt="Logo Extérieur" className="w-16 h-16 object-contain" />}
            <h2 className="text-2xl md:text-3xl font-bold text-left">{data.team_away}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Colonne de gauche : Stats & Cotes */}
          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-6 border-b border-white/10 pb-4">
                <TrendingUp className="h-5 w-5 text-[#c1ff72]" /> Probabilités 1X2
              </h3>
              <div className="space-y-4">
                <StatRow label="Victoire Domicile" prob={data.prob_home} cote={data.odd_home} isValue={data.value_bet_home} />
                <StatRow label="Match Nul" prob={data.prob_draw} cote={data.odd_draw} isValue={data.value_bet_draw} />
                <StatRow label="Victoire Extérieur" prob={data.prob_away} cote={data.odd_away} isValue={data.value_bet_away} />
              </div>
            </div>
          </div>

          {/* Colonne de droite : Analyse IA */}
          <div className="md:col-span-2 bg-white/5 p-8 rounded-[2rem] border border-white/10">
            <h3 className="flex items-center gap-2 text-xl font-bold mb-6 text-[#c1ff72]">
              <BrainCircuit className="h-6 w-6" /> Rapport Tactique IA
            </h3>
            <div className="prose prose-invert prose-p:leading-relaxed prose-p:text-gray-300">
              <p className="whitespace-pre-wrap">{data.analysis_markdown}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sous-composant pour afficher proprement les lignes de statistiques
function StatRow({ label, prob, cote, isValue }: { label: string, prob: number, cote: number, isValue: boolean }) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-xl ${isValue ? 'bg-[#c1ff72]/10 border border-[#c1ff72]/30' : 'bg-black/30'}`}>
      <span className="font-medium text-sm text-gray-300">{label}</span>
      <div className="flex items-center gap-4">
        <span className="font-bold">{prob}%</span>
        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${isValue ? 'bg-[#c1ff72] text-black' : 'bg-white/10 text-white'}`}>
          {cote.toFixed(2)}
        </span>
      </div>
    </div>
  );
}