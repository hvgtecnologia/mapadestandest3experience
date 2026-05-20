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
//  LAYOUT BASEADO NA IMAGEM FINAL DO USUÁRIO
//  Total: 111 stands (sem 14, sem 59, sem 60)
//
//  Estrutura de colunas (esq → dir):
//    left | aisle | b2L | b2R | aisle | b3L | b3R | aisle | b4L | b4R | aisle | right
//    30     110     152   232    312    354   434    514    556   636    716    758
//
//  Estrutura de linhas:
//    Y_TOP (30):  strip 43,44,45,46 + topo right col (114)
//    rows 0-11:   blocos 2,3,4 (12 linhas × 66px = 792px)
//    rows 0-12:   col esquerda (01-13) e col direita (113→101)
//    row 12:      faixa inferior (39-42, 73-75, 100)
// ============================================================

export const SVG_W = 880;
export const SVG_H = 1020;

const CW  = 80;   // largura total da célula
const CH  = 66;   // altura total da célula
const SW  = CW - 6;  // largura interna do stand  = 74
const SH  = CH - 6;  // altura interna do stand   = 60
const PAD = 3;    // padding

// Posições X de cada coluna (borda esquerda da célula)
const X = {
    left:  30,
    b2l:   152,   // 30 + 80 + 42 (aisle)
    b2r:   232,   // 152 + 80
    b3l:   354,   // 232 + 80 + 42
    b3r:   434,   // 354 + 80
    b4l:   556,   // 434 + 80 + 42
    b4r:   636,   // 556 + 80
    right: 758,   // 636 + 80 + 42
};

// Posições Y
const Y_TOP  = 30;           // faixa superior (43-46 e start da col direita 114)
const Y_MAIN = Y_TOP + CH + 4;  // = 100 (início do corpo principal)
const ry = (r: number) => Y_MAIN + r * CH;  // row helper: ry(0)=100 .. ry(12)=892

// Dimensão interna para stand (x+PAD, y+PAD, SW, SH)
const sp = (n: number, cx: number, cy: number): StandPosition => ({
    numero: n,
    tipo: 'prata',
    x: cx + PAD,
    y: cy + PAD,
    width: SW,
    height: SH,
});

// ============================================================
//  POSIÇÕES DOS STANDS
// ============================================================
export const standPositions: StandPosition[] = [];

// — FAIXA SUPERIOR: 43, 44 (acima de b3); 45, 46 (acima de b4) —
standPositions.push(sp(43, X.b3l, Y_TOP));
standPositions.push(sp(44, X.b3r, Y_TOP));
standPositions.push(sp(45, X.b4l, Y_TOP));
standPositions.push(sp(46, X.b4r, Y_TOP));

// — COLUNA DIREITA (arquibancada): 114 no topo, 113→101 em rows 0-12 —
standPositions.push(sp(114, X.right, Y_TOP));
for (let k = 0; k < 13; k++) {
    standPositions.push(sp(113 - k, X.right, ry(k)));
}

// — COLUNA ESQUERDA: 01-13 em rows 0-12 —
for (let k = 0; k < 13; k++) {
    standPositions.push(sp(1 + k, X.left, ry(k)));
}

// — BLOCO 2 (rows 0-11):
//   esquerda: 15→26 (descendo)  /  direita: 38→27 (descendo) —
for (let k = 0; k < 12; k++) {
    standPositions.push(sp(15 + k, X.b2l, ry(k)));
    standPositions.push(sp(38 - k, X.b2r, ry(k)));
}

// — BLOCO 3 (rows 0-11):
//   esquerda: 47→58 (descendo)  /  direita: 72→61 (descendo) —
for (let k = 0; k < 12; k++) {
    standPositions.push(sp(47 + k, X.b3l, ry(k)));
    standPositions.push(sp(72 - k, X.b3r, ry(k)));
}

// — BLOCO 4 (rows 0-11):
//   esquerda: 87→76 (descendo)  /  direita: 88→99 (descendo) —
for (let k = 0; k < 12; k++) {
    standPositions.push(sp(87 - k, X.b4l, ry(k)));
    standPositions.push(sp(88 + k, X.b4r, ry(k)));
}

// — FAIXA INFERIOR ESQUERDA: 39, 40, 41, 42 —
// Posicionados logo à direita da coluna esquerda, na row 12
const BOT_W = 70;   // largura ligeiramente menor para caber
const BOT_Y = ry(12);
const botLeft = [39, 40, 41, 42];
for (let k = 0; k < 4; k++) {
    standPositions.push({
        numero: botLeft[k],
        tipo: 'prata',
        x: X.left + CW + 8 + k * 76,   // 118, 194, 270, 346
        y: BOT_Y + PAD,
        width: BOT_W,
        height: SH,
    });
}

// — FAIXA INFERIOR DIREITA: 73, 74, 75, 100 —
// Posicionados à esquerda da coluna direita, na row 12
const botRight = [73, 74, 75, 100];
for (let k = 0; k < 4; k++) {
    standPositions.push({
        numero: botRight[k],
        tipo: 'prata',
        x: X.right - 4 * 76 + k * 76,   // 454, 530, 606, 682
        y: BOT_Y + PAD,
        width: BOT_W,
        height: SH,
    });
}

// ============================================================
//  ÁREAS ESPECIAIS (WC / SANITÁRIOS)
// ============================================================
export const specialAreas: SpecialArea[] = [];

// WC esquerdo inferior (sob coluna esquerda)
specialAreas.push({
    id: 'wc-bot-left',
    label: 'WC',
    x: X.left + PAD,
    y: BOT_Y + PAD,
    width: SW,
    height: SH,
    color: '#475569',
    textColor: '#94a3b8',
    fontSize: 11,
    borderRadius: 4,
});

// WC central inferior (entre faixas)
specialAreas.push({
    id: 'wc-bot-center',
    label: 'WC',
    x: 346 + 76 + 4,   // após stand 42
    y: BOT_Y + PAD,
    width: 100,
    height: SH,
    color: '#475569',
    textColor: '#94a3b8',
    fontSize: 11,
    borderRadius: 4,
});

// WC direito inferior (sob coluna direita)
specialAreas.push({
    id: 'wc-bot-right',
    label: 'WC',
    x: X.right + PAD,
    y: BOT_Y + PAD,
    width: SW,
    height: SH,
    color: '#475569',
    textColor: '#94a3b8',
    fontSize: 11,
    borderRadius: 4,
});

// Marca vertical da arquibancada
specialAreas.push({
    id: 'arquibancada-label-area',
    label: '',
    x: X.right + CW + 6,
    y: Y_TOP,
    width: 18,
    height: 14 * CH,
    color: '#ef4444',
    borderRadius: 3,
});

// ============================================================
//  CORREDORES (areas visuais de corredor)
// ============================================================
export const corridors: Corridor[] = [];

const mainBodyH = 12 * CH;  // altura dos blocos 2,3,4 (rows 0-11)
const fullColH  = 13 * CH;  // altura das colunas esq/dir (rows 0-12)

// Corredor vertical entre col esq e bloco 2
corridors.push({ x: X.left + CW + 1, y: Y_MAIN, width: X.b2l - (X.left + CW) - 2, height: fullColH });

// Corredor vertical entre bloco 2 e bloco 3
corridors.push({ x: X.b2r + CW + 1, y: Y_TOP,  width: X.b3l - (X.b2r + CW) - 2, height: Y_MAIN - Y_TOP + mainBodyH });

// Corredor vertical entre bloco 3 e bloco 4
corridors.push({ x: X.b3r + CW + 1, y: Y_MAIN, width: X.b4l - (X.b3r + CW) - 2, height: mainBodyH });

// Corredor vertical entre bloco 4 e col direita
corridors.push({ x: X.b4r + CW + 1, y: Y_TOP,  width: X.right - (X.b4r + CW) - 2, height: Y_MAIN - Y_TOP + mainBodyH });

// Corredor horizontal: gaps acima de bloco 2 e col esq
corridors.push({ x: X.left + 1, y: Y_TOP, width: X.b2r + CW - X.left - 2, height: Y_MAIN - Y_TOP });

// ============================================================
//  ANOTAÇÕES (setas de fluxo e entradas)
// ============================================================
export const annotations: MapAnnotation[] = [];

// Setas de fluxo verticais no corredor esq
const leftAisleX = X.left + CW + (X.b2l - X.left - CW) / 2;
[1, 3, 5, 7, 9, 11].forEach(r => {
    annotations.push({ type: 'arrow', label: r % 4 < 2 ? '↓' : '↑', x: leftAisleX, y: ry(r) + CH / 2 - 3, fontSize: 18, color: '#3b82f6' });
});

// Setas horizontais no corredor superior central (→)
const topCorrY = Y_TOP + CH / 2;
[354, 394, 434, 474, 514].forEach(ax => {
    annotations.push({ type: 'arrow', label: '→', x: ax, y: topCorrY, fontSize: 16, color: '#3b82f6' });
});

// Setas verticais no corredor entre b2 e b3
const midAisleB2B3X = X.b2r + CW + (X.b3l - X.b2r - CW) / 2;
[1, 4, 7, 10].forEach(r => {
    annotations.push({ type: 'arrow', label: r % 3 === 1 ? '↑' : '↓', x: midAisleB2B3X, y: ry(r) + CH / 2 - 3, fontSize: 18, color: '#3b82f6' });
});

// Setas verticais no corredor b3-b4
const midAisleB3B4X = X.b3r + CW + (X.b4l - X.b3r - CW) / 2;
[0, 3, 6, 9].forEach(r => {
    annotations.push({ type: 'arrow', label: r % 6 === 0 ? '↓' : '↑', x: midAisleB3B4X, y: ry(r) + CH / 2 - 3, fontSize: 18, color: '#3b82f6' });
});

// Setas verticais no corredor b4-right
const rightAisleX = X.b4r + CW + (X.right - X.b4r - CW) / 2;
[2, 5, 8, 11].forEach(r => {
    annotations.push({ type: 'arrow', label: r % 5 < 3 ? '↑' : '↓', x: rightAisleX, y: ry(r) + CH / 2 - 3, fontSize: 18, color: '#3b82f6' });
});

// Rótulos de entrada/portão
annotations.push({ type: 'entrance', label: '↩ Entrada', x: X.left + CW / 2, y: Y_TOP + 10, fontSize: 11, color: '#60a5fa' });
annotations.push({ type: 'text',     label: 'Portão Principal ↪', x: X.b4r + CW / 2, y: Y_TOP + 10, fontSize: 11, color: '#60a5fa' });
annotations.push({ type: 'entrance', label: '↩ Portão Alternativo', x: X.left + CW / 2, y: ry(12) + CH - 10, fontSize: 10, color: '#60a5fa' });

// Label "Arquibancada" vertical
annotations.push({
    type: 'text',
    label: 'ARQUIBANCADA',
    x: X.right + CW + 15,
    y: Y_TOP + 7 * CH,
    fontSize: 11,
    color: '#f87171',
    rotation: 90,
});

// ============================================================
//  GERADOR DE MOCK DATA — todos disponíveis, todos prata
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
