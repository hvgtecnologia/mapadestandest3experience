import { Escolha, EscolhaParcial, Orientacao, ParteId, Stand, StandPartes, StandStatus } from '@/types/stand';

export const PARTES: ParteId[] = ['A', 'B', 'C'];

export const parteNomes: Record<Orientacao, Record<ParteId, string>> = {
    vertical: { A: 'esquerda', B: 'meio', C: 'direita' },
    horizontal: { A: 'em cima', B: 'meio', C: 'embaixo' },
};

export const orientacaoNomes: Record<Orientacao, string> = {
    vertical: 'Vertical (A | B | C lado a lado)',
    horizontal: 'Horizontal (A em cima, C embaixo)',
};

/** Orientação de um stand já dividido (padrão: vertical). */
export const orientacaoDe = (s?: Stand | null): Orientacao => s?.partes?.orientacao ?? 'vertical';

export const isParcial = (e?: Escolha): e is EscolhaParcial => !!e && e !== 'inteiro';

export function partesVazias(orientacao: Orientacao = 'vertical'): StandPartes {
    return {
        orientacao,
        A: { status: 'disponivel', empresa: null },
        B: { status: 'disponivel', empresa: null },
        C: { status: 'disponivel', empresa: null },
    };
}

export const isDividido = (s?: Stand | null): s is Stand & { partes: StandPartes } => !!s?.partes;

/** Status e empresa-resumo de um stand dividido (para filtros, contagem e tabela). */
export function resumoPartes(partes: StandPartes): { status: StandStatus; empresa: string | null } {
    const st = PARTES.map(p => partes[p].status);
    const status: StandStatus = st.includes('disponivel') ? 'disponivel' : st.includes('reservado') ? 'reservado' : 'vendido';
    const nomes = [...new Set(PARTES.map(p => partes[p].empresa).filter((e): e is string => !!e))];
    return { status, empresa: nomes.length ? nomes.join(' / ') : null };
}

/** Terços ainda livres (stand inteiro livre = os três). */
export function partesLivres(s: Stand): ParteId[] {
    if (s.partes) return PARTES.filter(p => s.partes![p].status === 'disponivel');
    return s.status === 'disponivel' ? [...PARTES] : [];
}

/** Monta o update de um stand a partir de novos terços (null = volta a ser inteiro). */
export function updatePartes(partes: StandPartes | null, inteiro?: { status: StandStatus; empresa: string | null }): Partial<Stand> {
    if (!partes) return { partes: null, ...(inteiro ?? { status: 'disponivel', empresa: null }) };
    // Os três terços iguais e com a mesma empresa → guarda como stand inteiro
    const [a, b, c] = PARTES.map(p => partes[p]);
    if (a.status === b.status && b.status === c.status && a.empresa === b.empresa && b.empresa === c.empresa) {
        return { partes: null, status: a.status, empresa: a.empresa };
    }
    return { partes, ...resumoPartes(partes) };
}

/** Rótulo curto de uma escolha: "Stand 10" ou "Stand 10 · A, C". */
export function rotuloEscolha(numero: number, escolha: Escolha) {
    return escolha === 'inteiro'
        ? `Stand ${numero}`
        : `Stand ${numero} · ${escolha.partes.join(', ')} (${escolha.orientacao})`;
}
