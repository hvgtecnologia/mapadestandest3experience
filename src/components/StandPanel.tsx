'use client';

import React, { useState } from 'react';
import { Escolha, Orientacao, ParteId, Stand } from '@/types/stand';
import { sectorOf } from '@/data/mapLayout';
import { standStatusLabels, standStatusAccent, standStatusColors } from '@/utils/standColors';
import { PARTES, isParcial, orientacaoDe, orientacaoNomes, parteNomes, partesLivres, partesVazias, rotuloEscolha, updatePartes } from '@/utils/partes';

interface StandPanelProps {
    stands: Stand[];
    selecao: Record<string, Escolha>;
    onChange: React.Dispatch<React.SetStateAction<Record<string, Escolha>>>;
    /** Stand ocupado que a pessoa clicou (só para mostrar quem está nele). */
    info: Stand | null;
    onReserve: (id: string, updates: Partial<Stand>) => Promise<{ success: boolean; error?: string }>;
}

const sectorName = (numero: number) => {
    const s = sectorOf(numero);
    return s ? (s.hideBadge ? `Tenda · ${s.nome}` : `Setor ${String(s.numero).padStart(2, '0')} · ${s.nome}`) : 'T3 Experience 2027';
};

export default function StandPanel({ stands, selecao, onChange, info, onReserve }: StandPanelProps) {
    const [empresa, setEmpresa] = useState('');
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState('');

    const itens = Object.entries(selecao)
        .map(([id, escolha]) => ({ stand: stands.find(s => s.id === id), escolha }))
        .filter((i): i is { stand: Stand; escolha: Escolha } => !!i.stand)
        .sort((a, b) => a.stand.numero - b.stand.numero);

    const set = (id: string, escolha: Escolha | null) => {
        onChange(prev => {
            const next = { ...prev };
            if (escolha === null) delete next[id]; else next[id] = escolha;
            return next;
        });
        setNotice('');
    };

    const togglePart = (stand: Stand, p: ParteId) => {
        onChange(prev => {
            const atual = prev[stand.id];
            if (!isParcial(atual)) return prev;
            const partes = atual.partes.includes(p) ? atual.partes.filter(x => x !== p) : [...atual.partes, p].sort() as ParteId[];
            return { ...prev, [stand.id]: { ...atual, partes } };
        });
        setNotice('');
    };

    /** Só quem divide o stand primeiro escolhe a orientação. */
    const setOrientacao = (stand: Stand, orientacao: Orientacao) => {
        if (stand.partes) return;
        onChange(prev => {
            const atual = prev[stand.id];
            return isParcial(atual) ? { ...prev, [stand.id]: { ...atual, orientacao } } : prev;
        });
    };

    const incompleto = itens.some(i => isParcial(i.escolha) && i.escolha.partes.length === 0);

    const reserve = async (e: React.FormEvent) => {
        e.preventDefault();
        const nome = empresa.trim();
        if (!nome || !itens.length || incompleto) return;
        setSaving(true);
        const falhas: string[] = [];
        for (const { stand, escolha } of itens) {
            let updates: Partial<Stand>;
            if (escolha === 'inteiro') {
                updates = updatePartes(null, { status: 'reservado', empresa: nome });
            } else {
                // stand já dividido mantém a orientação gravada; senão vale a escolhida agora
                const partes = structuredClone(stand.partes ?? partesVazias(escolha.orientacao));
                if (!partes.orientacao) partes.orientacao = escolha.orientacao;
                escolha.partes.forEach(p => { partes[p] = { status: 'reservado', empresa: nome }; });
                updates = updatePartes(partes);
            }
            const r = await onReserve(stand.id, updates);
            if (!r.success) falhas.push(`${stand.numero} (${r.error ?? 'erro'})`);
        }
        setSaving(false);
        if (falhas.length) {
            setNotice(`Não foi possível reservar: ${falhas.join(', ')}`);
        } else {
            setNotice(`Reservado para ${nome}: ${itens.map(i => rotuloEscolha(i.stand.numero, i.escolha)).join(' + ')}.`);
            onChange({});
            setEmpresa('');
        }
    };

    return (
        <section className="p-6" aria-live="polite">
            {notice && <p className="mb-4 rounded-xl px-3 py-2.5 text-[13px] bg-[#D9B26A]/15 text-[#F0DCB0] border border-[#D9B26A]/30">{notice}</p>}

            {info && <InfoOcupado stand={info} />}

            {!itens.length && !info && (
                <>
                    <Eyebrow>Seu stand</Eyebrow>
                    <h2 className="font-display text-[52px] leading-[.95] mt-2.5 mb-1.5">Selecione os stands</h2>
                    <p className="text-[#C8CEDA] text-[14.5px] leading-relaxed">
                        Toque nos stands disponíveis na planta. Você pode escolher vários, lado a lado, e usar só uma parte de um stand
                        (A, B ou C). Depois é só informar a empresa e reservar.
                    </p>
                </>
            )}

            {itens.length > 0 && (
                <>
                    <Eyebrow>Sua seleção</Eyebrow>
                    <h2 className="font-display text-[44px] leading-[.95] mt-2.5">
                        {itens.length === 1 ? '1 stand' : `${itens.length} stands`}
                    </h2>

                    <ul className="mt-4 space-y-3">
                        {itens.map(({ stand, escolha }) => {
                            const livres = partesLivres(stand);
                            const podeInteiro = !stand.partes && stand.status === 'disponivel';
                            const parcial = isParcial(escolha) ? escolha : null;
                            const travada = !!stand.partes;
                            const ori: Orientacao = travada ? orientacaoDe(stand) : (parcial?.orientacao ?? 'vertical');
                            return (
                                <li key={stand.id} className="rounded-2xl border border-[#C8CEDA]/25 bg-white/[.04] p-3.5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-white">Stand {stand.numero}</p>
                                            <p className="text-[11px] text-[#9FB0CF] mt-0.5">{sectorName(stand.numero)}</p>
                                        </div>
                                        <button type="button" onClick={() => set(stand.id, null)} aria-label={`Remover stand ${stand.numero}`}
                                            className="text-[#9FB0CF] hover:text-white w-7 h-7 rounded-lg hover:bg-white/10">✕</button>
                                    </div>

                                    {podeInteiro && (
                                        <div className="mt-3 grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#091B3B]/60 border border-[#C8CEDA]/20 text-xs font-semibold">
                                            <button type="button" onClick={() => set(stand.id, 'inteiro')}
                                                className={`py-2 rounded-lg ${!parcial ? 'bg-[#D9B26A] text-[#091B3B]' : 'text-[#C8CEDA] hover:bg-white/10'}`}>
                                                Stand inteiro
                                            </button>
                                            <button type="button" onClick={() => set(stand.id, { partes: [], orientacao: 'vertical' })}
                                                className={`py-2 rounded-lg ${parcial ? 'bg-[#D9B26A] text-[#091B3B]' : 'text-[#C8CEDA] hover:bg-white/10'}`}>
                                                Usar apenas parcial
                                            </button>
                                        </div>
                                    )}

                                    {parcial && (
                                        <>
                                            <p className="mt-3 mb-1.5 text-[11px] font-bold tracking-[.12em] uppercase text-[#C8CEDA]">Divisão do stand</p>
                                            {travada ? (
                                                <p className="text-xs text-[#C8CEDA] rounded-xl bg-white/[.05] px-3 py-2">
                                                    <b className="text-white">{orientacaoNomes[ori]}</b> · já definida por quem comprou a primeira parte.
                                                </p>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#091B3B]/60 border border-[#C8CEDA]/20 text-xs font-semibold" role="group" aria-label="Orientação da divisão">
                                                    {(['vertical', 'horizontal'] as Orientacao[]).map(o => (
                                                        <button key={o} type="button" aria-pressed={ori === o} onClick={() => setOrientacao(stand, o)}
                                                            className={`py-2 rounded-lg flex items-center justify-center gap-2 ${ori === o ? 'bg-[#D9B26A] text-[#091B3B]' : 'text-[#C8CEDA] hover:bg-white/10'}`}>
                                                            <i aria-hidden className={`inline-flex w-4 h-4 rounded-[3px] border border-current overflow-hidden ${o === 'horizontal' ? 'flex-col' : ''}`}>
                                                                <i className="flex-1" /><i className={`flex-1 ${o === 'horizontal' ? 'border-y' : 'border-x'} border-current`} /><i className="flex-1" />
                                                            </i>
                                                            {o === 'vertical' ? 'Vertical' : 'Horizontal'}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Desenho do stand com as partes na orientação escolhida */}
                                            <div className={`mt-2.5 grid gap-1.5 ${ori === 'horizontal' ? 'grid-rows-3 max-w-[220px] mx-auto' : 'grid-cols-3'}`}
                                                role="group" aria-label={`Partes do stand ${stand.numero}`}>
                                                {PARTES.map(p => {
                                                    const livre = livres.includes(p);
                                                    const on = parcial.partes.includes(p);
                                                    const st = stand.partes?.[p].status ?? stand.status;
                                                    return (
                                                        <button key={p} type="button" disabled={!livre} aria-pressed={on}
                                                            onClick={() => togglePart(stand, p)}
                                                            className={`rounded-xl border transition-colors ${ori === 'horizontal' ? 'py-1.5 px-3 flex items-center justify-between' : 'py-2.5 text-center'} ${on
                                                                ? 'bg-[#D9B26A] border-[#D9B26A] text-[#091B3B]'
                                                                : livre ? 'bg-[#D7E5FA] border-[#5279AE] text-[#0F2850] hover:bg-[#B5CFF4]' : 'cursor-not-allowed border-transparent text-white'}`}
                                                            style={!livre ? { background: standStatusColors[st] } : undefined}>
                                                            <b className="block font-display text-2xl leading-none">{p}</b>
                                                            <span className="block text-[10px] font-semibold mt-0.5">
                                                                {parteNomes[ori][p]} · {on ? 'Escolhida' : livre ? 'Livre' : standStatusLabels[st]}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <p className="text-[11px] text-[#9FB0CF] mt-2">
                                                {parcial.partes.length === 0
                                                    ? 'Escolha ao menos uma parte.'
                                                    : `Parte${parcial.partes.length > 1 ? 's' : ''} ${parcial.partes.join(', ')} (${parcial.partes.length}/3 do stand).`}
                                            </p>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                    <form onSubmit={reserve} className="mt-2">
                        <label htmlFor="empresa" className="block text-xs font-bold tracking-[.14em] uppercase text-[#C8CEDA] mt-4 mb-2">Empresa</label>
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
                            disabled={saving || !empresa.trim() || incompleto}
                            className="w-full mt-3.5 py-3.5 rounded-xl font-semibold tracking-wide text-white border border-[#D9B26A]/85 bg-gradient-to-b from-[#2856AA] to-[#16376A] hover:from-[#3366BE] hover:to-[#1b4a8f] shadow-[0_0_40px_-14px_rgba(80,140,240,.8)] disabled:opacity-45 disabled:cursor-default transition-colors"
                        >
                            {saving ? 'Reservando…' : itens.length > 1 ? `Reservar ${itens.length} stands` : 'Reservar'}
                        </button>
                        <p className="text-xs text-[#9FB0CF] mt-3">A reserva fica pendente até a equipe T3 confirmar o pagamento.</p>
                    </form>
                </>
            )}
        </section>
    );
}

function InfoOcupado({ stand }: { stand: Stand }) {
    return (
        <div className="mb-5 rounded-2xl border border-[#C8CEDA]/25 bg-white/[.04] p-4">
            <Eyebrow>{sectorName(stand.numero)}</Eyebrow>
            <p className="font-display text-[34px] leading-none mt-2">Stand {stand.numero}</p>
            {stand.partes ? (
                <ul className="mt-3 space-y-1 text-sm">
                    {PARTES.map(p => (
                        <li key={p} className="flex justify-between gap-3">
                            <span className="text-[#C8CEDA]">Parte {p} <span className="text-[#9FB0CF] text-xs">({parteNomes[orientacaoDe(stand)][p]})</span></span>
                            <span style={{ color: standStatusAccent[stand.partes![p].status] }} className="font-semibold text-right">
                                {standStatusLabels[stand.partes![p].status]}{stand.partes![p].empresa ? ` · ${stand.partes![p].empresa}` : ''}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm mt-2" style={{ color: standStatusAccent[stand.status] }}>
                    {standStatusLabels[stand.status]}{stand.empresa ? ` · ${stand.empresa}` : ''}
                </p>
            )}
            <p className="text-xs text-[#9FB0CF] mt-2">Este stand não tem parte livre. Escolha outro na planta.</p>
        </div>
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
