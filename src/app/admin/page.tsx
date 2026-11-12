'use client';

import React, { useState, useMemo } from 'react';
import { useStands } from '@/hooks/useStands';
import StandModal from '@/components/StandModal';
import StandMap from '@/components/StandMap';
import DashboardStats from '@/components/DashboardStats';
import { Stand, StandStatus, StandType } from '@/types/stand';
import { standStatusAccent, standStatusLabels, standTypeLabels } from '@/utils/standColors';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { PARTES, updatePartes } from '@/utils/partes';

export default function AdminPage() {
    const { stands, loading, stats, updateStand } = useStands();
    const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<StandStatus | 'todos'>('todos');
    const [filterTipo, setFilterTipo] = useState<StandType | 'todos'>('todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<'numero' | 'status' | 'empresa'>('numero');
    const [sortAsc, setSortAsc] = useState(true);

    const filteredStands = useMemo(() => {
        let result = [...stands];

        if (filterStatus !== 'todos') {
            result = result.filter((s) => s.status === filterStatus);
        }
        if (filterTipo !== 'todos') {
            result = result.filter((s) => s.tipo === filterTipo);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (s) =>
                    s.empresa?.toLowerCase().includes(q) ||
                    String(s.numero).includes(q)
            );
        }

        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'numero') cmp = a.numero - b.numero;
            else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
            else if (sortField === 'empresa') cmp = (a.empresa || '').localeCompare(b.empresa || '');
            return sortAsc ? cmp : -cmp;
        });

        return result;
    }, [stands, filterStatus, filterTipo, searchQuery, sortField, sortAsc]);

    const handleSort = (field: 'numero' | 'status' | 'empresa') => {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(true);
        }
    };

    const handleStandClick = (stand: Stand) => {
        setSelectedStand(stand);
        setIsModalOpen(true);
    };

    // Etapas: disponível → reservado → vendido (pago). Stand dividido: vale para cada terço.
    const temReserva = (s: Stand) => s.partes ? PARTES.some(p => s.partes![p].status === 'reservado') : s.status === 'reservado';
    const temOcupado = (s: Stand) => s.partes ? PARTES.some(p => s.partes![p].status !== 'disponivel') : s.status !== 'disponivel';

    const confirmPayment = (stand: Stand) => {
        if (!stand.partes) return updateStand(stand.id, { status: 'vendido' });
        const partes = structuredClone(stand.partes);
        PARTES.forEach(p => { if (partes[p].status === 'reservado') partes[p].status = 'vendido'; });
        return updateStand(stand.id, updatePartes(partes));
    };
    const releaseStand = (stand: Stand) => {
        if (confirm(`Liberar o stand ${stand.numero} inteiro? Todas as empresas dele serão removidas.`)) {
            updateStand(stand.id, updatePartes(null));
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStand(null);
    };

    const exportXLSX = () => {
        const data = filteredStands.map((s) => ({
            'Número': s.numero,
            'Empresa': s.empresa || '',
            'Terços': s.partes ? `${s.partes.orientacao ?? 'vertical'} — ` + PARTES.map(p => `${p}: ${standStatusLabels[s.partes![p].status]}${s.partes![p].empresa ? ` (${s.partes![p].empresa})` : ''}`).join(' | ') : 'Inteiro',
            'Status': standStatusLabels[s.status] || s.status,
            'Tipo': standTypeLabels[s.tipo] || s.tipo,
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        // Ajustar largura das colunas
        ws['!cols'] = [
            { wch: 8 },   // Número
            { wch: 30 },  // Empresa
            { wch: 60 },  // Terços
            { wch: 14 },  // Status
            { wch: 14 },  // Tipo
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Stands');
        XLSX.writeFile(wb, `stands_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const btn = 'px-4 py-2.5 rounded-xl bg-white/[.07] border border-[#C8CEDA]/35 text-white text-sm font-semibold hover:bg-white/[.14] transition-colors';
    const field = 'bg-white/[.07] border border-[#C8CEDA]/35 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#D9B26A] placeholder:text-[#8DA0C4]';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-[#D9B26A] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-[#D9B26A]/40 bg-[linear-gradient(100deg,#091B3B_22%,rgba(15,40,80,.93)_55%,rgba(9,27,59,.6))]">
                <div className="max-w-[1490px] mx-auto px-4 sm:px-6 py-5 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
                    <img src="/logo-t3-2027.png" alt="T3 Experience 2027" className="w-[200px] h-auto shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 text-xs font-bold tracking-[.32em] uppercase">
                            <span className="w-[7px] h-[7px] rounded-full bg-[#D9B26A]" />
                            Área da equipe
                        </div>
                        <h1 className="font-display text-[clamp(36px,4vw,60px)] leading-[.92] mt-2">
                            Reservas e <em className="not-italic text-[#C8CEDA]">pagamentos.</em>
                        </h1>
                        <div className="flex flex-wrap gap-2.5 mt-3">
                            <Link href="/" className={btn}>← Mapa público</Link>
                            <button onClick={exportXLSX} className={btn}>Exportar planilha</button>
                        </div>
                    </div>
                    <div className="lg:w-[400px]">
                        <DashboardStats stats={stats} />
                    </div>
                </div>
            </header>

            <div className="max-w-[1490px] mx-auto px-3 sm:px-5 py-5 space-y-5">
                <StandMap stands={stands} onStandClick={handleStandClick} selectedStandId={selectedStand?.id} />

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Buscar por empresa ou número"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full ${field}`}
                        />
                    </div>

                    {/* Status filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as StandStatus | 'todos')}
                        className={field}
                    >
                        <option className="text-[#0F2850]" value="todos">Todos os status</option>
                        <option className="text-[#0F2850]" value="disponivel">Disponível</option>
                        <option className="text-[#0F2850]" value="reservado">Reservado</option>
                        <option className="text-[#0F2850]" value="vendido">Vendido (pago)</option>
                    </select>

                    {/* Tipo filter */}
                    <select
                        value={filterTipo}
                        onChange={(e) => setFilterTipo(e.target.value as StandType | 'todos')}
                        className={field}
                    >
                        <option className="text-[#0F2850]" value="todos">Todos os tipos</option>
                        <option className="text-[#0F2850]" value="ouro">Ouro</option>
                        <option className="text-[#0F2850]" value="prata">Prata</option>
                        <option className="text-[#0F2850]" value="outro">Outro</option>
                        <option className="text-[#0F2850]" value="bronze">Bronze</option>
                        <option className="text-[#0F2850]" value="master">Master</option>
                    </select>
                </div>

                {/* Results count */}
                <p className="text-sm text-[#9FB0CF]">
                    Mostrando <span className="text-white font-bold">{filteredStands.length}</span> de {stands.length} stands
                </p>

                {/* Table */}
                <div className="rounded-[26px] border border-[#C8CEDA]/25 bg-[#091B3B]/70 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#C8CEDA]/25">
                                    <th
                                        className="px-5 py-4 text-left text-[#C8CEDA] font-semibold text-xs tracking-[.14em] uppercase cursor-pointer hover:text-white transition-colors"
                                        onClick={() => handleSort('numero')}
                                    >
                                        # {sortField === 'numero' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="px-5 py-4 text-left text-[#C8CEDA] font-semibold text-xs tracking-[.14em] uppercase cursor-pointer hover:text-white transition-colors"
                                        onClick={() => handleSort('status')}
                                    >
                                        Status {sortField === 'status' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="px-5 py-4 text-left text-[#C8CEDA] font-semibold text-xs tracking-[.14em] uppercase cursor-pointer hover:text-white transition-colors"
                                        onClick={() => handleSort('empresa')}
                                    >
                                        Empresa {sortField === 'empresa' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th className="px-5 py-4 text-left text-[#C8CEDA] font-semibold text-xs tracking-[.14em] uppercase">Tipo</th>
                                    <th className="px-5 py-4 text-right text-[#C8CEDA] font-semibold text-xs tracking-[.14em] uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStands.map((stand) => (
                                    <tr
                                        key={stand.id}
                                        className="border-b border-[#C8CEDA]/10 hover:bg-white/[.04] transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <span className="font-bold text-white">
                                                {String(stand.numero).padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span
                                                className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold tracking-[.1em] uppercase"
                                                style={stand.partes ? { color: '#D9B26A', background: '#D9B26A26' } : { color: standStatusAccent[stand.status], background: `${standStatusAccent[stand.status]}26` }}
                                            >
                                                ● {stand.partes ? 'Em terços' : standStatusLabels[stand.status]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-white">
                                            {stand.partes ? (
                                                <div className="space-y-0.5">
                                                    {PARTES.map(p => (
                                                        <div key={p} className="text-xs">
                                                            <b className="text-[#D9B26A] mr-1.5">{p}</b>
                                                            <span style={{ color: standStatusAccent[stand.partes![p].status] }}>{standStatusLabels[stand.partes![p].status]}</span>
                                                            {stand.partes![p].empresa && <span className="text-white"> · {stand.partes![p].empresa}</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (stand.empresa || <span className="text-[#7F93B8]">—</span>)}
                                        </td>
                                        <td className="px-5 py-3 text-[#9FB0CF]">
                                            {standTypeLabels[stand.tipo]}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex justify-end gap-2 whitespace-nowrap">
                                                {temReserva(stand) && (
                                                    <button onClick={() => confirmPayment(stand)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#167348] hover:bg-[#1b8a57] text-white transition-colors">
                                                        Confirmar pagamento
                                                    </button>
                                                )}
                                                {temOcupado(stand) && (
                                                    <button onClick={() => releaseStand(stand)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#FFB4BF]/40 text-[#FFB4BF] hover:bg-[#FFB4BF]/10 transition-colors">
                                                        Liberar
                                                    </button>
                                                )}
                                                <button onClick={() => handleStandClick(stand)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#C8CEDA]/35 text-white hover:bg-white/10 transition-colors">
                                                    Editar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <StandModal
                stand={selectedStand}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={updateStand}
                isAdmin={true}
                existingNumeros={stands.map(s => s.numero)}
            />
        </div>
    );
}
