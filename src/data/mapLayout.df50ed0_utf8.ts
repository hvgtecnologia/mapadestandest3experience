import { Stand, StandType } from '@/types/stand';

export interface StandPosition {
    numero: number;
    tipo: StandType;
    x: number;
    y: number;
    width: number;
    height: number;
}

// ============================================
// LAYOUT PRECISO baseado no mapa T3 Experience
// ViewBox: 0 0 1100 950
// ============================================

const SW = 52;  // stand width
const SH = 54;  // stand height
const VS = 4;   // vertical spacing between stands

// Vertical column Y positions helper (10 stands)
const colY = (i: number, startY: number) => startY + i * (SH + VS);
// Vertical column Y positions helper (12 stands, tighter)
const colY12 = (i: number, startY: number) => startY + i * (SH + 2);

export const standPositions: StandPosition[] = [

    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    // FILEIRA SUPERIOR (01ÔÇô10) ÔÇö Ouro
    // Horizontal, topo do mapa
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    { numero: 1, tipo: 'ouro', x: 62, y: 28, width: SW, height: 50 },
    { numero: 2, tipo: 'ouro', x: 118, y: 28, width: SW, height: 50 },
    { numero: 3, tipo: 'ouro', x: 174, y: 28, width: SW, height: 50 },
    { numero: 4, tipo: 'ouro', x: 230, y: 28, width: SW, height: 50 },
    { numero: 5, tipo: 'ouro', x: 286, y: 28, width: SW, height: 50 },
    { numero: 6, tipo: 'ouro', x: 342, y: 28, width: SW, height: 50 },
    { numero: 7, tipo: 'ouro', x: 398, y: 28, width: SW, height: 50 },
    { numero: 8, tipo: 'ouro', x: 454, y: 28, width: SW, height: 50 },
    { numero: 9, tipo: 'ouro', x: 510, y: 28, width: SW, height: 50 },
    { numero: 10, tipo: 'ouro', x: 566, y: 28, width: SW, height: 50 },

    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    // FILEIRA SUPERIOR DIREITA (11ÔÇô14) ÔÇö Prata
    // Ap├│s o corredor vertical
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    { numero: 11, tipo: 'ouro', x: 668, y: 28, width: SW, height: 50 },
    { numero: 12, tipo: 'ouro', x: 724, y: 28, width: SW, height: 50 },
    { numero: 13, tipo: 'bronze', x: 790, y: 28, width: SW, height: 50 },
    { numero: 14, tipo: 'bronze', x: 846, y: 28, width: SW, height: 50 },

    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    // COLUNA DIREITA EXTREMA (15ÔÇô25) ÔÇö Bronze
    // Lado direito do mapa, vertical
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    { numero: 15, tipo: 'bronze', x: 920, y: colY(0, 104), width: 48, height: SH },
    { numero: 16, tipo: 'bronze', x: 920, y: colY(1, 104), width: 48, height: SH },
    { numero: 17, tipo: 'bronze', x: 920, y: colY(2, 104), width: 48, height: SH },
    { numero: 18, tipo: 'bronze', x: 920, y: colY(3, 104), width: 48, height: SH },
    { numero: 19, tipo: 'bronze', x: 920, y: colY(4, 104), width: 48, height: SH },
    { numero: 20, tipo: 'bronze', x: 920, y: colY(5, 104), width: 48, height: SH },
    { numero: 21, tipo: 'bronze', x: 920, y: colY(6, 104), width: 48, height: SH },
    { numero: 22, tipo: 'bronze', x: 920, y: colY(7, 104), width: 48, height: SH },
    { numero: 23, tipo: 'bronze', x: 920, y: colY(8, 104), width: 48, height: SH },
    { numero: 24, tipo: 'bronze', x: 920, y: colY(9, 104), width: 48, height: SH },
    { numero: 25, tipo: 'bronze', x: 920, y: colY(10, 104), width: 48, height: SH },

    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    // CANTO INFERIOR DIREITO (26ÔÇô31)
    // Formato "L": 28-27-26 horizontal, 29 abaixo de 28, 30 abaixo de 29
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    { numero: 28, tipo: 'bronze', x: 690, y: 654, width: SW, height: SH },
    { numero: 27, tipo: 'bronze', x: 746, y: 654, width: SW, height: SH },
    { numero: 26, tipo: 'bronze', x: 802, y: 654, width: SW, height: SH },
    { numero: 29, tipo: 'bronze', x: 690, y: 712, width: SW, height: SH },
    { numero: 30, tipo: 'bronze', x: 690, y: 770, width: SW, height: 46 },
    { numero: 31, tipo: 'bronze', x: 656, y: 833, width: SW, height: 48 },

    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    // STAND 32 (canto inferior esquerdo)
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    { numero: 32, tipo: 'prata', x: 62, y: 828, width: SW, height: 50 },

    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    // COLUNA ESQUERDA (33ÔÇô44) ÔÇö Prata / Ouro
    // Lateral esquerda, de baixo para cima
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    { numero: 33, tipo: 'prata', x: 14, y: colY12(11, 104), width: SW, height: 52 },
    { numero: 34, tipo: 'prata', x: 14, y: colY12(10, 104), width: SW, height: 52 },
    { numero: 35, tipo: 'prata', x: 14, y: colY12(9, 104), width: SW, height: 52 },
    { numero: 36, tipo: 'prata', x: 14, y: colY12(8, 104), width: SW, height: 52 },
    { numero: 37, tipo: 'prata', x: 14, y: colY12(7, 104), width: SW, height: 52 },
    { numero: 38, tipo: 'prata', x: 14, y: colY12(6, 104), width: SW, height: 52 },
    { numero: 39, tipo: 'prata', x: 14, y: colY12(5, 104), width: SW, height: 52 },
    { numero: 40, tipo: 'prata', x: 14, y: colY12(4, 104), width: SW, height: 52 },
    { numero: 41, tipo: 'prata', x: 14, y: colY12(3, 104), width: SW, height: 52 },
    { numero: 42, tipo: 'prata', x: 14, y: colY12(2, 104), width: SW, height: 52 },
    { numero: 43, tipo: 'prata', x: 14, y: colY12(1, 104), width: SW, height: 52 },
    { numero: 44, tipo: 'ouro', x: 14, y: colY12(0, 104), width: SW, height: 52 },

    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    // 2┬¬ COLUNA ESQUERDA (45ÔÇô54) ÔÇö Prata
    // De cima para baixo
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    { numero: 45, tipo: 'ouro', x: 118, y: colY(0, 128), width: SW, height: SH },
    { numero: 46, tipo: 'prata', x: 118, y: colY(1, 128), width: SW, height: SH },
    { numero: 47, tipo: 'prata', x: 118, y: colY(2, 128), width: SW, height: SH },
    { numero: 48, tipo: 'prata', x: 118, y: colY(3, 128), width: SW, height: SH },
    { numero: 49, tipo: 'prata', x: 118, y: colY(4, 128), width: SW, height: SH },
    { numero: 50, tipo: 'prata', x: 118, y: colY(5, 128), width: SW, height: SH },
    { numero: 51, tipo: 'prata', x: 118, y: colY(6, 128), width: SW, height: SH },
    { numero: 52, tipo: 'prata', x: 118, y: colY(7, 128), width: SW, height: SH },
    { numero: 53, tipo: 'prata', x: 118, y: colY(8, 128), width: SW, height: SH },
    { numero: 54, tipo: 'prata', x: 118, y: colY(9, 128), width: SW, height: SH },

    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    // 3┬¬ COLUNA ESQUERDA (55ÔÇô64) ÔÇö Ouro
    // Faces oposta ├á 2┬¬ coluna, de cima (64) p/ baixo (55)
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    { numero: 64, tipo: 'ouro', x: 174, y: colY(0, 128), width: SW, height: SH },
    { numero: 63, tipo: 'ouro', x: 174, y: colY(1, 128), width: SW, height: SH },
    { numero: 62, tipo: 'ouro', x: 174, y: colY(2, 128), width: SW, height: SH },
    { numero: 61, tipo: 'ouro', x: 174, y: colY(3, 128), width: SW, height: SH },
    { numero: 60, tipo: 'ouro', x: 174, y: colY(4, 128), width: SW, height: SH },
    { numero: 59, tipo: 'ouro', x: 174, y: colY(5, 128), width: SW, height: SH },
    { numero: 58, tipo: 'ouro', x: 174, y: colY(6, 128), width: SW, height: SH },
    { numero: 57, tipo: 'ouro', x: 174, y: colY(7, 128), width: SW, height: SH },
    { numero: 56, tipo: 'ouro', x: 174, y: colY(8, 128), width: SW, height: SH },
    { numero: 55, tipo: 'ouro', x: 174, y: colY(9, 128), width: SW, height: SH },

    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    // COLUNA CENTRO-ESQUERDA (65ÔÇô74) ÔÇö Ouro
    // De cima para baixo
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    { numero: 65, tipo: 'ouro', x: 478, y: colY(0, 128), width: SW, height: SH },
    { numero: 66, tipo: 'ouro', x: 478, y: colY(1, 128), width: SW, height: SH },
    { numero: 67, tipo: 'ouro', x: 478, y: colY(2, 128), width: SW, height: SH },
    { numero: 68, tipo: 'ouro', x: 478, y: colY(3, 128), width: SW, height: SH },
    { numero: 69, tipo: 'ouro', x: 478, y: colY(4, 128), width: SW, height: SH },
    { numero: 70, tipo: 'ouro', x: 478, y: colY(5, 128), width: SW, height: SH },
    { numero: 71, tipo: 'ouro', x: 478, y: colY(6, 128), width: SW, height: SH },
    { numero: 72, tipo: 'ouro', x: 478, y: colY(7, 128), width: SW, height: SH },
    { numero: 73, tipo: 'ouro', x: 478, y: colY(8, 128), width: SW, height: SH },
    { numero: 74, tipo: 'ouro', x: 478, y: colY(9, 128), width: SW, height: SH },

    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    // COLUNA CENTRO-DIREITA (75ÔÇô84) ÔÇö Master
    // De cima (84) para baixo (75)
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    { numero: 84, tipo: 'ouro', x: 534, y: colY(0, 128), width: SW, height: SH },
    { numero: 83, tipo: 'master', x: 534, y: colY(1, 128), width: SW, height: SH },
    { numero: 82, tipo: 'master', x: 534, y: colY(2, 128), width: SW, height: SH },
    { numero: 81, tipo: 'master', x: 534, y: colY(3, 128), width: SW, height: SH },
    { numero: 80, tipo: 'master', x: 534, y: colY(4, 128), width: SW, height: SH },
    { numero: 79, tipo: 'master', x: 534, y: colY(5, 128), width: SW, height: SH },
    { numero: 78, tipo: 'master', x: 534, y: colY(6, 128), width: SW, height: SH },
    { numero: 77, tipo: 'master', x: 534, y: colY(7, 128), width: SW, height: SH },
    { numero: 76, tipo: 'master', x: 534, y: colY(8, 128), width: SW, height: SH },
    { numero: 75, tipo: 'master', x: 534, y: colY(9, 128), width: SW, height: SH },

    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    // COLUNA INTERNA DIREITA (85ÔÇô92) ÔÇö Master
    // De cima para baixo (somente 8 stands)
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    { numero: 85, tipo: 'master', x: 690, y: colY(0, 128), width: SW, height: SH },
    { numero: 86, tipo: 'master', x: 690, y: colY(1, 128), width: SW, height: SH },
    { numero: 87, tipo: 'master', x: 690, y: colY(2, 128), width: SW, height: SH },
    { numero: 88, tipo: 'master', x: 690, y: colY(3, 128), width: SW, height: SH },
    { numero: 89, tipo: 'master', x: 690, y: colY(4, 128), width: SW, height: SH },
    { numero: 90, tipo: 'master', x: 690, y: colY(5, 128), width: SW, height: SH },
    { numero: 91, tipo: 'master', x: 690, y: colY(6, 128), width: SW, height: SH },
    { numero: 92, tipo: 'master', x: 690, y: colY(7, 128), width: SW, height: SH },

    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    // 2┬¬ COLUNA INTERNA DIREITA (93ÔÇô100) ÔÇö Prata
    // Encostada na coluna 85-92 (sem corredor)
    // De cima (100) para baixo (93)
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
    { numero: 100, tipo: 'prata', x: 746, y: colY(0, 128), width: SW, height: SH },
    { numero: 99, tipo: 'bronze', x: 746, y: colY(1, 128), width: SW, height: SH },
    { numero: 98, tipo: 'bronze', x: 746, y: colY(2, 128), width: SW, height: SH },
    { numero: 97, tipo: 'bronze', x: 746, y: colY(3, 128), width: SW, height: SH },
    { numero: 96, tipo: 'bronze', x: 746, y: colY(4, 128), width: SW, height: SH },
    { numero: 95, tipo: 'bronze', x: 746, y: colY(5, 128), width: SW, height: SH },
    { numero: 94, tipo: 'bronze', x: 746, y: colY(6, 128), width: SW, height: SH },
    { numero: 93, tipo: 'bronze', x: 746, y: colY(7, 128), width: SW, height: SH },
];

// ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
// ├üREAS ESPECIAIS
// ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
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

export const specialAreas: SpecialArea[] = [
    // PALCO ÔÇö centro inferior
    {
        id: 'palco',
        label: 'PALCO',
        x: 280, y: 828,
        width: 210, height: 65,
        color: '#1e293b',
        textColor: '#e2e8f0',
        fontSize: 18,
        borderRadius: 6,
    },
    // BAR 01
    {
        id: 'bar01',
        label: 'BAR 01',
        x: 120, y: 833,
        width: 72, height: 48,
        color: '#0e7490',
        textColor: '#e0f2fe',
        fontSize: 9,
        borderRadius: 4,
    },
    // BAR 02
    {
        id: 'bar02',
        label: 'BAR 02',
        x: 198, y: 833,
        width: 72, height: 48,
        color: '#0e7490',
        textColor: '#e0f2fe',
        fontSize: 9,
        borderRadius: 4,
    },
    // BAR 03
    {
        id: 'bar03',
        label: 'BAR 03',
        x: 500, y: 833,
        width: 72, height: 48,
        color: '#0e7490',
        textColor: '#e0f2fe',
        fontSize: 9,
        borderRadius: 4,
    },
    // BAR 04
    {
        id: 'bar04',
        label: 'BAR 04',
        x: 578, y: 833,
        width: 72, height: 48,
        color: '#0e7490',
        textColor: '#e0f2fe',
        fontSize: 9,
        borderRadius: 4,
    },
    // PRA├çA DE ALIMENTA├ç├âO ÔÇö centro-baixo entre colunas
    {
        id: 'praca',
        label: 'PRA├çA DE\nALIMENTA├ç├âO',
        x: 296, y: 555,
        width: 155, height: 165,
        color: '#059669',
        textColor: '#a7f3d0',
        fontSize: 10,
        borderRadius: 80,
    },
    // Lounge T3 Hub ÔÇö centro-topo
    {
        id: 'expo',
        label: 'Lounge T3 Hub',
        x: 296, y: 168,
        width: 155, height: 180,
        color: '#4f46e5',
        textColor: '#c7d2fe',
        fontSize: 10,
        borderRadius: 6,
    },
];

// ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
// CORREDORES (paths azuis do mapa original)
// ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
export interface Corridor {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const corridors: Corridor[] = [
    // Corredor horizontal superior
    { x: 10, y: 82, width: 960, height: 18 },
    // Corredor horizontal inferior (antes do palco)
    { x: 10, y: 808, width: 960, height: 16 },

    // Corredor vertical ÔÇö entre coluna esquerda (33-44) e 2┬¬ coluna (45-54)
    { x: 70, y: 98, width: 42, height: 726 },
    // Corredor vertical ÔÇö ap├│s colunas 45-54 / 64-55, antes da ├írea central
    { x: 230, y: 98, width: 18, height: 640 },

    // Corredor vertical ÔÇö antes da coluna centro-esquerda (65-74)
    { x: 456, y: 98, width: 18, height: 640 },
    // Corredor vertical ÔÇö ap├│s colunas centro (65-84)
    { x: 590, y: 98, width: 50, height: 640 },

    // Corredor vertical ÔÇö entre colunas internas direitas (85-100) e coluna extrema (15-25)
    { x: 804, y: 98, width: 110, height: 640 },

    // Corredor horizontal meio (entre exposi├º├úo e pra├ºa)
    { x: 292, y: 360, width: 164, height: 14 },
];

// ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
// SETAS de fluxo e detalhes adicionais
// ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
export interface MapAnnotation {
    type: 'text' | 'arrow' | 'entrance';
    label: string;
    x: number;
    y: number;
    rotation?: number;
    fontSize?: number;
    color?: string;
}

export const annotations: MapAnnotation[] = [
    // P├ôRTICO DE ENTRADA
    { type: 'entrance', label: 'P├ôRTICO DE ENTRADA', x: 7, y: 450, rotation: -90, fontSize: 11, color: '#60a5fa' },

    // SA├ìDAS DE EMERG├èNCIA
    { type: 'text', label: 'ÔÜí SA├ìDA DE EMERG├èNCIA', x: 165, y: 905, fontSize: 8, color: '#fbbf24' },
    { type: 'text', label: 'ÔÜí SA├ìDA DE EMERG├èNCIA', x: 400, y: 905, fontSize: 8, color: '#fbbf24' },
    { type: 'text', label: 'ÔÜí SA├ìDA DE EMERG├èNCIA', x: 830, y: 905, fontSize: 8, color: '#fbbf24' },

    // Setas de fluxo (entrada)
    { type: 'arrow', label: 'ÔåÆ', x: 45, y: 92, fontSize: 14, color: '#ffffff' },
    { type: 'arrow', label: 'ÔåÆ', x: 45, y: 818, fontSize: 14, color: '#ffffff' },

    // Labels de metragem nos BARs
    { type: 'text', label: '12M┬▓', x: 153, y: 870, fontSize: 7, color: '#94a3b8' },
    { type: 'text', label: '12M┬▓', x: 231, y: 870, fontSize: 7, color: '#94a3b8' },
    { type: 'text', label: '12M┬▓', x: 533, y: 870, fontSize: 7, color: '#94a3b8' },
    { type: 'text', label: '12M┬▓', x: 611, y: 870, fontSize: 7, color: '#94a3b8' },
    { type: 'text', label: '21M┬▓', x: 382, y: 870, fontSize: 7, color: '#94a3b8' },
];

// ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
// MOCK DATA GENERATOR
// ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
export function generateMockStands(): Stand[] {
    const statuses: Stand['status'][] = ['disponivel', 'reservado', 'vendido'];
    const empresas = [
        'Tech Solutions', 'Digital Wave', 'InnovateTech', 'Smart Systems',
        'DataFlow', 'CloudPeak', 'NetBridge', 'CodeForge',
        'CyberCore', 'PixelHub', 'LogiTech Pro', 'MegaByte',
    ];

    return standPositions.map((pos, i) => {
        const randomStatus = statuses[Math.floor(Math.random() * 3)];
        return {
            id: `stand-${pos.numero}`,
            numero: pos.numero,
            status: randomStatus,
            empresa: randomStatus === 'vendido' ? empresas[i % empresas.length] :
                randomStatus === 'reservado' ? empresas[(i + 5) % empresas.length] : null,
            tipo: pos.tipo,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    });
}
