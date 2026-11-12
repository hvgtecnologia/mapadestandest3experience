import { StandStatus, StandType } from '@/types/stand';

// ═══════════════════════════════════════════
// PALETA T3 EXPERIENCE 2027
//   azul-marinho #091B3B / #0F2850 / #16376A
//   prata        #C8CEDA
//   dourado      #D9B26A
// ═══════════════════════════════════════════
export const brand = {
    navy900: '#091B3B',
    navy800: '#0F2850',
    navy700: '#16376A',
    silver: '#C8CEDA',
    gold: '#D9B26A',
    muted: '#9FB0CF',
};

// Cor do stand DISPONÍVEL por tipo (todos azul-claro; tipos legados mantidos)
export const standTypeColors: Record<StandType, string> = {
    prata:  '#D7E5FA',
    outro:  '#D7E5FA',
    bronze: '#E8D2B8',
    ouro:   '#F5E8CF',
    master: '#EBD3E2',
    bar:    '#CDE7EE',
    palco:  '#1e293b',
    area:   '#CFE9DC',
};

export const standTypeBorderColors: Record<StandType, string> = {
    prata:  '#5279AE',
    outro:  '#5279AE',
    bronze: '#a0621e',
    ouro:   '#D9B26A',
    master: '#a83c70',
    bar:    '#0c5f7a',
    palco:  '#0f172a',
    area:   '#047857',
};

// ═══════════════════════════════════════════
// CORES DE STATUS — o stand inteiro é pintado
//   disponível → azul-claro · reservado → marinho · vendido → verde
// ═══════════════════════════════════════════
export const standStatusColors: Record<StandStatus, string> = {
    disponivel: '#D7E5FA',
    reservado:  '#091B3B',
    vendido:    '#167348',
};

export const standStatusBorderColors: Record<StandStatus, string> = {
    disponivel: '#5279AE',
    reservado:  '#0F2850',
    vendido:    '#0E5735',
};

// Cor de destaque do status em fundo escuro (chips, contadores)
export const standStatusAccent: Record<StandStatus, string> = {
    disponivel: '#8FB8FF',
    reservado:  '#D9B26A',
    vendido:    '#5FD7A0',
};

export const standSelectedColor = '#D9B26A';

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
