'use client';

import React from 'react';
import { Escolha, Stand, StandStatus } from '@/types/stand';
import {
    standTypeColors, standTypeBorderColors, standStatusColors, standStatusBorderColors,
    standTypeLabels, standStatusLabels, standSelectedColor,
} from '@/utils/standColors';
import { PARTES, isParcial } from '@/utils/partes';
import { StandPosition } from '@/data/mapLayout';

interface StandItemProps {
    position: StandPosition;
    stand: Stand | undefined;
    onClick: (stand: Stand) => void;
    /** O que está selecionado deste stand (inteiro ou terços). */
    escolha?: Escolha;
    isHighlighted?: boolean;
    isDimmed?: boolean;
}

const darkStatus = (s: StandStatus) => s !== 'disponivel';

export default function StandItem({ position, stand, onClick, escolha, isHighlighted, isDimmed }: StandItemProps) {
    const status = stand?.status || 'disponivel';
    const tipo = stand?.tipo || position.tipo || 'prata';
    const partes = stand?.partes ?? null;
    const isSelected = escolha === 'inteiro';
    const parcial = isParcial(escolha) ? escolha : null;
    const dividido = !!partes || !!parcial;
    // orientação: a já gravada no stand manda; senão, a da escolha em andamento
    const horizontal = (partes?.orientacao ?? parcial?.orientacao) === 'horizontal';

    const { x, y, width: w, height: h } = position;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const numFontSize = Math.max(11, Math.round(h * 0.34));

    // Cor de cada terço (ou do stand inteiro)
    const fillOf = (st: StandStatus) => (st === 'disponivel' ? (standTypeColors[tipo] || standStatusColors.disponivel) : standStatusColors[st]);
    const parteStatus = (p: 'A' | 'B' | 'C'): StandStatus => (partes ? partes[p].status : status);
    const parteSel = (p: 'A' | 'B' | 'C') => !!parcial && parcial.partes.includes(p);

    let fill = fillOf(status);
    let border = darkStatus(status) ? standStatusBorderColors[status] : (standTypeBorderColors[tipo] || standStatusBorderColors.disponivel);
    if (isSelected) { fill = standSelectedColor; border = '#0F2850'; }
    if (dividido) border = parcial ? '#0F2850' : '#5279AE';

    const empresa = !dividido ? stand?.empresa : null;
    const textDark = !dividido && darkStatus(status) && !isSelected;
    const textColor = textDark ? '#ffffff' : '#0F2850';

    const activate = () => stand && !isDimmed && onClick(stand);
    const thirdW = w / 3;
    const thirdH = h / 3;

    return (
        <g
            className={isDimmed ? 'pointer-events-none' : 'cursor-pointer group'}
            onClick={activate}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } }}
            role="button"
            tabIndex={isDimmed ? -1 : 0}
            aria-pressed={!!escolha}
            aria-label={`Stand ${position.numero} - ${standTypeLabels[tipo]} - ${partes
                ? PARTES.map(p => `${p} ${standStatusLabels[partes[p].status]}`).join(', ')
                : standStatusLabels[status]}${stand?.empresa ? ` - ${stand.empresa}` : ''}`}
            opacity={isDimmed ? 0.22 : 1}
            style={{ transition: 'opacity .2s', outline: 'none' }}
        >
            {dividido ? (
                <>
                    <clipPath id={`clip-stand-${position.numero}`}>
                        <rect x={x} y={y} width={w} height={h} rx={5} />
                    </clipPath>
                    <g clipPath={`url(#clip-stand-${position.numero})`}>
                        {PARTES.map((p, i) => (
                            <rect key={p}
                                x={horizontal ? x : x + i * thirdW} y={horizontal ? y + i * thirdH : y}
                                width={horizontal ? w : thirdW} height={horizontal ? thirdH : h}
                                fill={parteSel(p) ? standSelectedColor : fillOf(parteStatus(p))} />
                        ))}
                        <path d={horizontal
                            ? `M${x} ${y + thirdH}H${x + w}M${x} ${y + 2 * thirdH}H${x + w}`
                            : `M${x + thirdW} ${y}V${y + h}M${x + 2 * thirdW} ${y}V${y + h}`} stroke="#ffffff" strokeWidth={1.2} />
                    </g>
                    <rect x={x} y={y} width={w} height={h} rx={5} fill="none" stroke={border} strokeWidth={parcial ? 3 : 1.4}
                        className="transition-[stroke-width] duration-150 group-hover:[stroke-width:3] group-focus-visible:[stroke-width:3.5]" />
                </>
            ) : (
                <rect
                    id={`stand-${String(position.numero).padStart(3, '0')}`}
                    x={x} y={y} width={w} height={h} rx={5}
                    fill={fill}
                    stroke={border}
                    strokeWidth={isSelected ? 3 : 1.4}
                    className="transition-[stroke-width] duration-150 group-hover:[stroke-width:3] group-focus-visible:[stroke-width:3.5]"
                />
            )}

            <text
                x={cx}
                y={empresa ? cy - numFontSize * 0.25 : cy + 0.5}
                textAnchor="middle"
                dominantBaseline="central"
                fill={dividido ? '#0F2850' : textColor}
                stroke={dividido ? '#ffffff' : 'none'}
                strokeWidth={dividido ? 3 : 0}
                paintOrder="stroke"
                fontSize={numFontSize}
                fontWeight="800"
                fontFamily="'Montserrat', 'Arial', sans-serif"
                style={{ fontVariantNumeric: 'tabular-nums' }}
                className="pointer-events-none select-none"
            >
                {position.numero}
            </text>

            {empresa && (
                <text
                    x={cx}
                    y={cy + numFontSize * 0.6}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={textDark ? '#E2E8F0' : '#16376A'}
                    fontSize={6.5}
                    fontWeight="600"
                    fontFamily="'Montserrat', 'Arial', sans-serif"
                    className="pointer-events-none select-none"
                >
                    {empresa.length > 7 ? empresa.substring(0, 6) + '…' : empresa}
                </text>
            )}

            {isHighlighted && !escolha && (
                <rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} rx={9} fill="none" stroke={standSelectedColor} strokeWidth={5}>
                    <animate attributeName="opacity" values="1;0.3;1" dur="0.9s" repeatCount="indefinite" />
                </rect>
            )}
        </g>
    );
}
