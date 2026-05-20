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

// ============================================================
//  MAPA T3 — 114 stands sequenciais (1 a 114)
//
//  Baseado EXATAMENTE no HTML de referência (v7):
//  Canvas: 940 × 920 px
//  Célula:  72 × 50 px  (interna)
//  Bloco:   padding=4, gap=2
//  Corredor entre blocos: 66 px
//
//  Blocos (top | left | w | h):
//    strip-top (43-46):   60  | 324 | 302 |  58
//    col1      (01-14):  110  |  32 |  80 | 734
//    pair1     (15-38):  110  | 178 | 154 | 630
//    pair2     (47-72):  162  | 398 | 154 | 682
//    pair3     (76-99):  110  | 618 | 154 | 630
//    col-right (101-114):110  | 838 |  80 | 734
//    bot-left  (39-42):  836  | 104 | 302 |  58
//    bot-right (73-75,100):836| 544 | 302 |  58
// ============================================================

export const SVG_W = 940;
export const SVG_H = 920;

// Dimensões de célula (interna, sem padding do bloco)
const CW = 72;   // cell width
const CH = 50;   // cell height
const BP = 4;    // block padding
const CG = 2;    // cell gap

// Helper: calcula posições SVG das células dentro de um bloco
// blockLeft, blockTop = coordenadas absolutas do bloco
// col, row (0-indexed) = posição da célula dentro do bloco
function cellPos(blockLeft: number, blockTop: number, col: number, row: number) {
    return {
        x: blockLeft + BP + col * (CW + CG),
        y: blockTop  + BP + row * (CH + CG),
    };
}

const PAD = 0;  // as posições já incluem o padding do bloco

// ============================================================
//  POSIÇÕES DOS STANDS
// ============================================================
export const standPositions: StandPosition[] = [];

function addStand(n: number, blockL: number, blockT: number, col: number, row: number) {
    const { x, y } = cellPos(blockL, blockT, col, row);
    standPositions.push({
        numero: n,
        tipo: 'prata',
        x,
        y,
        width: CW,
        height: CH,
    });
}

// ── TIRA SUPERIOR: 43, 44, 45, 46 (1 linha × 4 colunas) ──
// block: top=60, left=324, w=302, h=58
const STRIP_TOP_L = 324, STRIP_TOP_T = 60;
[43, 44, 45, 46].forEach((n, col) => addStand(n, STRIP_TOP_L, STRIP_TOP_T, col, 0));

// ── COLUNA 1: 01-14 (14 linhas × 1 coluna) ──
// block: top=110, left=32, w=80, h=734
const COL1_L = 32, COL1_T = 110;
for (let i = 0; i < 14; i++) addStand(i + 1, COL1_L, COL1_T, 0, i);

// ── PAR 1: 15-26 esq | 38-27 dir (12 linhas × 2 colunas) ──
// block: top=110, left=178, w=154, h=630
const PAIR1_L = 178, PAIR1_T = 110;
for (let r = 0; r < 12; r++) {
    addStand(15 + r, PAIR1_L, PAIR1_T, 0, r);   // coluna esq: 15,16,...,26
    addStand(38 - r, PAIR1_L, PAIR1_T, 1, r);   // coluna dir: 38,37,...,27
}

// ── PAR 2: U-shape (13 linhas × 2 colunas) ──
// esq: 47→59 (desce);  dir: 72→60 (desce)
// block: top=162, left=398, w=154, h=682
const PAIR2_L = 398, PAIR2_T = 162;
for (let r = 0; r < 13; r++) {
    addStand(47 + r, PAIR2_L, PAIR2_T, 0, r);   // esq: 47,48,...,59
    addStand(72 - r, PAIR2_L, PAIR2_T, 1, r);   // dir: 72,71,...,60
}

// ── PAR 3: 87-76 esq | 88-99 dir (12 linhas × 2 colunas) ──
// block: top=110, left=618, w=154, h=630
const PAIR3_L = 618, PAIR3_T = 110;
for (let r = 0; r < 12; r++) {
    addStand(87 - r, PAIR3_L, PAIR3_T, 0, r);   // esq: 87,86,...,76
    addStand(88 + r, PAIR3_L, PAIR3_T, 1, r);   // dir: 88,89,...,99
}

// ── COLUNA DIREITA: 114-101 (14 linhas × 1 coluna) ──
// block: top=110, left=838, w=80, h=734
const COLR_L = 838, COLR_T = 110;
for (let i = 0; i < 14; i++) addStand(114 - i, COLR_L, COLR_T, 0, i);

// ── TIRA INFERIOR ESQUERDA: 39, 40, 41, 42 (1 linha × 4 colunas) ──
// block: top=836, left=104, w=302, h=58
const BOT_L_L = 104, BOT_L_T = 836;
[39, 40, 41, 42].forEach((n, col) => addStand(n, BOT_L_L, BOT_L_T, col, 0));

// ── TIRA INFERIOR DIREITA: 73, 74, 75, 100 (1 linha × 4 colunas) ──
// block: top=836, left=544, w=302, h=58
const BOT_R_L = 544, BOT_R_T = 836;
[73, 74, 75, 100].forEach((n, col) => addStand(n, BOT_R_L, BOT_R_T, col, 0));

// ============================================================
//  ÁREAS ESPECIAIS (sem WC no HTML — apenas arquibancada)
// ============================================================
export const specialAreas: SpecialArea[] = [
    {
        id: 'arquibancada-label-area',
        label: '',
        x: SVG_W - 14,
        y: 110,
        width: 3,
        height: 734,
        color: '#e74c3c',
        borderRadius: 2,
    },
];

// ============================================================
//  CORREDORES (áreas de corredor para fundo visual)
// ============================================================
export const corridors: Corridor[] = [
    // Corredor esq (entre col1 e pair1)
    { x: 32 + 80, y: 110, width: 178 - (32 + 80), height: 734 },
    // Corredor entre pair1 e pair2
    { x: 178 + 154, y: 60, width: 398 - (178 + 154), height: 836 - 60 },
    // Corredor entre pair2 e pair3
    { x: 398 + 154, y: 110, width: 618 - (398 + 154), height: 682 },
    // Corredor dir (entre pair3 e col-right)
    { x: 618 + 154, y: 110, width: 838 - (618 + 154), height: 734 },
];

// ============================================================
//  ANOTAÇÕES
// ============================================================
export const annotations: MapAnnotation[] = [
    {
        type: 'text',
        label: 'ARQUIBANCADA / SAÍDAS →',
        x: SVG_W - 7,
        y: 110 + 734 / 2,
        rotation: 90,
        fontSize: 11,
        color: '#e74c3c',
    },
];

// ============================================================
//  GERADOR DE MOCK — todos disponíveis, todos prata
// ============================================================
export function generateMockStands(): Stand[] {
    return standPositions.map((pos) => ({
        id: `stand-${pos.numero}`,
        numero: pos.numero,
        status: 'disponivel',
        empresa: null,
        tipo: 'prata',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }));
}
