'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStands } from '@/hooks/useStands';
import StandMap from '@/components/StandMap';
import StandPanel from '@/components/StandPanel';
import DashboardStats from '@/components/DashboardStats';
import { Escolha, Stand } from '@/types/stand';
import { partesLivres } from '@/utils/partes';

export default function HomePage() {
  const { stands, loading, stats, updateStand } = useStands();
  // Seleção múltipla: id do stand → 'inteiro' ou terços escolhidos
  const [selecao, setSelecao] = useState<Record<string, Escolha>>({});
  // Stand sem parte livre que a pessoa clicou (só para mostrar quem está nele)
  const [infoId, setInfoId] = useState<string | null>(null);
  const infoStand = stands.find((s) => s.id === infoId) ?? null;

  const handleStandClick = (stand: Stand) => {
    if (partesLivres(stand).length === 0) {
      setInfoId(stand.id);
    } else {
      setInfoId(null);
      const primeiro = Object.keys(selecao).length === 0;
      setSelecao(prev => {
        const next = { ...prev };
        if (next[stand.id]) delete next[stand.id];
        // stand dividido: a pessoa escolhe os terços livres no painel
        else next[stand.id] = stand.partes ? { partes: [], orientacao: stand.partes.orientacao ?? 'vertical' } : 'inteiro';
        return next;
      });
      if (!primeiro) return;
    }
    if (window.matchMedia('(max-width: 1023px)').matches) {
      document.getElementById('stand-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-[#D9B26A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#C8CEDA]">Carregando mapa…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed -left-80 -top-[420px] w-[1000px] h-[1000px] rounded-full bg-[radial-gradient(circle,rgba(64,122,224,.42),transparent_66%)]" />
      <div aria-hidden className="pointer-events-none fixed -right-72 -bottom-[420px] w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(130,170,240,.26),transparent_66%)]" />

      {/* Header */}
      <header className="relative z-10 border-b border-[#D9B26A]/40 bg-[linear-gradient(100deg,#091B3B_22%,rgba(15,40,80,.93)_55%,rgba(9,27,59,.6))]">
        <div className="max-w-[1490px] mx-auto px-4 sm:px-6 py-5 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
          <img src="/logo-t3-2027.png" alt="T3 Experience 2027 · Líderes do Interior" className="w-[220px] sm:w-[260px] h-auto shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 text-xs font-bold tracking-[.32em] uppercase">
              <span className="w-[7px] h-[7px] rounded-full bg-[#D9B26A]" />
              Mapa oficial de stands
            </div>
            <h1 className="font-display text-[clamp(40px,5vw,72px)] leading-[.92] mt-2">
              Escolha o seu <em className="not-italic text-[#C8CEDA]">stand.</em>
            </h1>
            <p className="text-[#C8CEDA] text-sm font-medium mt-2">Centro de Eventos · Sociedade Rural</p>
            <Link href="/admin" className="inline-block mt-3 px-3.5 py-2 rounded-xl bg-white/[.07] border border-[#C8CEDA]/35 text-white text-xs font-semibold hover:bg-white/[.14] transition-colors">
              Área da equipe · reservas e pagamentos
            </Link>
          </div>
          <div className="lg:w-[400px]">
            <DashboardStats stats={stats} />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1490px] mx-auto p-3 sm:p-5 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_370px] gap-4 lg:gap-5 items-start">
        <StandMap stands={stands} onStandClick={handleStandClick} selecao={selecao} />

        <aside
          id="stand-panel"
          aria-label="Detalhes do stand"
          className="lg:sticky lg:top-4 rounded-[26px] border border-[#C8CEDA]/25 bg-[#091B3B]/70 backdrop-blur-xl shadow-[0_30px_70px_-30px_rgba(0,0,0,.6)] overflow-hidden scroll-mt-4"
        >
          <StandPanel stands={stands} selecao={selecao} onChange={setSelecao} info={infoStand} onReserve={updateStand} />
          <div className="border-t border-[#C8CEDA]/25 px-6 py-3 text-xs text-[#9FB0CF] flex items-center justify-between">
            <span>{stats.total} stands no evento</span>
            <span>Reserva sujeita a confirmação</span>
          </div>
        </aside>
      </main>

      <footer className="relative z-10 text-center px-5 pt-2 pb-7 text-[11px] tracking-[.28em] uppercase text-[#7F93B8]">
        T3 Experience 2027 · Líderes do Interior
      </footer>
    </div>
  );
}
