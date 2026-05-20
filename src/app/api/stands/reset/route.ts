import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { standPositions } from '@/data/mapLayout';

export async function POST() {
    try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        // Tenta usar service_role, senão usa anon
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

        if (!url || !key) {
            return NextResponse.json({ error: 'Supabase não configurado', success: false }, { status: 500 });
        }

        const supabase = createClient(url, key);
        const results: string[] = [];

        // 1. Buscar stands existentes
        const { data: existing } = await supabase
            .from('stands')
            .select('numero, id')
            .order('numero');

        const existingMap = new Map((existing || []).map(s => [s.numero, s.id]));

        // 2. Para cada stand no layout, inserir se não existe
        const layoutNumeros = standPositions.map(p => p.numero);
        const missingNumeros = layoutNumeros.filter(n => !existingMap.has(n));

        if (missingNumeros.length > 0) {
            const toInsert = missingNumeros.map(n => ({
                numero: n,
                status: 'disponivel',
                empresa: null,
                tipo: 'prata',
            }));

            const { data: inserted, error: insertErr } = await supabase
                .from('stands')
                .insert(toInsert)
                .select();

            if (insertErr) {
                results.push(`Erro ao inserir: ${insertErr.message}`);
            } else {
                results.push(`${inserted?.length || 0} stands inseridos (${missingNumeros.join(', ')})`);
            }
        }

        // 3. Atualizar todos os existentes para disponivel + prata
        const { error: updateErr } = await supabase
            .from('stands')
            .update({ status: 'disponivel', empresa: null, tipo: 'prata' })
            .gte('numero', 1);

        if (updateErr) {
            results.push(`Erro ao atualizar: ${updateErr.message}`);
        } else {
            results.push('Todos os stands existentes atualizados para disponivel/prata');
        }

        // 4. Remover stand -1 se existir
        if (existingMap.has(-1)) {
            const { error: delErr } = await supabase
                .from('stands')
                .delete()
                .eq('numero', -1);

            if (delErr) {
                results.push(`Erro ao remover stand -1: ${delErr.message}`);
            } else {
                results.push('Stand -1 removido');
            }
        }

        // 5. Contar o total final
        const { count } = await supabase
            .from('stands')
            .select('*', { count: 'exact', head: true })
            .gte('numero', 1);

        return NextResponse.json({
            success: true,
            totalStands: count,
            actions: results,
        });
    } catch (e: any) {
        console.error('Reset error:', e);
        return NextResponse.json({ error: e.message || 'Erro interno', success: false }, { status: 500 });
    }
}
