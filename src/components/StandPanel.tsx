'use client';

import React, { useEffect, useState } from 'react';
import { Stand } from '@/types/stand';
import { sectorOf } from '@/data/mapLayout';
import { standStatusLabels, standStatusAccent } from '@/utils/standColors';

interface StandPanelProps {
    stand: Stand | null;
    onReserve: (id: string, updates: Partial<Stand>) => Promise<{ success: boolean; error?: string }>;
}

export default function StandPanel({ stand, onReserve }: StandPanelProps) {
    const [empresa, setEmpresa] = useState('');
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState('');

    useEffect(() => { setEmpresa(''); setNotice(''); }, [stand?.id]);

    if (!stand) {
        return (
            <section className="p-6">
                <Eyebrow>Seu stand</Eyebrow>
                <h2 className="font-display text-[52px] leading-[.95] mt-2.5 mb-1.5">Selecione um stand</h2>
                <p className="text-[#C8CEDA] text-[14.5px] leading-relaxed">
                    Toque em um stand disponível na planta ou use a busca. Aqui ao lado aparecem o setor e o status, e você já reserva.
                </p>
            </section>
        );
    }

    const sector = sectorOf(stand.numero);
    const sectorName = sector ? (sector.hideBadge ? `Tenda · ${sector.nome}` : `Setor ${String(sector.numero).padStart(2, '0')} · ${sector.nome}`) : 'T3 Experience 2027';
    const available = stand.status === 'disponivel';

    const reserve = async (e: React.FormEvent) => {
        e.preventDefault();
        const nome = empresa.trim();
        if (!nome) return;
        setSaving(true);
        const result = await onReserve(stand.id, { status: 'reservado', empresa: nome });
        setSaving(false);
        setNotice(result.success ? `Stand ${stand.numero} reservado para ${nome}.` : `Não foi possível reservar: ${result.error ?? 'erro desconhecido'}`);
    };

    return (
        <section className="p-6" aria-live="polite">
            <Eyebrow>{sectorName}</Eyebrow>
            <h2 className="font-display text-[56px] leading-[.95] mt-2.5">Stand {stand.numero}</h2>
            <span
                className="inline-block mt-3 px-3 py-1.5 rounded-full text-xs font-bold tracking-[.14em] uppercase"
                style={{ color: standStatusAccent[stand.status], background: `${standStatusAccent[stand.status]}26` }}
            >
                ● {standStatusLabels[stand.status]}
            </span>

            {notice && <p className="mt-4 rounded-xl px-3 py-2.5 text-[13px] bg-[#D9B26A]/15 text-[#F0DCB0] border border-[#D9B26A]/30">{notice}</p>}

            {available ? (
                <form onSubmit={reserve} className="mt-2">
                    <label htmlFor="empresa" className="block text-xs font-bold tracking-[.14em] uppercase text-[#C8CEDA] mt-4 mb-2">
                        Empresa
                    </label>
                    <input
                        id="empresa"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        maxLength={120}
                        autoComplete="organization"
                        required
                        placeholder="Nome da sua empresa"
                        className="w-full h-11 rounded-xl bg-white/[.07] border border-[#C8CEDA]/35 px-3 text-white placeholder:text-[#8DA0C4] outline-none focus-visible:ring-2 focus-visible:ring-[#D9B26A]"
                    />
                    <button
                        disabled={saving || !empresa.trim()}
                        className="w-full mt-3.5 py-3.5 rounded-xl font-semibold tracking-wide text-white border border-[#D9B26A]/85 bg-gradient-to-b from-[#2856AA] to-[#16376A] hover:from-[#3366BE] hover:to-[#1b4a8f] shadow-[0_0_40px_-14px_rgba(80,140,240,.8)] disabled:opacity-45 disabled:cursor-default transition-colors"
                    >
                        {saving ? 'Reservando…' : 'Reservar este stand'}
                    </button>
                    <p className="text-xs text-[#9FB0CF] mt-3">A reserva fica pendente até a equipe T3 confirmar a venda.</p>
                </form>
            ) : (
                <p className="text-[#C8CEDA] text-[14.5px] leading-relaxed mt-4">
                    {stand.empresa ? <>Este stand está com <b className="text-white">{stand.empresa}</b>.</> : 'Este stand não está disponível.'}{' '}
                    Escolha outro stand azul-claro na planta.
                </p>
            )}
        </section>
    );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2.5 text-[11px] font-bold tracking-[.28em] uppercase text-[#C8CEDA]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#D9B26A] shrink-0" />
            {children}
        </div>
    );
}
