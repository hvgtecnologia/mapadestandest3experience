'use client';

import React, { useState, useMemo } from 'react';
import { useStands } from '@/hooks/useStands';
import StandModal from '@/components/StandModal';
import DashboardStats from '@/components/DashboardStats';
import { Stand, StandStatus, StandType } from '@/types/stand';
import { standStatusColors, standStatusLabels, standTypeLabels } from '@/utils/standColors';
import Link from 'next/link';
import * as XLSX from 'xlsx';

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

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStand(null);
    };

    const exportXLSX = () => {
        const data = filteredStands.map((s) => ({
            'Número': s.numero,
            'Empresa': s.empresa || '',
            'Status': standStatusLabels[s.status] || s.status,
            'Tipo': standTypeLabels[s.tipo] || s.tipo,
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        // Ajustar largura das colunas
        ws['!cols'] = [
            { wch: 8 },   // Número
            { wch: 30 },  // Empresa
            { wch: 14 },  // Status
            { wch: 14 },  // Tipo
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Stands');
        XLSX.writeFile(wb, `stands_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            ← Voltar ao Mapa
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white">
                                ⚙️ Painel Administrativo
                            </h1>
                            <p className="text-sm text-gray-400">Gerencie todos os stands do evento</p>
                        </div>
                    </div>
                    <button
                        onClick={exportXLSX}
                        className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white transition-all text-sm font-medium shadow-lg shadow-green-500/25"
                    >
                        📥 Exportar XLSX
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Stats */}
                <DashboardStats stats={stats} />

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="🔍 Buscar por empresa ou número..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                        />
                    </div>

                    {/* Status filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as StandStatus | 'todos')}
                        className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="todos">Todos os status</option>
                        <option value="disponivel">🟢 Disponível</option>
                        <option value="reservado">🟡 Reservado</option>
                        <option value="vendido">🔴 Vendido</option>
                    </select>

                    {/* Tipo filter */}
                    <select
                        value={filterTipo}
                        onChange={(e) => setFilterTipo(e.target.value as StandType | 'todos')}
                        className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="todos">Todos os tipos</option>
                        <option value="ouro">🥇 Ouro</option>
                        <option value="prata">🥈 Prata</option>
                        <option value="bronze">🥉 Bronze</option>
                        <option value="master">⭐ Master</option>
                    </select>
                </div>

                {/* Results count */}
                <p className="text-sm text-gray-400">
                    Mostrando <span className="text-white font-bold">{filteredStands.length}</span> de {stands.length} stands
                </p>

                {/* Table */}
                <div className="bg-gray-900/50 rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700/50">
                                    <th
                                        className="px-5 py-4 text-left text-gray-400 font-medium cursor-pointer hover:text-white transition-colors"
                                        onClick={() => handleSort('numero')}
                                    >
                                        # {sortField === 'numero' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="px-5 py-4 text-left text-gray-400 font-medium cursor-pointer hover:text-white transition-colors"
                                        onClick={() => handleSort('status')}
                                    >
                                        Status {sortField === 'status' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th
                                        className="px-5 py-4 text-left text-gray-400 font-medium cursor-pointer hover:text-white transition-colors"
                                        onClick={() => handleSort('empresa')}
                                    >
                                        Empresa {sortField === 'empresa' && (sortAsc ? '↑' : '↓')}
                                    </th>
                                    <th className="px-5 py-4 text-left text-gray-400 font-medium">Tipo</th>
                                    <th className="px-5 py-4 text-right text-gray-400 font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStands.map((stand) => (
                                    <tr
                                        key={stand.id}
                                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <span className="font-bold text-white">
                                                {String(stand.numero).padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                                                style={{ backgroundColor: standStatusColors[stand.status] + '33', border: `1px solid ${standStatusColors[stand.status]}55` }}
                                            >
                                                <span
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: standStatusColors[stand.status] }}
                                                />
                                                {standStatusLabels[stand.status]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-300">
                                            {stand.empresa || <span className="text-gray-600 italic">—</span>}
                                        </td>
                                        <td className="px-5 py-3 text-gray-400 capitalize">
                                            {standTypeLabels[stand.tipo]}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <button
                                                onClick={() => handleStandClick(stand)}
                                                className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 hover:text-blue-300 transition-all text-xs font-medium border border-blue-600/30"
                                            >
                                                ✏️ Editar
                                            </button>
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
