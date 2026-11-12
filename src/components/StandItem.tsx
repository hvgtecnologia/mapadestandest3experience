'use client';

import React from 'react';
import { Stand } from '@/types/stand';
import {
    standTypeColors, standTypeBorderColors, standStatusColors, standStatusBorderColors,
    standTypeLabels, standStatusLabels, standSelectedColor,
} from '@/utils/standColors';
import { StandPosition } from '@/data/mapLayout';

interface StandItemProps {
    position: StandPosition;
    stand: Stand | undefined;
    onClick: (stand: Stand) => void;
    isSelected?: boolean;
    isHighlighted?: boolean;
    isDimmed?: boolean;
}

export default function StandItem({ position, stand, onClick, isSelected, isHighlighted, isDimmed }: StandItemProps) {
    const status = stand?.status || 'disponivel';
    // stand.tipo (DB) tem prioridade — position.tipo é só o default do layout
    const tipo = stand?.tipo || position.tipo || 'prata';
    const empresa = stand?.empresa;

    // Reservado/vendido pintam o stand inteiro; disponível usa a cor do tipo
    const isTaken = status !== 'disponivel';
    let fillColor = isTaken ? standStatusColors[status] : (standTypeColors[tipo] || standStatusColors.disponivel);
    let borderColor = isTaken ? standStatusBorderColors[status] : (standTypeBorderColors[tipo] || standStatusBorderColors.disponivel);
    if (isSelected) { fillColor = standSelectedColor; borderColor = '#0F2850'; }

    const darkFill = isTaken && !isSelected;
    const textColor = darkFill ? '#ffffff' : '#0F2850';
    const subTextColor = darkFill ? '#E2E8F0' : '#16376A';

    const numFontSize = Math.max(11, Math.round(position.height * 0.34));
    const cx = position.x + position.width / 2;
    const cy = position.y + position.height / 2;

    const activate = () => stand && !isDimmed && onClick(stand);

    return (
        <g
            className={isDimmed ? 'pointer-events-none' : 'cursor-pointer group'}
            onClick={activate}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } }}
            role="button"
            tabIndex={isDimmed ? -1 : 0}
            aria-pressed={!!isSelected}
            aria-label={`Stand ${position.numero} - ${standTypeLabels[tipo]} - ${standStatusLabels[status]}${empresa ? ` - ${empresa}` : ''}`}
            opacity={isDimmed ? 0.22 : 1}
            style={{ transition: 'opacity .2s', outline: 'none' }}
        >
            <rect
                id={`stand-${String(position.numero).padStart(3, '0')}`}
                x={position.x}
                y={position.y}
                width={position.width}
                height={position.height}
                rx={5}
                fill={fillColor}
                stroke={borderColor}
                strokeWidth={isSelected ? 3 : 1.4}
                className="transition-[stroke-width] duration-150 group-hover:[stroke-width:3] group-focus-visible:[stroke-width:3.5]"
            />

            <text
                x={cx}
                y={empresa ? cy - numFontSize * 0.25 : cy + 0.5}
                textAnchor="middle"
                dominantBaseline="central"
                fill={textColor}
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
                    fill={subTextColor}
                    fontSize={6.5}
                    fontWeight="600"
                    fontFamily="'Montserrat', 'Arial', sans-serif"
                    className="pointer-events-none select-none"
                >
                    {empresa.length > 7 ? empresa.substring(0, 6) + '…' : empresa}
                </text>
            )}

            {/* Destaque de busca */}
            {isHighlighted && !isSelected && (
                <rect
                    x={position.x - 6}
                    y={position.y - 6}
                    width={position.width + 12}
                    height={position.height + 12}
                    rx={9}
                    fill="none"
                    stroke={standSelectedColor}
                    strokeWidth={5}
                >
                    <animate attributeName="opacity" values="1;0.3;1" dur="0.9s" repeatCount="indefinite" />
                </rect>
            )}
        </g>
    );
}
