import { Stand, StandType } from '@/types/stand';

export interface StandPosition {
    numero: number;
    tipo: StandType;
    setor: number;
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
    rotation?: number;
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

export interface Sector {
    numero: number;
    nome: string;
    /** posição da etiqueta (pill) do setor */
    labelX: number;
    labelY: number;
    labelW: number;
    /** esconde o círculo com o número (áreas que não são setores numerados) */
    hideBadge?: boolean;
}

// ============================================================
//  MAPA T3 2027 — Centro de Eventos Sociedade Rural
//
//  Visual:     "Mapa de Setores" (21 setores com etiqueta)
//  Quantidade/setores: DWG "MAPA t3 2027.dwg" (Layout1)
//
//  Numeração (sequencial; dentro do bloco: esquerda→direita, cima→baixo):
//    1–247   setores 1 a 21
//    248–253 Alimentação (tendas 10×10m)
//    254–259 Bar (tendas 10×10m)
//
//  O "miolo" (setores 1–21) é desenhado em coordenadas próprias e
//  depois deslocado OY px para baixo, abrindo espaço para a faixa
//  superior (Feirão, Credenciamento, Alimentação/Bar, W.C, Currais).
// ============================================================

export const SVG_W = 1600;
export const SVG_H = 1810;
const OY = 330;

const CW = 32;   // cell width
const CH = 32;   // cell height
const BP = 4;    // block padding
const CG = 2;    // cell gap

export const standPositions: StandPosition[] = [];
export const sectors: Sector[] = [];

let nextNumero = 1;

/** Adiciona um bloco de stands (rows × cols) numerado em ordem de leitura. */
function addBlock(setor: number, left: number, top: number, rows: number, cols: number, tipo: StandType = 'prata') {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            standPositions.push({
                numero: nextNumero++,
                tipo,
                setor,
                x: left + BP + c * (CW + CG),
                y: top + BP + r * (CH + CG),
                width: CW,
                height: CH,
            });
        }
    }
}

function sector(numero: number, nome: string, labelX: number, labelY: number, labelW: number, hideBadge = false) {
    sectors.push({ numero, nome, labelX, labelY, labelW, hideBadge });
}

/** Soma dy a todas as coordenadas Y de um path "M x y L x y ..." */
function shiftPath(d: string, dy: number) {
    let i = 0;
    return d.replace(/-?\d+(\.\d+)?/g, (n) => (i++ % 2 === 1 ? String(Number(n) + dy) : n));
}

// ════════════════════════════════════════════════════════════
//  MIOLO — setores 1 a 21 (coordenadas locais, deslocadas por OY)
// ════════════════════════════════════════════════════════════

// ── Colunas verticais ────────────────────────────────────────
sector(1, 'Industrial', 250, 140, 200);
addBlock(1, 470, 110, 15, 1);
sector(2, 'Instituições', 640, 140, 220);
addBlock(2, 570, 110, 15, 1);

// ── Blocos horizontais à esquerda (2 × 7) ────────────────────
const LEFT_X = 200;
const LEFT_Y = [626, 736, 846, 956];
([[3, 'Finanças/Prestação de Serviços'], [4, 'Casa e Lar'], [5, 'Esportes e Beleza'], [6, 'Turismo']] as [number, string][]).forEach(([n, nome], i) => {
    sector(n, nome, 36, LEFT_Y[i] + 18, 158);
    addBlock(n, LEFT_X, LEFT_Y[i], 2, 7);
});

// ── Fileiras na frente do Centro de Eventos ──────────────────
sector(7, 'Serviços e Produtos Empresariais', 640, 462, 250);
addBlock(7, 640, 505, 1, 7);
sector(8, 'Serviços e Produtos Empresariais', 920, 462, 230);
addBlock(8, 935, 505, 1, 5);

// ── Grade central superior (2 × 6) ───────────────────────────
const GRID_X = [580, 700, 820, 940, 1060, 1180];
const UP_Y = 705;
([[9, 'Moda'], [10, 'Gestantes e Baby'], [11, 'Educação'], [12, 'Eventos'], [13, 'Saúde'], [14, 'Automotivo']] as [number, string][])
    .forEach(([n, nome], i) => {
        sector(n, nome, GRID_X[i] - 21, UP_Y - 40, 116);
        addBlock(n, GRID_X[i], UP_Y, 6, 2);
    });

// ── Grade central inferior (2 × 6) ───────────────────────────
const LOW_Y = 1000;
([[15, 'Marketing e Comunicação'], [16, 'Pet'], [17, 'Construção'], [18, 'Agro'], [19, 'Saúde']] as [number, string][])
    .forEach(([n, nome], i) => {
        sector(n, nome, GRID_X[i] - 21, LOW_Y - 40, 116);
        addBlock(n, GRID_X[i], LOW_Y, 6, 2);
    });

// 20 Automotivo (antigo 22) — 2 × 5
sector(20, 'Automotivo', GRID_X[5] - 21, LOW_Y - 40, 150);
addBlock(20, GRID_X[5], LOW_Y, 5, 2);

// 21 Kids e Playground — 1 × 7
sector(21, 'Kids e Playground', 700, 1230, 200);
addBlock(21, 700, 1272, 1, 7);

const mainAreas: SpecialArea[] = [
    {
        id: 'centro-eventos', label: 'Centro de Eventos', subLabel: 'Sociedade Rural',
        x: 650, y: 200, width: 520, height: 230, color: '#64748b', textColor: '#cbd5e1', fontSize: 26, borderRadius: 10,
    },
    {
        id: 'palco', label: 'PALCO',
        x: 1190, y: 330, width: 90, height: 44, color: '#a21caf', textColor: '#f5d0fe', fontSize: 14, borderRadius: 6,
    },
    {
        id: 'bar-centro', label: 'BAR',
        x: 1190, y: 385, width: 90, height: 40, color: '#0e7490', textColor: '#a5f3fc', fontSize: 14, borderRadius: 6,
    },
    {
        id: 'lounge-t3', label: 'LOUNGE T3',
        x: 468, y: 620, width: 80, height: 210, color: '#c08470', textColor: '#f5d0c0', fontSize: 20, borderRadius: 6, rotation: -90,
    },
    {
        id: 'banheiro', label: 'BANHEIRO QUÍMICO',
        x: 220, y: 1075, width: 200, height: 85, color: '#475569', textColor: '#e2e8f0', fontSize: 14, borderRadius: 6,
    },
    {
        id: 'pm-mg', label: 'PM MG',
        x: 200, y: 1175, width: 150, height: 50, color: '#1d4ed8', textColor: '#bfdbfe', fontSize: 18, borderRadius: 6,
    },
    {
        id: 'bilheteria', label: 'BILHETERIA',
        x: 320, y: 1295, width: 130, height: 44, color: '#475569', textColor: '#e2e8f0', fontSize: 13, borderRadius: 6,
    },
    {
        id: 'emergencia', label: 'EMERGÊNCIA',
        x: 460, y: 1295, width: 130, height: 44, color: '#b91c1c', textColor: '#fecaca', fontSize: 13, borderRadius: 6,
    },
    {
        id: 'espaco-kids', label: 'ESPAÇO KIDS',
        x: 605, y: 1280, width: 80, height: 70, color: '#7c3aed', textColor: '#ddd6fe', fontSize: 10, borderRadius: 35,
    },
    {
        id: 'v02', label: 'V02',
        x: 1060, y: 1295, width: 70, height: 44, color: '#475569', textColor: '#e2e8f0', fontSize: 15, borderRadius: 6,
    },
    // saídas de emergência laterais (lado esquerdo e junto ao banheiro)
    ...[440, 640, 900].map((y, i): SpecialArea => ({
        id: `emerg-esq-${i}`, label: 'EMERGÊNCIA',
        x: 2, y, width: 30, height: 90, color: '#b91c1c', textColor: '#fecaca', fontSize: 9, borderRadius: 4, rotation: -90,
    })),
    {
        id: 'emerg-banheiro', label: 'EMERGÊNCIA',
        x: 432, y: 1075, width: 28, height: 85, color: '#b91c1c', textColor: '#fecaca', fontSize: 9, borderRadius: 4, rotation: -90,
    },
    {
        id: 'emerg-industrial', label: 'EMERGÊNCIA',
        x: 520, y: 440, width: 28, height: 90, color: '#b91c1c', textColor: '#fecaca', fontSize: 9, borderRadius: 4, rotation: -90,
    },
    // veículos (faixa direita, junto à Rua Carlos Paulinho Cardoso)
    ...['veículo 01', 'veículo 02', 'veículo 03', 'veículo 04', 'trator agro', 'trator amarelo', 'moto', 'moto elétrica']
        .map((label, i): SpecialArea => ({
            id: `veiculo-${i}`, label,
            x: 1345, y: 470 + i * 58, width: 110, height: 48,
            color: i < 4 ? '#475569' : '#65a30d', textColor: '#e2e8f0', fontSize: 12, borderRadius: 6,
        })),
];

const mainLines: string[] = [
    // contorno externo
    'M 40 100 L 1180 100 L 1180 430 L 1470 430 L 1470 1150 L 1250 1355 L 320 1355 L 140 1230 L 20 1230 L 20 330',
    // divisória esquerda (área dos blocos 3–6)
    'M 190 586 L 460 586 L 460 1066 L 190 1066 Z',
    // via de serviço superior
    'M 40 330 L 440 330',
];

// aplica o deslocamento vertical no miolo
standPositions.forEach(p => { p.y += OY; });
sectors.forEach(s => { s.labelY += OY; });
mainAreas.forEach(a => { a.y += OY; });

// ════════════════════════════════════════════════════════════
//  FAIXA SUPERIOR — Alimentação / Bar (stands 248–259)
// ════════════════════════════════════════════════════════════
const TENT_Y = 185;
sector(101, 'Alimentação', 690, TENT_Y - 42, 180, true);
addBlock(101, 690, TENT_Y, 1, 6, 'outro');
sector(102, 'Bar', 940, TENT_Y - 42, 120, true);
addBlock(102, 940, TENT_Y, 1, 6, 'outro');

export const TOTAL_STANDS = standPositions.length; // 259

const topAreas: SpecialArea[] = [
    // 4 tendas do Feirão
    ...[0, 1, 2, 3].map((i): SpecialArea => ({
        id: `feirao-${i}`, label: 'TENDA FEIRÃO', subLabel: '10×10m · 100 m²',
        x: 40 + i * 120, y: 20, width: 110, height: 90, color: '#b45309', textColor: '#fde68a', fontSize: 11, borderRadius: 6,
    })),
    {
        id: 'credenciamento', label: 'CREDENCIAMENTO', subLabel: 'Tenda 10×10m',
        x: 470, y: 160, width: 140, height: 120, color: '#0f766e', textColor: '#99f6e4', fontSize: 12, borderRadius: 6,
    },
    {
        id: 'emerg-credenciamento', label: 'EMERGÊNCIA',
        x: 520, y: 290, width: 90, height: 26, color: '#b91c1c', textColor: '#fecaca', fontSize: 9, borderRadius: 4,
    },
    // fundo das tendas de Alimentação/Bar (label vazio = só o contorno)
    {
        id: 'tendas-alim-bar', label: '',
        x: 675, y: 130, width: 485, height: 112, color: '#ca8a04', borderRadius: 8,
    },
    {
        id: 'wc', label: 'W.C',
        x: 700, y: 268, width: 200, height: 60, color: '#475569', textColor: '#e2e8f0', fontSize: 16, borderRadius: 6,
    },
    {
        id: 'currais', label: 'Conjunto de Currais', subLabel: 'Antônio Figueiredo Viana',
        x: 1185, y: 20, width: 295, height: 200, color: '#57534e', textColor: '#e7e5e4', fontSize: 16, borderRadius: 8,
    },
    {
        id: 'tatersal', label: 'TATERSAL',
        x: 1230, y: 235, width: 250, height: 110, color: '#57534e', textColor: '#e7e5e4', fontSize: 16, borderRadius: 8,
    },
    // saídas de emergência na Rua Carlos Paulinho Cardoso
    ...[620, 1100].map((y, i): SpecialArea => ({
        id: `emerg-rua-${i}`, label: 'EMERGÊNCIA',
        x: 1478, y, width: 30, height: 90, color: '#b91c1c', textColor: '#fecaca', fontSize: 9, borderRadius: 4, rotation: -90,
    })),
    // ruas
    {
        id: 'rua-carlos', label: 'RUA CARLOS PAULINHO CARDOSO',
        x: 1520, y: 0, width: 70, height: 1720, color: '#334155', textColor: '#94a3b8', fontSize: 16, borderRadius: 0, rotation: -90,
    },
    {
        id: 'av-geraldo', label: 'AV. GERALDO ATHAYDE',
        x: 0, y: 1725, width: 1590, height: 70, color: '#334155', textColor: '#94a3b8', fontSize: 18, borderRadius: 0,
    },
    // entrada pela avenida
    {
        id: 'caixa-dagua', label: "CAIXA D'ÁGUA",
        x: 20, y: 1590, width: 110, height: 44, color: '#0369a1', textColor: '#bae6fd', fontSize: 11, borderRadius: 6,
    },
    {
        id: 'bilheteria-2', label: 'BILHETERIA',
        x: 20, y: 1686, width: 110, height: 34, color: '#475569', textColor: '#e2e8f0', fontSize: 11, borderRadius: 6,
    },
    {
        id: 'portaria', label: 'PORTARIA',
        x: 150, y: 1686, width: 160, height: 34, color: '#475569', textColor: '#e2e8f0', fontSize: 13, borderRadius: 6,
    },
];

// ============================================================
//  EXPORTS
// ============================================================
// topAreas primeiro (ruas ficam por baixo de tudo)
export const specialAreas: SpecialArea[] = [...topAreas, ...mainAreas];

export const venueLines: string[] = mainLines.map(d => shiftPath(d, OY));

export const corridors: Corridor[] = [];

export const annotations: MapAnnotation[] = [
    { type: 'entrance', label: '↓ ENTRADA', x: 540, y: 148, fontSize: 13, color: '#22c55e' },
    { type: 'text', label: 'Jardim', x: 240, y: 560, fontSize: 16, color: '#4ade80' },
    { type: 'text', label: 'Jardim', x: 627, y: 560, fontSize: 12, color: '#4ade80', rotation: -90 },
    { type: 'text', label: 'ALIMENTAÇÃO · BAR — tendas 10×10m', x: 917, y: 254, fontSize: 10, color: '#facc15' },
];

// ============================================================
//  GERADOR DE MOCK — todos disponíveis
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

export function sectorOf(numero: number): Sector | undefined {
    const pos = standPositions.find(p => p.numero === numero);
    return pos ? sectors.find(s => s.numero === pos.setor) : undefined;
}
