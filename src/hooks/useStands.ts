'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabaseClient';
import { Stand, StandStatus } from '@/types/stand';
import { generateMockStands, standPositions } from '@/data/mapLayout';

const USE_MOCK = false;

export function useStands() {
    const [stands, setStands] = useState<Stand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getStands = useCallback(async () => {
        if (USE_MOCK) {
            // Use mock data if Supabase is not configured
            const stored = localStorage.getItem('mock-stands-v2');
            if (stored) {
                setStands(JSON.parse(stored));
            } else {
                const mock = generateMockStands();
                localStorage.setItem('mock-stands-v2', JSON.stringify(mock));
                setStands(mock);
            }
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('stands')
                .select('*')
                .order('numero', { ascending: true });

            if (fetchError) throw fetchError;
            setStands(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar stands');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStand = useCallback(async (id: string, updates: Partial<Stand>): Promise<{ success: boolean; error?: string }> => {
        if (USE_MOCK) {
            setStands(prev => {
                const updated = prev.map(s =>
                    s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
                );
                localStorage.setItem('mock-stands-v2', JSON.stringify(updated));
                return updated;
            });
            return { success: true };
        }

        try {
            const res = await fetch('/api/stands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, updates }),
            });
            
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Erro ao atualizar stand via API');
            }

            // Atualiza estado local imediatamente
            setStands(prev =>
                prev.map(s =>
                    s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
                )
            );
            return { success: true };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao atualizar stand';
            setError(message);
            return { success: false, error: message };
        }
    }, []);

    const updateStandStatus = useCallback(async (id: string, status: StandStatus) => {
        return updateStand(id, { status });
    }, [updateStand]);

    const updateStandCompany = useCallback(async (id: string, empresa: string) => {
        return updateStand(id, { empresa });
    }, [updateStand]);

    // Subscribe to realtime changes
    useEffect(() => {
        getStands();

        if (USE_MOCK) return;

        const channel = supabase
            .channel('stands-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'stands' },
                (payload) => {
                    if (payload.eventType === 'UPDATE') {
                        setStands(prev =>
                            prev.map(s => s.id === (payload.new as Stand).id ? payload.new as Stand : s)
                        );
                    } else if (payload.eventType === 'INSERT') {
                        setStands(prev => [...prev, payload.new as Stand]);
                    } else if (payload.eventType === 'DELETE') {
                        setStands(prev => prev.filter(s => s.id !== (payload.old as Stand).id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [getStands]);

    // Filter only stands that have a position in the layout (visible)
    const visibleStands = stands.filter(s => standPositions.some(p => p.numero === s.numero));

    // Stats
    const stats = {
        total: visibleStands.length,
        disponivel: visibleStands.filter(s => s.status === 'disponivel').length,
        reservado: visibleStands.filter(s => s.status === 'reservado').length,
        vendido: visibleStands.filter(s => s.status === 'vendido').length,
    };

    return {
        stands: visibleStands,
        loading,
        error,
        stats,
        updateStand,
        updateStandStatus,
        updateStandCompany,
        refetch: getStands,
    };
}
