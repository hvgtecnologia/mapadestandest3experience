import { StandStatus, StandType } from '@/types/stand';

// ═══════════════════════════════════════════
// CORES POR TIPO (novo mapa evento v10)
//   prata  → vermelho  (#c84a4a)   cols 1-2
//   outro  → amarelo   (#e8c127)   cols 3-4 + topo
//   bronze → marrom    (#b97b3c)   cols 5-6
//   ouro   → dourado   (#f9bf1b)   legado
//   master → magenta   (#d14d8f)   legado
// ═══════════════════════════════════════════
export const standTypeColors: Record<StandType, string> = {
    prata:  '#94a3b8',   // prata/prateado
    outro:  '#e8c127',   // amarelo (OUTRO)
    bronze: '#cd7f32',   // bronze
    ouro:   '#f9bf1b',   // dourado
    master: '#d14d8f',   // magenta
    bar:    '#0e7490',
    palco:  '#1e293b',
    area:   '#059669',
};

export const standTypeBorderColors: Record<StandType, string> = {
    prata:  '#64748b',
    outro:  '#ceaa1a',
    bronze: '#a0621e',
    ouro:   '#d4960e',
    master: '#a83c70',
    bar:    '#0c5f7a',
    palco:  '#0f172a',
    area:   '#047857',
};

// ═══════════════════════════════════════════
// CORES DE STATUS (indicador de ocupação)
// ═══════════════════════════════════════════
export const standStatusColors: Record<StandStatus, string> = {
    disponivel: '#22c55e',
    reservado:  '#eab308',
    vendido:    '#ef4444',
};

export const standStatusLabels: Record<StandStatus, string> = {
    disponivel: 'Disponível',
    reservado:  'Reservado',
    vendido:    'Vendido',
};

export const standTypeLabels: Record<StandType, string> = {
    prata:  'Prata',
    outro:  'Outro',
    bronze: 'Bronze',
    ouro:   'Ouro',
    master: 'Master',
    bar:    'Bar',
    palco:  'Palco',
    area:   'Área',
};
