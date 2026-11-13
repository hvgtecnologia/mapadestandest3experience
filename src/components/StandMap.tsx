'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Escolha, Stand } from '@/types/stand';
import { standPositions, specialAreas, annotations, sectors, venueLines, sectorOf, SVG_W, SVG_H } from '@/data/mapLayout';
import { standStatusColors, standStatusBorderColors, standStatusLabels, standStatusAccent, standSelectedColor } from '@/utils/standColors';
import { StandStatus } from '@/types/stand';
import StandItem from './StandItem';

interface StandMapProps {
    stands: Stand[];
    onStandClick: (stand: Stand) => void;
    selectedStandId?: string | null;
    /** Seleção múltipla: id do stand → inteiro ou terços. */
    selecao?: Record<string, Escolha>;
}

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 4;

export default function StandMap({ stands, onStandClick, selectedStandId, selecao }: StandMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgContainerRef = useRef<HTMLDivElement>(null);

    /* ── state ── */
    const [tooltip, setTooltip] = useState<{ x: number; y: number; stand: Stand } | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const lastPanRef = useRef({ x: 0, y: 0 });

    // Search
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedStand, setHighlightedStand] = useState<number | null>(null);

    // Filtros
    const [sectorFilter, setSectorFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | StandStatus>('all');

    // Touch state
    const lastTouchDistRef = useRef<number | null>(null);
    const lastTouchCenterRef = useRef<{ x: number; y: number } | null>(null);
    const touchStartTimeRef = useRef(0);
    const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

    const getStandByNumero = useCallback(
        (numero: number) => stands.find((s) => s.numero === numero),
        [stands]
    );

    /* ── helpers to get SVG rect ── */
    const getSvgRect = useCallback(() => {
        return svgContainerRef.current?.getBoundingClientRect() ?? null;
    }, []);

    /* ── Clamp pan ── */
    const clampPan = useCallback((px: number, py: number, z: number) => {
        const container = svgContainerRef.current;
        if (!container) return { x: px, y: py };
        const rect = container.getBoundingClientRect();
        const scaledW = rect.width * z;
        const scaledH = rect.height * z;
        const maxPanX = Math.max(0, (scaledW - rect.width) / 2);
        const maxPanY = Math.max(0, (scaledH - rect.height) / 2);
        return {
            x: Math.max(-maxPanX, Math.min(maxPanX, px)),
            y: Math.max(-maxPanY, Math.min(maxPanY, py)),
        };
    }, []);

    /* ── Tooltip handlers ── */
    const handleMouseEnter = useCallback(
        (e: React.MouseEvent, stand: Stand) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
                setTooltip({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top - 10,
                    stand,
                });
            }
        },
        []
    );

    const handleMouseLeave = useCallback(() => {
        setTooltip(null);
    }, []);

    /* ── Zoom helpers ── */
    const zoomAtPoint = useCallback((newZoom: number, clientX: number, clientY: number) => {
        const rect = getSvgRect();
        if (!rect) return;
        const cx = clientX - rect.left - rect.width / 2;
        const cy = clientY - rect.top - rect.height / 2;
        setZoom(prevZoom => {
            const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
            const scale = clamped / prevZoom;
            setPan(prev => {
                const nx = cx - scale * (cx - prev.x);
                const ny = cy - scale * (cy - prev.y);
                return clampPan(nx, ny, clamped);
            });
            return clamped;
        });
    }, [getSvgRect, clampPan]);

    const handleZoomIn = () => {
        const rect = getSvgRect();
        if (rect) zoomAtPoint(zoom + 0.25, rect.left + rect.width / 2, rect.top + rect.height / 2);
    };
    const handleZoomOut = () => {
        const rect = getSvgRect();
        if (rect) {
            const nz = zoom - 0.1;
            if (nz <= 1) { setZoom(1); setPan({ x: 0, y: 0 }); }
            else zoomAtPoint(nz, rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
    };
    const handleZoomReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

    /* ── Wheel zoom ── */
    useEffect(() => {
        const el = svgContainerRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const rect = el.getBoundingClientRect();
            const cx = e.clientX - rect.left - rect.width / 2;
            const cy = e.clientY - rect.top - rect.height / 2;
            setZoom(prev => {
                const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta));
                const scale = newZoom / prev;
                setPan(prevPan => {
                    const nx = cx - scale * (cx - prevPan.x);
                    const ny = cy - scale * (cy - prevPan.y);
                    if (newZoom <= 1) return { x: 0, y: 0 };
                    return { x: nx, y: ny };
                });
                return newZoom;
            });
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    /* ── Mouse pan ── */
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (zoom > 1) {
            e.preventDefault();
            setIsPanning(true);
            panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
            lastPanRef.current = { x: pan.x, y: pan.y };
        }
    }, [zoom, pan]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning) {
            const nx = e.clientX - panStartRef.current.x;
            const ny = e.clientY - panStartRef.current.y;
            setPan(clampPan(nx, ny, zoom));
        }
    }, [isPanning, zoom, clampPan]);

    const handleMouseUp = useCallback(() => { setIsPanning(false); }, []);

    /* ── Touch handlers ── */
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDistRef.current = Math.hypot(dx, dy);
            lastTouchCenterRef.current = {
                x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
            };
        } else if (e.touches.length === 1) {
            touchStartTimeRef.current = Date.now();
            touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            if (zoom > 1) {
                setIsPanning(true);
                panStartRef.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
            }
        }
    }, [zoom, pan]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.hypot(dx, dy);
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            if (lastTouchDistRef.current !== null) {
                const scale = dist / lastTouchDistRef.current;
                zoomAtPoint(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * scale)), centerX, centerY);
            }
            lastTouchDistRef.current = dist;
            lastTouchCenterRef.current = { x: centerX, y: centerY };
        } else if (e.touches.length === 1 && isPanning && zoom > 1) {
            const nx = e.touches[0].clientX - panStartRef.current.x;
            const ny = e.touches[0].clientY - panStartRef.current.y;
            setPan(clampPan(nx, ny, zoom));
        }
    }, [zoom, isPanning, zoomAtPoint, clampPan]);

    const handleTouchEnd = useCallback(() => {
        lastTouchDistRef.current = null;
        lastTouchCenterRef.current = null;
        setIsPanning(false);
    }, []);

    /* ── Busca e filtros ── */
    const normalize = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

    const matchesFilters = useCallback((numero: number, stand?: Stand) => {
        const sec = sectorOf(numero);
        if (sectorFilter !== 'all' && String(sec?.numero) !== sectorFilter) return false;
        if (statusFilter !== 'all' && (stand?.status ?? 'disponivel') !== statusFilter) return false;
        const q = normalize(searchQuery.replace(/^stand\s*/i, ''));
        if (!q) return true;
        if (/^\d+$/.test(q)) return numero === Number(q);
        return normalize(`${sec?.nome ?? ''} ${stand?.empresa ?? ''}`).includes(q);
    }, [sectorFilter, statusFilter, searchQuery]);

    const isFiltering = sectorFilter !== 'all' || statusFilter !== 'all' || searchQuery.trim() !== '';

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return standPositions
            .filter(p => matchesFilters(p.numero, getStandByNumero(p.numero)))
            .map(p => getStandByNumero(p.numero))
            .filter((s): s is Stand => !!s)
            .slice(0, 8);
    }, [searchQuery, matchesFilters, getStandByNumero]);

    const focusOnStand = useCallback((numero: number) => {
        const pos = standPositions.find(p => p.numero === numero);
        if (!pos) return;
        setHighlightedStand(numero);
        const targetZoom = 2.5;
        setZoom(targetZoom);
        const rect = getSvgRect();
        if (rect) {
            const standCenterX = (pos.x + pos.width / 2) / SVG_W;
            const standCenterY = (pos.y + pos.height / 2) / SVG_H;
            const panX = (0.5 - standCenterX) * rect.width * targetZoom;
            const panY = (0.5 - standCenterY) * rect.height * targetZoom;
            setPan(clampPan(panX, panY, targetZoom));
        }
        setTimeout(() => setHighlightedStand(null), 3000);
    }, [getSvgRect, clampPan]);

    const handleSearchSelect = (stand: Stand) => {
        focusOnStand(stand.numero);
        onStandClick(stand);
        setSearchQuery('');
    };

    const counts = useMemo(() => {
        const c = { disponivel: 0, reservado: 0, vendido: 0 };
        standPositions.forEach(p => { c[getStandByNumero(p.numero)?.status ?? 'disponivel']++; });
        return c;
    }, [getStandByNumero]);

    // cores das anotações claras demais para o fundo claro
    const annotationColor: Record<string, string> = { '#22c55e': '#15803d', '#4ade80': '#3f8f5a', '#facc15': '#977235' };

    const zoomPercent = Math.round(zoom * 100);

    /* ── Fullscreen ── */
    const [isFullscreen, setIsFullscreen] = useState(false);
    const toggleFullscreen = useCallback(async () => {
        const el = containerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) await el.requestFullscreen();
        else await document.exitFullscreen();
    }, []);
    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    const control = 'h-10 rounded-xl bg-white/[.07] border border-[#C8CEDA]/35 text-white text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#D9B26A] transition-colors hover:bg-white/[.14]';
    const sectorOptions = sectors.filter(s => s.numero < 100).sort((a, b) => a.numero - b.numero);
    const tentOptions = sectors.filter(s => s.numero >= 100);

    return (
        <div ref={containerRef} className={`relative w-full overflow-hidden rounded-[26px] border border-[#C8CEDA]/25 bg-[#091B3B]/70 backdrop-blur-xl shadow-[0_30px_70px_-30px_rgba(0,0,0,.6)] ${isFullscreen ? 'flex flex-col h-full' : ''}`}>
            {/* ═══ TOOLBAR ═══ */}
            <div className="relative z-20 flex flex-wrap items-center gap-2.5 px-4 py-3.5 border-b border-[#C8CEDA]/25">
                <label className="relative flex-1 min-w-[170px]">
                    <span className="sr-only">Buscar stand, setor ou empresa</span>
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && searchResults[0]) handleSearchSelect(searchResults[0]); }}
                        placeholder="Buscar número, setor ou empresa"
                        className={`${control} w-full px-3 placeholder:text-[#8DA0C4]`}
                    />
                    {searchQuery.trim() && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0F2850] border border-[#C8CEDA]/30 rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                            {searchResults.length === 0 && <p className="px-3 py-2.5 text-[#9FB0CF] text-sm">Nenhum stand encontrado.</p>}
                            {searchResults.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => handleSearchSelect(s)}
                                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 flex items-center justify-between gap-3"
                                >
                                    <span className="font-bold">Stand {s.numero}</span>
                                    <span className="text-[#9FB0CF] text-xs truncate">{s.empresa || sectorOf(s.numero)?.nome}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </label>
                <label>
                    <span className="sr-only">Filtrar por setor</span>
                    <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} className={`${control} px-3`}>
                        <option className="text-[#0F2850]" value="all">Todos os setores</option>
                        {sectorOptions.map(s => (
                            <option className="text-[#0F2850]" key={s.numero} value={s.numero}>{String(s.numero).padStart(2, '0')} · {s.nome}</option>
                        ))}
                        {tentOptions.map(s => (
                            <option className="text-[#0F2850]" key={s.numero} value={s.numero}>Tenda · {s.nome}</option>
                        ))}
                    </select>
                </label>
                <label>
                    <span className="sr-only">Filtrar por status</span>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | StandStatus)} className={`${control} px-3`}>
                        <option className="text-[#0F2850]" value="all">Todos os status</option>
                        <option className="text-[#0F2850]" value="disponivel">Disponíveis</option>
                        <option className="text-[#0F2850]" value="reservado">Reservados</option>
                        <option className="text-[#0F2850]" value="vendido">Vendidos</option>
                    </select>
                </label>
                {isFiltering && (
                    <button onClick={() => { setSectorFilter('all'); setStatusFilter('all'); setSearchQuery(''); }} className={`${control} px-3 font-semibold`}>
                        Limpar
                    </button>
                )}
                <div className="flex items-center gap-1.5 ml-auto">
                    <button onClick={handleZoomOut} aria-label="Diminuir zoom" className={`${control} w-10 text-lg font-bold`}>−</button>
                    <button onClick={handleZoomReset} aria-label="Restaurar zoom" className={`${control} px-2 min-w-[56px] text-xs font-bold tabular-nums`}>{zoomPercent}%</button>
                    <button onClick={handleZoomIn} aria-label="Aumentar zoom" className={`${control} w-10 text-lg font-bold`}>+</button>
                    <button onClick={toggleFullscreen} title={isFullscreen ? 'Sair da tela cheia (ESC)' : 'Tela cheia'} className={`${control} w-10`}>
                        {isFullscreen ? '⊠' : '⛶'}
                    </button>
                </div>
            </div>

            {/* ═══ Mapa ═══ */}
            <div
                ref={svgContainerRef}
                className={`w-full overflow-hidden ${isFullscreen ? 'flex-1' : ''}`}
                style={{
                    cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                    touchAction: 'none',
                    background: 'linear-gradient(160deg,#F5F7FB,#E4E9F2)',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <svg
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    className="w-full h-auto"
                    style={{
                        maxHeight: isFullscreen ? '100%' : '80vh',
                        transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                        transformOrigin: 'center center',
                        transition: isPanning ? 'none' : 'transform 0.2s ease-out',
                        willChange: 'transform',
                        fontFamily: "'Montserrat', Arial, sans-serif",
                    }}
                >
                    <defs>
                        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#D7DFED" strokeWidth="0.8" />
                        </pattern>
                    </defs>

                    <rect width={SVG_W} height={SVG_H} fill="#EEF2F8" />
                    <rect width={SVG_W} height={SVG_H} fill="url(#grid)" />

                    {/* ─── CONTORNO DO TERRENO ─── */}
                    {venueLines.map((d, i) => (
                        <path key={`venue-${i}`} d={d} fill={i === 0 ? '#F7F9FD' : 'none'} stroke="#9EB1CF" strokeWidth={2.5} strokeLinejoin="round" />
                    ))}

                    {/* ─── ÁREAS ESPECIAIS ─── */}
                    {specialAreas.map((area) => {
                        const isStreet = area.id === 'rua-carlos' || area.id === 'av-geraldo';
                        return (
                            <g key={area.id} className="select-none pointer-events-none">
                                <rect
                                    x={area.x} y={area.y}
                                    width={area.width} height={area.height}
                                    rx={area.borderRadius ?? 4}
                                    fill={isStreet ? '#CCD8EB' : area.color}
                                    fillOpacity={isStreet ? 1 : 0.1}
                                    stroke={isStreet ? 'none' : area.color}
                                    strokeOpacity={0.55}
                                    strokeWidth={1.4}
                                />
                                {area.label && (
                                    <text
                                        x={area.x + area.width / 2}
                                        y={area.y + area.height / 2 + (area.subLabel ? -4 : 0)}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fill={isStreet ? '#52678A' : area.color}
                                        fontSize={area.fontSize || 14}
                                        fontWeight="800"
                                        letterSpacing={isStreet ? '0.18em' : '0.04em'}
                                        transform={area.rotation ? `rotate(${area.rotation}, ${area.x + area.width / 2}, ${area.y + area.height / 2})` : undefined}
                                    >
                                        {area.id === 'centro-eventos'
                                            ? <tspan fill="#0F2850" fontFamily="'Bebas Neue', sans-serif" fontWeight="400" fontSize={44} letterSpacing="0.02em">{area.label}</tspan>
                                            : area.label}
                                    </text>
                                )}
                                {area.subLabel && (
                                    <text
                                        x={area.x + area.width / 2}
                                        y={area.y + area.height / 2 + (area.id === 'centro-eventos' ? 30 : (area.fontSize || 14) + 6)}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fill={area.id === 'centro-eventos' ? '#52678A' : area.color}
                                        fontSize={area.id === 'centro-eventos' ? 15 : 9}
                                        fontWeight="700"
                                        letterSpacing="0.16em"
                                    >
                                        {area.subLabel.toUpperCase()}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* ─── ANOTAÇÕES ─── */}
                    {annotations.map((a, i) => (
                        <text
                            key={`ann-${i}`}
                            x={a.x} y={a.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={annotationColor[a.color ?? ''] || a.color || '#52678A'}
                            fontSize={a.fontSize || 9}
                            fontWeight={700}
                            letterSpacing="0.06em"
                            transform={a.rotation ? `rotate(${a.rotation}, ${a.x}, ${a.y})` : undefined}
                            className="select-none pointer-events-none"
                        >
                            {a.label}
                        </text>
                    ))}

                    {/* ─── ETIQUETAS DOS SETORES ─── */}
                    {sectors.map((s) => {
                        const h = 32;
                        const badgeR = 15;
                        const badgeW = s.hideBadge ? 0 : badgeR * 2 + 4;
                        const avail = s.labelW - badgeW - 14;
                        const nome = s.nome.toUpperCase();
                        const fit = (len: number) => Math.min(14, Math.floor(avail / (len * 0.62)));
                        // nome longo: quebra em duas linhas (após espaço ou "/") se ficar mais legível
                        let linhas = [nome];
                        let fs = fit(nome.length);
                        if (fs < 11) {
                            for (let k = 1; k < nome.length; k++) {
                                const quebra = nome[k - 1] === '/' ? k : nome[k] === ' ' ? k : -1;
                                if (quebra < 0) continue;
                                const l1 = nome.slice(0, quebra).trim(), l2 = nome.slice(quebra).trim();
                                const f2 = Math.min(12, fit(Math.max(l1.length, l2.length)));
                                if (f2 > fs) { fs = f2; linhas = [l1, l2]; }
                            }
                        }
                        const active = sectorFilter === String(s.numero);
                        return (
                            <g key={`sector-${s.numero}`} className="select-none pointer-events-none">
                                <rect x={s.labelX} y={s.labelY} width={s.labelW} height={h} rx={h / 2}
                                    fill={active ? '#16376A' : '#0F2850'} stroke={standSelectedColor} strokeWidth={active ? 2.5 : 0} />
                                {!s.hideBadge && (<>
                                    <circle cx={s.labelX + badgeR + 1} cy={s.labelY + h / 2} r={badgeR} fill={standSelectedColor} />
                                    <text x={s.labelX + badgeR + 1} y={s.labelY + h / 2 + 1} textAnchor="middle" dominantBaseline="central"
                                        fill="#091B3B" fontSize={14} fontWeight="900">
                                        {String(s.numero).padStart(2, '0')}
                                    </text>
                                </>)}
                                <text x={s.labelX + badgeW + (s.labelW - badgeW) / 2} y={s.labelY + h / 2 + 0.5}
                                    textAnchor="middle" dominantBaseline="central" fill="#ffffff" fontSize={fs} fontWeight="800" letterSpacing="0.03em">
                                    {linhas.map((l, i) => (
                                        <tspan key={i} x={s.labelX + badgeW + (s.labelW - badgeW) / 2}
                                            dy={linhas.length === 1 ? 0 : i === 0 ? -fs * 0.55 : fs * 1.1}>{l}</tspan>
                                    ))}
                                </text>
                            </g>
                        );
                    })}

                    {/* ─── STANDS ─── */}
                    {standPositions.map((pos) => {
                        const stand = getStandByNumero(pos.numero);
                        return (
                            <g key={pos.numero} onMouseEnter={(e) => stand && handleMouseEnter(e, stand)} onMouseLeave={handleMouseLeave}>
                                <StandItem
                                    position={pos}
                                    stand={stand}
                                    onClick={onStandClick}
                                    escolha={stand ? (selecao?.[stand.id] ?? (stand.id === selectedStandId ? 'inteiro' : undefined)) : undefined}
                                    isHighlighted={highlightedStand === pos.numero}
                                    isDimmed={isFiltering && !matchesFilters(pos.numero, stand)}
                                />
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* ═══ LEGENDA ═══ */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 border-t border-[#C8CEDA]/25 text-xs text-[#C8CEDA]">
                {(['disponivel', 'vendido', 'reservado'] as StandStatus[]).map(st => (
                    <span key={st} className="flex items-center gap-1.5">
                        <i className="inline-block w-3 h-3 rounded-[3px]" style={{ background: standStatusColors[st], border: `1px solid ${st === 'reservado' ? '#C8CEDA' : standStatusBorderColors[st]}` }} />
                        {standStatusLabels[st]}
                    </span>
                ))}
                <span className="flex items-center gap-1.5">
                    <i className="inline-block w-3 h-3 rounded-[3px]" style={{ background: standSelectedColor, border: '1px solid #8D692D' }} />
                    Selecionado
                </span>
                <span className="flex items-center gap-1.5">
                    <i className="inline-flex w-[18px] h-3 rounded-[3px] overflow-hidden border border-[#5279AE]">
                        <i className="flex-1 bg-[#C62828]" /><i className="flex-1 bg-[#D7E5FA] border-x border-white" /><i className="flex-1 bg-[#D7E5FA]" />
                    </i>
                    Vendido em terços (A | B | C)
                </span>
                <b className="sm:ml-auto font-semibold text-[#9FB0CF]">
                    {counts.disponivel} disponíveis · {counts.vendido} vendidos · {counts.reservado} reservados
                </b>
            </div>

            {/* ═══ TOOLTIP ═══ */}
            {tooltip && (
                <div
                    className="absolute z-40 pointer-events-none bg-[#091B3B]/95 border border-[#D9B26A]/50 rounded-xl px-3 py-2 shadow-2xl"
                    style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
                >
                    <p className="text-white font-bold text-sm">Stand {tooltip.stand.numero}</p>
                    {sectorOf(tooltip.stand.numero) && (
                        <p className="text-[#C8CEDA] text-xs font-semibold">
                            {sectorOf(tooltip.stand.numero)!.hideBadge ? '' : `Setor ${String(sectorOf(tooltip.stand.numero)!.numero).padStart(2, '0')} · `}{sectorOf(tooltip.stand.numero)!.nome}
                        </p>
                    )}
                    <p className="text-xs font-bold mt-0.5" style={{ color: standStatusAccent[tooltip.stand.status] }}>
                        {standStatusLabels[tooltip.stand.status]}{tooltip.stand.empresa ? ` · ${tooltip.stand.empresa}` : ''}
                    </p>
                </div>
            )}

            {zoom <= 1 && (
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 sm:hidden z-10">
                    <p className="text-[10px] text-[#C8CEDA] bg-[#091B3B]/85 px-3 py-1 rounded-full">
                        Pinça para zoom · toque para ver detalhes
                    </p>
                </div>
            )}
        </div>
    );
}
