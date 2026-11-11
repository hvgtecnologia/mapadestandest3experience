'use client';

import React from 'react';
import { Stand } from '@/types/stand';
import { standTypeColors, standTypeBorderColors, standStatusColors, standStatusBorderColors, standTypeLabels, standStatusLabels } from '@/utils/standColors';
import { StandPosition } from '@/data/mapLayout';

interface StandItemProps {
    position: StandPosition;
    stand: Stand | undefined;
    onClick: (stand: Stand) => void;
    isSelected?: boolean;
    isHighlighted?: boolean;
}

export default function StandItem({ position, stand, onClick, isSelected, isHighlighted }: StandItemProps) {
    const status = stand?.status || 'disponivel';
    // stand.tipo (DB) tem prioridade — permite admin mudar cor alterando o tipo
    // position.tipo (mapLayout) é só o default inicial quando não há dado no banco
    const tipo = stand?.tipo || position.tipo || 'prata';
    const empresa = stand?.empresa;

    // Reservado/vendido pintam o stand inteiro; disponível usa a cor do tipo
    const isTaken = status !== 'disponivel';
    const fillColor = isTaken ? standStatusColors[status] : (standTypeColors[tipo] || '#2e8585');
    const borderColor = isTaken ? standStatusBorderColors[status] : (standTypeBorderColors[tipo] || '#0d2340');

    // Tamanhos baseados na célula do mapa
    const numFontSize = Math.max(11, Math.round(position.height * 0.27));
    const subFontSize = 9;

    // Texto escuro em fundos claros; branco em fundos escuros
    const lightBg = isTaken ? status === 'reservado' : (tipo === 'prata' || tipo === 'outro' || tipo === 'ouro');
    const textColor    = lightBg ? '#1a2540' : '#ffffff';
    const subTextColor = lightBg ? '#374151' : '#fee2e2';

    const cx = position.x + position.width / 2;
    const cy = position.y + position.height / 2;

    return (
        <g
            className="cursor-pointer"
            onClick={() => stand && onClick(stand)}
            role="button"
            tabIndex={0}
            aria-label={`Stand ${position.numero} - ${standTypeLabels[tipo]} - ${standStatusLabels[status]}${empresa ? ` - ${empresa}` : ''}`}
        >
            {/* Borda tipo */}
            <rect
                x={position.x - 3}
                y={position.y - 3}
                width={position.width + 6}
                height={position.height + 6}
                rx={6}
                fill="none"
                stroke={borderColor}
                strokeWidth={isSelected ? 6 : 3}
                opacity={isSelected ? 1 : 0.6}
            />

            {/* Preenchimento da cell */}
            <rect
                id={`stand-${String(position.numero).padStart(3, '0')}`}
                x={position.x}
                y={position.y}
                width={position.width}
                height={position.height}
                rx={4}
                fill={fillColor}
                opacity={0.95}
                className="hover:opacity-100 transition-opacity duration-150"
            />

            {/* Número do stand — grande e legível */}
            <text
                x={cx}
                y={cy - numFontSize * 0.15}
                textAnchor="middle"
                dominantBaseline="central"
                fill={textColor}
                fontSize={numFontSize}
                fontWeight="900"
                fontFamily="'Inter', 'Arial', sans-serif"
                className="pointer-events-none select-none"
            >
                {String(position.numero).padStart(2, '0')}
            </text>

            {/* Status label (empresa se houver) */}
            {empresa && (
                <text
                    x={cx}
                    y={cy + numFontSize * 0.55}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={subTextColor}
                    fontSize={subFontSize}
                    fontWeight="600"
                    className="pointer-events-none select-none"
                >
                    {empresa.length > 10 ? empresa.substring(0, 9) + '…' : empresa}
                </text>
            )}

            {/* Hover overlay */}
            <rect
                x={position.x}
                y={position.y}
                width={position.width}
                height={position.height}
                rx={4}
                fill="white"
                opacity={0}
                className="hover:opacity-[0.1] transition-opacity duration-150"
            />

            {/* Selecionado: pulsação */}
            {isSelected && (
                <rect
                    x={position.x - 6}
                    y={position.y - 6}
                    width={position.width + 12}
                    height={position.height + 12}
                    rx={8}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={4}
                    opacity={0.8}
                >
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite" />
                </rect>
            )}

            {/* Destaque de busca */}
            {isHighlighted && !isSelected && (
                <rect
                    x={position.x - 8}
                    y={position.y - 8}
                    width={position.width + 16}
                    height={position.height + 16}
                    rx={10}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={6}
                    opacity={0.9}
                >
                    <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
                    <animate attributeName="strokeWidth" values="6;10;6" dur="0.8s" repeatCount="indefinite" />
                </rect>
            )}
        </g>
    );
}
