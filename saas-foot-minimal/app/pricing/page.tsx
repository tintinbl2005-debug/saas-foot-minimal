"use client";

import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { Navbar } from "../../components/Navbar";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c1ff72] selection:text-black">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c1ff72]/40 bg-[#c1ff72]/10 px-4 py-1.5 text-xs font-bold text-[#c1ff72]">
            <Sparkles className="h-3.5 w-3.5" /> Tarification simple
          </span>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
            Boostez vos analyses avec l'IA
          </h1>
          <p className="mt-4 text-lg text-white/60">
            Démarrez gratuitement, passez Pro quand vous voulez. Sans engagement.
          </p>
        </header>

        <section className="mt-16 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          <PlanCard
            name="Starter"
            icon={<Zap className="h-5 w-5" />}
            price="0€"
            period="/ mois"
            description="Idéal pour découvrir la puissance de l'analyse IA."
            features={["3 analyses IA par jour", "Compositions & infirmerie", "Verdict tactique de l'IA", "Historique 7 jours"]}
            cta="Commencer gratuitement"
            ctaAction={() => router.push("/login")}
          />

          <PlanCard
            featured
            name="Pro"
            icon={<Crown className="h-5 w-5" />}
            price="19€"
            period="/ mois"
            description="Pour les parieurs sérieux qui veulent un edge constant."
            features={["Analyses IA illimitées", "Value bets temps réel", "Scénarios tactiques détaillés", "Historique & ROI complet", "Alertes premium par email", "Support prioritaire"]}
            cta="Passer au Pro"
            ctaAction={() => alert("Paiement Stripe — bientôt disponible")}
          />
        </section>
      </main>
    </div>
  );
}

function PlanCard({ name, icon, price, period, description, features, cta, ctaAction, featured }: any) {
  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] border p-10 transition-all ${featured ? "border-[#c1ff72]/50 bg-gradient-to-b from-white/5 to-[#c1ff72]/5 shadow-[0_0_30px_rgba(193,255,114,0.15)]" : "border-white/10 bg-white/5"}`}>
      {featured && (
        <span className="absolute top-8 right-8 inline-flex items-center gap-1.5 rounded-full bg-[#c1ff72] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-black">
          <Sparkles className="h-3 w-3" /> Recommandé
        </span>
      )}

      <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white/80">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${featured ? "bg-[#c1ff72]/20 text-[#c1ff72]" : "bg-white/10 text-white"}`}>{icon}</span>
        {name}
      </div>

      <div className="mt-8 flex items-baseline gap-2">
        <span className="text-6xl font-black tabular-nums tracking-tighter">{price}</span>
        <span className="text-lg font-medium text-white/50">{period}</span>
      </div>
      <p className="mt-4 text-base text-white/60 leading-relaxed">{description}</p>

      <ul className="mt-8 space-y-4 text-base font-medium">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-3">
            <Check className={`h-5 w-5 shrink-0 ${featured ? "text-[#c1ff72]" : "text-white/40"}`} />
            <span className="text-white/80">{f}</span>
          </li>
        ))}
      </ul>

      <button onClick={ctaAction} className={`mt-10 w-full rounded-2xl px-6 py-4 text-lg font-bold transition-all ${featured ? "bg-[#c1ff72] text-black hover:bg-[#aef25c] hover:scale-[1.02]" : "border border-white/20 bg-transparent text-white hover:bg-white/5 hover:border-white/40"}`}>
        {cta}
      </button>
    </div>
  );
}