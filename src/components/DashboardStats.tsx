'use client';

import React from 'react';
import { standStatusAccent } from '@/utils/standColors';

interface DashboardStatsProps {
    stats: {
        total: number;
        disponivel: number;
        reservado: number;
        vendido: number;
    };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
    const cards = [
        { label: 'Disponíveis', value: stats.disponivel, color: standStatusAccent.disponivel },
        { label: 'Reservados', value: stats.reservado, color: standStatusAccent.reservado },
        { label: 'Vendidos', value: stats.vendido, color: standStatusAccent.vendido },
    ];

    return (
        <div className="flex gap-2 sm:gap-3">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="flex-1 min-w-0 px-3 sm:px-4 pt-2.5 pb-2 rounded-[18px] border border-[#C8CEDA]/25 bg-[#091B3B]/60 backdrop-blur-md"
                >
                    <b className="block font-display text-[44px] leading-[.95] tabular-nums" style={{ color: card.color }}>
                        {card.value}
                    </b>
                    <span className="block mt-1.5 text-[10px] sm:text-[11px] font-bold tracking-[.1em] sm:tracking-[.2em] uppercase text-[#C8CEDA]">
                        {card.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
