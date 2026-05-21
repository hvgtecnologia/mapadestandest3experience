'use client';

import React, { useState, useEffect } from 'react';
import { Stand, StandStatus, StandType } from '@/types/stand';
import { standStatusColors, standStatusLabels, standTypeLabels } from '@/utils/standColors';

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

    useEffect(() => {
        if (stand) {
            setStatus(stand.status);
            setEmpresa(stand.empresa || '');
            setTipo(stand.tipo);
            setNumero(stand.numero);
            setNumeroInput(String(stand.numero));
            setNumeroError('');
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
        const result = await onSave(stand.id, {
            status: finalStatus,
            empresa: empresa || null,
            tipo,
            numero,
        });
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
            <div className="relative bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div
                    className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between"
                    style={{ borderTopColor: standStatusColors[stand.status], borderTopWidth: 3 }}
                >
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Stand {String(stand.numero).padStart(2, '0')}
                        </h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Tipo: {standTypeLabels[stand.tipo]}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Status indicator */}
                    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                        <div
                            className="w-3 h-3 rounded-full shadow-lg"
                            style={{ backgroundColor: standStatusColors[status] }}
                        />
                        <span className="text-sm font-medium text-gray-200">
                            Status atual: <span className="font-bold text-white">{standStatusLabels[status]}</span>
                        </span>
                    </div>

                    {isAdmin ? (
                        <>
                            {/* Número do Stand */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    ✏️ Número do Stand
                                    {numero !== stand.numero && !numeroError && (
                                        <span className="text-xs text-green-400 font-normal">← modificado</span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    value={numeroInput}
                                    onChange={(e) => handleNumeroChange(e.target.value)}
                                    min={1}
                                    className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white focus:ring-2 focus:border-transparent transition-all outline-none ${
                                        numeroError
                                            ? 'border-red-500 focus:ring-red-500'
                                            : numero !== stand.numero
                                            ? 'border-green-500 focus:ring-green-500'
                                            : 'border-gray-600 focus:ring-blue-500'
                                    }`}
                                />
                                {numeroError && (
                                    <p className="text-red-400 text-xs mt-1">⚠ {numeroError}</p>
                                )}
                                {!numeroError && numero !== stand.numero && (
                                    <p className="text-green-400 text-xs mt-1">Stand será renumerado de {stand.numero} → {numero}</p>
                                )}
                            </div>

                            {/* Status select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as StandStatus)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                >
                                    <option value="disponivel">🟢 Disponível</option>
                                    <option value="reservado">🟡 Reservado</option>
                                    <option value="vendido">🔴 Vendido</option>
                                </select>
                            </div>

                            {/* Empresa */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Empresa
                                </label>
                                <input
                                    type="text"
                                    value={empresa}
                                    onChange={(e) => setEmpresa(e.target.value)}
                                    placeholder="Nome da empresa..."
                                    className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                />
                            </div>

                            {/* Tipo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tipo do Stand
                                </label>
                                <select
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value as StandType)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                >
                                    <option value="ouro">🥇 Ouro</option>
                                    <option value="prata">🔴 Prata</option>
                                    <option value="outro">🟡 Outro</option>
                                    <option value="bronze">🟤 Bronze</option>
                                    <option value="master">⭐ Master</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            {stand.status === 'disponivel' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Nome da sua Empresa
                                    </label>
                                    <input
                                        type="text"
                                        value={empresa}
                                        onChange={(e) => setEmpresa(e.target.value)}
                                        placeholder="Digite para reservar..."
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-2 italic">
                                        * Ao reservar, sua empresa será listada neste stand até a confirmação de venda.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {stand.empresa && (
                                        <div className="p-3 bg-gray-800/50 rounded-xl">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Empresa</p>
                                            <p className="text-white font-medium">{stand.empresa}</p>
                                        </div>
                                    )}
                                    <div className="p-3 bg-gray-800/50 rounded-xl">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Tipo</p>
                                        <p className="text-white font-medium">{standTypeLabels[stand.tipo]}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {(isAdmin || stand.status === 'disponivel') && (
                    <div className="px-6 py-4 border-t border-gray-700/50 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-all font-medium"
                        >
                            {isAdmin ? 'Cancelar' : 'Fechar'}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                        >
                            {saving ? 'Salvando...' : isAdmin ? 'Salvar' : 'Reservar Stand'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
