'use client';

import React, { useState, useEffect } from 'react';
import { Orientacao, Stand, StandPartes, StandStatus, StandType } from '@/types/stand';
import { PARTES, orientacaoNomes, parteNomes, partesVazias, updatePartes } from '@/utils/partes';
import { standStatusAccent, standStatusLabels, standTypeLabels } from '@/utils/standColors';

interface StandModalProps {
    stand: Stand | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, updates: Partial<Stand>) => Promise<{ success: boolean; error?: string }>;
    isAdmin?: boolean;
    existingNumeros?: number[];   // lista de números em uso (para validar edição)
}

export default function StandModal({ stand, isOpen, onClose, onSave, isAdmin = false, existingNumeros = [] }: StandModalProps) {
    const [status, setStatus] = useState<StandStatus>('disponivel');
    const [empresa, setEmpresa] = useState('');
    const [tipo, setTipo] = useState<StandType>('prata');
    const [numero, setNumero] = useState<number>(0);
    const [numeroInput, setNumeroInput] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [numeroError, setNumeroError] = useState('');
    const [partes, setPartes] = useState<StandPartes | null>(null);

    useEffect(() => {
        if (stand) {
            setStatus(stand.status);
            setEmpresa(stand.empresa || '');
            setTipo(stand.tipo);
            setNumero(stand.numero);
            setNumeroInput(String(stand.numero));
            setNumeroError('');
            setPartes(stand.partes ? structuredClone(stand.partes) : null);
        }
    }, [stand]);

    if (!isOpen || !stand) return null;

    const handleNumeroChange = (val: string) => {
        setNumeroInput(val);
        const n = parseInt(val, 10);
        if (isNaN(n) || n < 1) {
            setNumeroError('Número inválido');
        } else if (n !== stand.numero && existingNumeros.includes(n)) {
            setNumeroError(`Stand ${n} já existe no mapa`);
        } else {
            setNumeroError('');
            setNumero(n);
        }
    };

    const handleSave = async () => {
        if (!empresa.trim() && !isAdmin) {
            alert('Por favor, informe o nome da sua empresa para reservar.');
            return;
        }
        if (isAdmin && numeroError) {
            alert(numeroError);
            return;
        }

        setSaving(true);
        const finalStatus = isAdmin ? status : 'reservado';
        const base = isAdmin && partes
            ? updatePartes(partes)
            : { status: finalStatus, empresa: empresa || null, partes: null };
        const result = await onSave(stand.id, { ...base, tipo, numero });
        setSaving(false);

        if (result.success) {
            onClose();
        } else {
            const msg = result.error || 'Erro desconhecido';
            const isRlsError = msg.includes('permission') || msg.includes('policy') || msg.includes('RLS') || msg.includes('violates');
            alert(isRlsError
                ? '❌ Sem permissão para salvar.\n\nPeça ao administrador para executar o setup-rls.sql no painel Supabase.'
                : `❌ Falha ao salvar: ${msg}`
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#0F2850] border border-[#C8CEDA]/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div
                    className="px-6 py-4 border-b border-[#C8CEDA]/25 flex items-center justify-between"
                    style={{ borderTopColor: standStatusAccent[stand.status], borderTopWidth: 3 }}
                >
                    <div>
                        <h2 className="font-display text-4xl text-white">
                            Stand {stand.numero}
                        </h2>
                        <p className="text-sm text-[#9FB0CF] mt-0.5">
                            Tipo: {standTypeLabels[stand.tipo]}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#9FB0CF] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[.07]"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Status indicator */}
                    <div className="flex items-center gap-3 p-3 bg-white/[.06] rounded-xl">
                        <div
                            className="w-3 h-3 rounded-full shadow-lg"
                            style={{ backgroundColor: standStatusAccent[status] }}
                        />
                        <span className="text-sm font-medium text-[#C8CEDA]">
                            Status atual: <span className="font-bold text-white">{partes ? 'Em terços (veja abaixo)' : standStatusLabels[status]}</span>
                        </span>
                    </div>

                    {isAdmin ? (
                        <>
                            {/* Número do Stand */}
                            <div>
                                <label className="block text-sm font-medium text-[#C8CEDA] mb-2 flex items-center gap-2">
                                    Número do Stand
                                    {numero !== stand.numero && !numeroError && (
                                        <span className="text-xs text-green-400 font-normal">← modificado</span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    value={numeroInput}
                                    onChange={(e) => handleNumeroChange(e.target.value)}
                                    min={1}
                                    className={`w-full bg-white/[.07] border rounded-xl px-4 py-3 text-white focus:ring-2 focus:border-transparent transition-all outline-none ${
                                        numeroError
                                            ? 'border-red-500 focus:ring-red-500'
                                            : numero !== stand.numero
                                            ? 'border-green-500 focus:ring-green-500'
                                            : 'border-[#C8CEDA]/35 focus:ring-[#D9B26A]'
                                    }`}
                                />
                                {numeroError && (
                                    <p className="text-red-400 text-xs mt-1">⚠ {numeroError}</p>
                                )}
                                {!numeroError && numero !== stand.numero && (
                                    <p className="text-green-400 text-xs mt-1">Stand será renumerado de {stand.numero} → {numero}</p>
                                )}
                            </div>

                            {/* Divisão em terços */}
                            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[.06] cursor-pointer">
                                <input type="checkbox" checked={!!partes} className="w-4 h-4 accent-[#D9B26A]"
                                    onChange={(e) => setPartes(e.target.checked
                                        ? (() => { const p = partesVazias(); if (status !== 'disponivel') PARTES.forEach(k => { p[k] = { status, empresa: empresa || null }; }); return p; })()
                                        : null)} />
                                <span className="text-sm text-white font-semibold">Stand dividido em terços (A | B | C)</span>
                            </label>

                            {partes && (
                                <div className="space-y-2.5">
                                    <select value={partes.orientacao ?? 'vertical'}
                                        onChange={(e) => setPartes({ ...partes, orientacao: e.target.value as Orientacao })}
                                        className="w-full bg-white/[.07] border border-[#C8CEDA]/35 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:ring-2 focus:ring-[#D9B26A]">
                                        {(['vertical', 'horizontal'] as Orientacao[]).map(o => (
                                            <option key={o} className="text-[#0F2850]" value={o}>{orientacaoNomes[o]}</option>
                                        ))}
                                    </select>
                                    {PARTES.map(k => (
                                        <div key={k} className="grid grid-cols-[34px_1fr_1.3fr] gap-2 items-center">
                                            <b className="font-display text-2xl text-[#D9B26A] text-center">{k}</b>
                                            <select value={partes[k].status}
                                                onChange={(e) => setPartes({ ...partes, [k]: { ...partes[k], status: e.target.value as StandStatus, empresa: e.target.value === 'disponivel' ? null : partes[k].empresa } })}
                                                className="bg-white/[.07] border border-[#C8CEDA]/35 rounded-xl px-2 py-2.5 text-white text-sm outline-none focus:ring-2 focus:ring-[#D9B26A]">
                                                <option className="text-[#0F2850]" value="disponivel">Disponível</option>
                                                <option className="text-[#0F2850]" value="reservado">Reservado</option>
                                                <option className="text-[#0F2850]" value="vendido">Vendido (pago)</option>
                                            </select>
                                            <input value={partes[k].empresa ?? ''} placeholder="Empresa"
                                                onChange={(e) => setPartes({ ...partes, [k]: { ...partes[k], empresa: e.target.value || null } })}
                                                className="bg-white/[.07] border border-[#C8CEDA]/35 rounded-xl px-3 py-2.5 text-white text-sm placeholder-[#8DA0C4] outline-none focus:ring-2 focus:ring-[#D9B26A]" />
                                        </div>
                                    ))}
                                    <p className="text-xs text-[#9FB0CF]">{PARTES.map(k => `${k} = ${parteNomes[partes.orientacao ?? 'vertical'][k]}`).join(' · ')}</p>
                                </div>
                            )}

                            {!partes && (<>
                            {/* Status select */}
                            <div>
                                <label className="block text-sm font-medium text-[#C8CEDA] mb-2">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as StandStatus)}
                                    className="w-full bg-white/[.07] border border-[#C8CEDA]/35 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#D9B26A] focus:border-transparent transition-all outline-none"
                                >
                                    <option className="text-[#0F2850]" value="disponivel">Disponível</option>
                                    <option className="text-[#0F2850]" value="reservado">Reservado</option>
                                    <option className="text-[#0F2850]" value="vendido">Vendido (pago)</option>
                                </select>
                            </div>

                            {/* Empresa */}
                            <div>
                                <label className="block text-sm font-medium text-[#C8CEDA] mb-2">
                                    Empresa
                                </label>
                                <input
                                    type="text"
                                    value={empresa}
                                    onChange={(e) => setEmpresa(e.target.value)}
                                    placeholder="Nome da empresa..."
                                    className="w-full bg-white/[.07] border border-[#C8CEDA]/35 rounded-xl px-4 py-3 text-white placeholder-[#8DA0C4] focus:ring-2 focus:ring-[#D9B26A] focus:border-transparent transition-all outline-none"
                                />
                            </div>

                            </>)}

                            {/* Tipo */}
                            <div>
                                <label className="block text-sm font-medium text-[#C8CEDA] mb-2">
                                    Tipo do Stand
                                </label>
                                <select
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value as StandType)}
                                    className="w-full bg-white/[.07] border border-[#C8CEDA]/35 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#D9B26A] focus:border-transparent transition-all outline-none"
                                >
                                    <option className="text-[#0F2850]" value="ouro">Ouro</option>
                                    <option className="text-[#0F2850]" value="prata">Prata</option>
                                    <option className="text-[#0F2850]" value="outro">Outro</option>
                                    <option className="text-[#0F2850]" value="bronze">Bronze</option>
                                    <option className="text-[#0F2850]" value="master">Master</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            {stand.status === 'disponivel' ? (
                                <div>
                                    <label className="block text-sm font-medium text-[#C8CEDA] mb-2">
                                        Nome da sua Empresa
                                    </label>
                                    <input
                                        type="text"
                                        value={empresa}
                                        onChange={(e) => setEmpresa(e.target.value)}
                                        placeholder="Digite para reservar..."
                                        className="w-full bg-white/[.07] border border-[#C8CEDA]/35 rounded-xl px-4 py-3 text-white placeholder-[#8DA0C4] focus:ring-2 focus:ring-[#D9B26A] focus:border-transparent transition-all outline-none"
                                    />
                                    <p className="text-[10px] text-[#8DA0C4] mt-2 italic">
                                        * Ao reservar, sua empresa será listada neste stand até a confirmação de venda.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {stand.empresa && (
                                        <div className="p-3 bg-white/[.06] rounded-xl">
                                            <p className="text-xs text-[#9FB0CF] uppercase tracking-wider mb-1">Empresa</p>
                                            <p className="text-white font-medium">{stand.empresa}</p>
                                        </div>
                                    )}
                                    <div className="p-3 bg-white/[.06] rounded-xl">
                                        <p className="text-xs text-[#9FB0CF] uppercase tracking-wider mb-1">Tipo</p>
                                        <p className="text-white font-medium">{standTypeLabels[stand.tipo]}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {(isAdmin || stand.status === 'disponivel') && (
                    <div className="px-6 py-4 border-t border-[#C8CEDA]/25 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[.07] text-[#C8CEDA] hover:bg-white/[.14] hover:text-white transition-all font-medium"
                        >
                            {isAdmin ? 'Cancelar' : 'Fechar'}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#2856AA] to-[#16376A] border border-[#D9B26A]/85 text-white hover:from-[#3366BE] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed "
                        >
                            {saving ? 'Salvando...' : isAdmin ? 'Salvar' : 'Reservar Stand'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
