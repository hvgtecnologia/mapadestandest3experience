import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usa o cliente público (anon key) — requer policy RLS UPDATE na tabela stands
function getSupabasePublic() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return createClient(url, key);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, updates } = body;

        if (!id || typeof id !== 'string') {
            return NextResponse.json({ error: 'ID inválido', success: false }, { status: 400 });
        }

        const supabase = getSupabasePublic();
        const { data, error } = await supabase
            .from('stands')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('DB Update Error:', error);
            return NextResponse.json({ error: error.message, success: false }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (e: any) {
        console.error('API / stands / route Error:', e);
        return NextResponse.json({ error: e.message || 'Erro interno do servidor', success: false }, { status: 500 });
    }
}
