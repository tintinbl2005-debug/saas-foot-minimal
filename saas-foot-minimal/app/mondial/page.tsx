"use client";

import { Navbar } from "../../components/Navbar";
import { Globe, Sparkles, ShieldAlert } from "lucide-react";

export default function MondialPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c1ff72] selection:text-black">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c1ff72]/10 border border-[#c1ff72]/20 text-[#c1ff72] text-sm font-semibold mb-6">
          <Globe className="h-4 w-4" />
          <span>Données Historiques & Simulations</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
          Module <span className="text-[#c1ff72]">Coupe du Monde</span>
        </h1>
        
        <p className="mt-4 text-white/60 text-lg max-w-xl mx-auto font-medium">
          Accédez aux simulations de scénarios tactiques et probabilités basées sur l'historique des phases finales majeures.
        </p>

        <div className="mt-16 mx-auto max-w-3xl p-10 rounded-[3rem] border border-white/5 bg-white/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#c1ff72]/10 blur-3xl" />
          
          <div className="flex flex-col items-center gap-4 text-center relative z-10">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[#c1ff72]">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mt-2">Moteur de Scénarios Actif</h3>
            <p className="text-sm text-white/50 max-w-md">
              Le traitement mathématique prend en compte l'indice de performance des sélections pour générer des arbres de probabilités complets.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white/40 bg-black/40 border border-white/5 px-4 py-2 rounded-full">
              <ShieldAlert className="h-3.5 w-3.5 text-[#c1ff72]" /> Prêt pour intégration API
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}