import { Stand, StandType } from '@/types/stand';

export interface StandPosition {
    numero: number;
    tipo: StandType;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SpecialArea {
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    textColor?: string;
    fontSize?: number;
    borderRadius?: number;
}

export interface Corridor {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface MapAnnotation {
    type: 'text' | 'arrow' | 'entrance';
    label: string;
    x: number;
    y: number;
    rotation?: number;
    fontSize?: number;
    color?: string;
}

// ============================================
// CONFIGURAÇÕES DO GRID VETORIAL
// Matriz de 16 linhas × 12 colunas baseada em mapa_t3.html
// ============================================

export const SVG_W = 880;
export const SVG_H = 1220;

const GRID_START_X = 40;
const GRID_START_Y = 60;
const ROW_HEIGHT = 70;

const colWidths = [80, 40, 80, 80, 40, 80, 80, 40, 80, 80, 40, 80];

const getColX = (colIndex: number) => {
    let x = GRID_START_X;
    for (let i = 0; i < colIndex; i++) {
        x += colWidths[i];
    }
    return x;
};

const getRowY = (rowIndex: number) => {
    return GRID_START_Y + rowIndex * ROW_HEIGHT;
};

// ============================================
// REPRESENTAÇÃO DA MATRIZ DO HTML ORIGINAL
// ============================================
interface RawCell {
    t: 'stand' | 'bleach' | 'aisle' | 'bath';
    n?: number;
    s?: string;
}

const S = (n: number): RawCell => ({ t: 'stand', n });
const B = (n: number): RawCell => ({ t: 'bleach', n });
const A = (s = ''): RawCell => ({ t: 'aisle', s });
const W = (): RawCell => ({ t: 'bath' });

const LAYOUT: RawCell[][] = [
    // Linha 0 — TOPO: tira 43-46 conectada ao mapa
    [ S(1),  A(),  S(15), S(38), A(),  S(43), S(44), A(), S(45), S(46), A(), B(114)],

    // Linha 1 — corredor abaixo da tira 43-46
    [ S(2),  A('↓'),S(16),S(37),A('↑'),A('→'),A('→'),A('→'),A('→'),A('→'),A('↑'),B(113)],

    // Linhas 2-11 — corpo principal
    [ S(3),  A(),  S(17), S(36), A(),  S(47), S(72), A(), S(87), S(88), A(), B(112)],
    [ S(4),  A(),  S(18), S(35), A('↑'),S(48),S(71),A('↓'),S(86), S(89), A(), B(111)],
    [ S(5),  A('↓'),S(19),S(34), A(),  S(49), S(70), A(), S(85), S(90), A('↑'),B(110)],
    [ S(6),  A(),  S(20), S(33), A(),  S(50), S(69), A(), S(84), S(91), A(), B(109)],
    [ S(7),  A(),  S(21), S(32), A('↑'),S(51),S(68), A(), S(83), S(92), A(), B(108)],
    [ S(8),  A('↓'),S(22),S(31), A(),  S(52), S(67), A(), S(82), S(93), A('↑'),B(107)],
    [ S(9),  A(),  S(23), S(30), A('↑'),S(53),S(66), A(), S(81), S(94), A(), B(106)],
    [S(10),  A('↓'),S(24),S(29), A(),  S(54), S(65),A('↓'),S(80), S(95), A(), B(105)],
    [S(11),  A('↓'),S(25),S(28), A(),  S(55), S(64), A(), S(79), S(96), A(), B(104)],
    [S(12),  A(),  S(26), S(27), A('↑'),S(56),S(63), A(), S(78), S(97), A('↑'),B(103)],

    // Linhas 12-13 — parte inferior do corpo
    [S(13),  A(),   A(),  A(),  A(),  S(57), S(62), A(), S(77), S(98), A(), B(102)],
    [S(14),  A('→'),A(),  A(),  A('↑'),S(58),S(61),A('→'),S(76), S(99), A('↑'),B(101)],

    // Linha 14 — cauda do bloco central
    [ A(),   A(),   A(),  A(),  A('↑'),S(59), S(60),A('→'),A(),  A(),  A('↑'),A()  ],

    // Linha 15 — tira inferior (sanitários + stands especiais)
    [ W(),  S(39), S(40),S(41),S(42), W(),  W(),  S(73), S(74),S(75),S(100), W() ],
];

// ============================================
// CONSTRUÇÃO DINÂMICA DOS ARRAYS DO MAPA
// ============================================

export const standPositions: StandPosition[] = [];
export const specialAreas: SpecialArea[] = [];
export const corridors: Corridor[] = [];
export const annotations: MapAnnotation[] = [];

// Função auxiliar para determinar o tipo padrão do stand para o mockup
const getTipoDefault = (n: number): StandType => {
    if (n >= 101 && n <= 114) return 'bronze'; // arquibancadas
    if (n >= 1 && n <= 10) return 'ouro';
    if (n === 11 || n === 12 || n === 44 || n === 58 || n === 59 || n === 60 || n === 61 || n === 62 || n === 63 || n === 64 || n === 31 || n === 32 || n === 73 || n === 74 || n === 75) return 'ouro';
    if (n >= 76 && n <= 84) return 'master';
    if (n >= 85 && n <= 92) return 'prata';
    if (n >= 15 && n <= 25) return 'bronze';
    if (n >= 93 && n <= 99) return 'bronze';
    if (n >= 26 && n <= 30) return 'prata';
    return 'prata';
};

LAYOUT.forEach((row, rowIndex) => {
    const y = getRowY(rowIndex);
    const height = ROW_HEIGHT;

    row.forEach((cell, colIndex) => {
        const x = getColX(colIndex);
        const width = colWidths[colIndex];

        if (cell.t === 'stand') {
            standPositions.push({
                numero: cell.n!,
                tipo: getTipoDefault(cell.n!),
                x: x + 3,
                y: y + 3,
                width: width - 6,
                height: height - 6,
            });
        } else if (cell.t === 'bleach') {
            standPositions.push({
                numero: cell.n!,
                tipo: 'bronze', // styled specially as bleach
                x: x + 3,
                y: y + 3,
                width: width - 6,
                height: height - 6,
            });
        } else if (cell.t === 'bath') {
            specialAreas.push({
                id: `bath-${rowIndex}-${colIndex}`,
                label: 'W.C.',
                x: x + 3,
                y: y + 3,
                width: width - 6,
                height: height - 6,
                color: '#475569',
                textColor: '#94a3b8',
                fontSize: 11,
                borderRadius: 4,
            });
        } else if (cell.t === 'aisle') {
            // Adiciona o corredor
            corridors.push({
                x: x + 1,
                y: y + 1,
                width: width - 2,
                height: height - 2,
            });

            // Se tiver seta de fluxo, adiciona como anotação
            if (cell.s) {
                annotations.push({
                    type: 'arrow',
                    label: cell.s,
                    x: x + width / 2,
                    y: y + height / 2,
                    fontSize: 16,
                    color: '#3b82f6',
                });
            }
        }
    });
});

// Adicionar anotações estáticas dos portões e fluxos principais
annotations.push(
    { type: 'entrance', label: '↩ Entrada', x: 40, y: 35, fontSize: 18, color: '#60a5fa' },
    { type: 'text', label: 'Portão Principal ↪', x: GRID_START_X + 800 - 40, y: 35, fontSize: 18, color: '#60a5fa' },
    { type: 'entrance', label: '↩ Portão Alternativo', x: 40, y: GRID_START_Y + 16 * ROW_HEIGHT + 30, fontSize: 16, color: '#60a5fa' },
    { type: 'text', label: 'STAND 3m · RUA 3m', x: GRID_START_X + 800 - 40, y: GRID_START_Y + 16 * ROW_HEIGHT + 30, fontSize: 12, color: '#94a3b8' }
);

// Adicionar a área especial da Arquibancada à direita
specialAreas.push({
    id: 'arquibancada-label-area',
    label: '',
    x: getColX(11) + colWidths[11] + 10,
    y: GRID_START_Y,
    width: 25,
    height: 14 * ROW_HEIGHT,
    color: '#ef4444',
    borderRadius: 4,
});

// ============================================
// GERADOR DE MOCK DATA
// ============================================
export function generateMockStands(): Stand[] {
    const statuses: Stand['status'][] = ['disponivel', 'reservado', 'vendido'];
    const empresas = [
        'Tech Solutions', 'Digital Wave', 'InnovateTech', 'Smart Systems',
        'DataFlow', 'CloudPeak', 'NetBridge', 'CodeForge',
        'CyberCore', 'PixelHub', 'LogiTech Pro', 'MegaByte',
    ];

    return standPositions.map((pos, i) => {
        // Arquibancadas começam 80% disponíveis por padrão
        const isBleach = pos.numero >= 101;
        const randomStatus = isBleach 
            ? (Math.random() > 0.8 ? 'vendido' : 'disponivel')
            : statuses[Math.floor(Math.random() * 3)];

        return {
            id: `stand-${pos.numero}`,
            numero: pos.numero,
            status: randomStatus,
            empresa: randomStatus === 'vendido' ? empresas[i % empresas.length] :
                randomStatus === 'reservado' ? empresas[(i + 3) % empresas.length] : null,
            tipo: pos.tipo,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    });
}
