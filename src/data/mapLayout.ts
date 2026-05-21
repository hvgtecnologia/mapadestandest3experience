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
    subLabel?: string;
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

// ============================================================
//  MAPA T3 — 97 stands sequenciais (1 a 97)
//
//  Baseado EXATAMENTE no HTML mapa_evento.html (v10):
//  Canvas: 1020 × 920 px
//  Célula:  44 × 44 px  (interna)
//  Bloco:   padding=4, gap=2
//
//  CATEGORIAS (tipo):
//    prata  → vermelho  (#c84a4a)  cols 1-2  (01-30)
//    outro  → amarelo   (#e8c127)  cols 3-4 + topo (31-60 + 91-97)
//    bronze → marrom    (#b97b3c)  cols 5-6  (61-90)
//
//  Blocos (top | left | w | h):
//    block-top  (91-97):   100 | 224 | 328 | 52   (1×7)
//    block-col-1 (01-15):  180 |  32 |  52 | 696  (15×1) PRATA
//    block-col-2 (16-30):  180 | 114 |  52 | 696  (15×1) PRATA
//    block-col-3 (31-45):  180 | 196 |  52 | 696  (15×1) OUTRO
//    lounge:               280 | 288 | 200 | 496
//    block-col-4 (46-60):  180 | 528 |  52 | 696  (15×1) OUTRO
//    block-col-5 (61-75):  180 | 610 |  52 | 696  (15×1) BRONZE
//    block-col-6 (76-90):  180 | 692 |  52 | 696  (15×1) BRONZE
// ============================================================

export const SVG_W = 1020;
export const SVG_H = 920;

// Dimensões da célula (interna, sem padding do bloco)
const CW = 44;   // cell width
const CH = 44;   // cell height
const BP = 4;    // block padding
const CG = 2;    // cell gap

function cellPos(blockLeft: number, blockTop: number, col: number, row: number) {
    return {
        x: blockLeft + BP + col * (CW + CG),
        y: blockTop  + BP + row * (CH + CG),
    };
}

function addStand(
    positions: StandPosition[],
    n: number,
    tipo: StandType,
    blockL: number,
    blockT: number,
    col: number,
    row: number
) {
    const { x, y } = cellPos(blockL, blockT, col, row);
    positions.push({ numero: n, tipo, x, y, width: CW, height: CH });
}

// ============================================================
//  POSIÇÕES DOS STANDS
// ============================================================
export const standPositions: StandPosition[] = [];

// ── TIRA TOPO: 91-97 (OUTRO — amarelo, 1 linha × 7 colunas) ──
// block-top: top=100, left=224, w=328, h=52
const TOP_L = 224, TOP_T = 100;
[91, 92, 93, 94, 95, 96, 97].forEach((n, col) =>
    addStand(standPositions, n, 'outro', TOP_L, TOP_T, col, 0)
);

// ── COL 1: 01-15 (PRATA — vermelho, 15 linhas × 1 coluna) ──
// block-col-1: top=180, left=32, w=52, h=696
const C1_L = 32, C1_T = 180;
for (let r = 0; r < 15; r++) addStand(standPositions, 1 + r, 'prata', C1_L, C1_T, 0, r);

// ── COL 2: 16-30 (PRATA — vermelho, 15 linhas × 1 coluna) ──
// block-col-2: top=180, left=114
const C2_L = 114, C2_T = 180;
for (let r = 0; r < 15; r++) addStand(standPositions, 16 + r, 'prata', C2_L, C2_T, 0, r);

// ── COL 3: 31-45 (OUTRO — amarelo, 15 linhas × 1 coluna) ──
// block-col-3: top=180, left=196
const C3_L = 196, C3_T = 180;
for (let r = 0; r < 15; r++) addStand(standPositions, 31 + r, 'outro', C3_L, C3_T, 0, r);

// ── COL 4: 46-60 (OUTRO — amarelo, 15 linhas × 1 coluna) ──
// block-col-4: top=180, left=528
const C4_L = 528, C4_T = 180;
for (let r = 0; r < 15; r++) addStand(standPositions, 46 + r, 'outro', C4_L, C4_T, 0, r);

// ── COL 5: 61-75 (BRONZE — marrom, 15 linhas × 1 coluna) ──
// block-col-5: top=180, left=610
const C5_L = 610, C5_T = 180;
for (let r = 0; r < 15; r++) addStand(standPositions, 61 + r, 'bronze', C5_L, C5_T, 0, r);

// ── COL 6: 76-90 (BRONZE — marrom, 15 linhas × 1 coluna) ──
// block-col-6: top=180, left=692
const C6_L = 692, C6_T = 180;
for (let r = 0; r < 15; r++) addStand(standPositions, 76 + r, 'bronze', C6_L, C6_T, 0, r);

// ============================================================
//  ÁREA LOUNGE (área especial central)
// ============================================================
export const specialAreas: SpecialArea[] = [
    {
        id: 'lounge',
        label: 'LOUNGE',
        subLabel: 'Área de Descanso',
        x: 288,
        y: 280,
        width: 200,
        height: 496,
        color: '#c08470',
        textColor: '#8b5a45',
        fontSize: 22,
        borderRadius: 14,
    },
];

// ============================================================
//  CORREDORES (fundo visual entre colunas)
// ============================================================
export const corridors: Corridor[] = [
    // Entre col1 e col2
    { x: 32 + 52, y: 180, width: 114 - (32 + 52), height: 696 },
    // Entre col2 e col3
    { x: 114 + 52, y: 180, width: 196 - (114 + 52), height: 696 },
    // Entre col4 e col5
    { x: 528 + 52, y: 180, width: 610 - (528 + 52), height: 696 },
    // Entre col5 e col6
    { x: 610 + 52, y: 180, width: 692 - (610 + 52), height: 696 },
];

// ============================================================
//  ANOTAÇÕES
// ============================================================
export const annotations: MapAnnotation[] = [
    {
        type: 'entrance',
        label: '↩ ENTRADA',
        x: 32 + 26,      // centro da col1
        y: 160,
        fontSize: 10,
        color: '#22c55e',
    },
];

// ============================================================
//  GERADOR DE MOCK — todos disponíveis, tipos já definidos
// ============================================================
export function generateMockStands(): Stand[] {
    return standPositions.map((pos) => ({
        id: `stand-${pos.numero}`,
        numero: pos.numero,
        status: 'disponivel',
        empresa: null,
        tipo: pos.tipo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }));
}
