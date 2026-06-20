"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Trophy, Activity, CreditCard, Menu, Globe } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  // Fonction pour recréer l'effet "activeProps" de TanStack
  const getLinkClass = (path: string, exact = false) => {
    const isActive = exact ? pathname === path : pathname.startsWith(path);
    const baseClass = "flex items-center gap-2 rounded-full border px-6 py-3 text-base font-semibold transition-all hover:bg-white/10 hover:border-white/20 hover:text-white";
    const activeClass = "bg-white/10 border-[#c1ff72]/30 text-white shadow-[0_0_15px_rgba(193,255,114,0.1)]";
    const inactiveClass = "border-white/5 bg-white/5 text-white/60";
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-24 max-w-[90rem] items-center justify-between px-4 sm:px-8">
        
        {/* Logo PronoIA */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#c1ff72] text-black transition-transform group-hover:scale-105 shadow-[0_0_20px_rgba(193,255,114,0.4)]">
              <Activity className="h-7 w-7 stroke-[2.5]" />
            </div>
            <span className="text-3xl font-black tracking-tight text-white">
              Prono<span className="text-[#c1ff72]">IA</span>
            </span>
          </Link>
        </div>

        {/* Liens de navigation */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/" className={getLinkClass("/", true)}>Accueil</Link>
          <Link href="/championnats" className={getLinkClass("/championnats")}>
            <Trophy className="h-5 w-5" /> Championnats
          </Link>
          <Link href="/mondial" className={getLinkClass("/mondial")}>
            <Globe className="h-5 w-5" /> Coupe du Monde
          </Link>
          <Link href="/history" className={getLinkClass("/history")}>
            <Activity className="h-5 w-5" /> Historique
          </Link>
          <Link href="/pricing" className={getLinkClass("/pricing")}>
            <CreditCard className="h-5 w-5" /> Tarifs
          </Link>
        </div>

        {/* Actions : Connexion / Profil */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:flex items-center gap-3 rounded-full bg-[#c1ff72]/10 border border-[#c1ff72]/30 px-7 py-3.5 text-base font-bold text-[#c1ff72] transition-all hover:bg-[#c1ff72] hover:text-black hover:shadow-[0_0_20px_rgba(193,255,114,0.4)]">
            <User className="h-5 w-5" />
            Connexion
          </Link>
          
          <button className="lg:hidden flex items-center justify-center h-12 w-12 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}