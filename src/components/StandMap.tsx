'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Stand } from '@/types/stand';
import { standPositions, specialAreas, corridors, annotations, SVG_W, SVG_H } from '@/data/mapLayout';
import { standTypeLabels } from '@/utils/standColors';
import StandItem from './StandItem';

interface StandMapProps {
    stands: Stand[];
    onStandClick: (stand: Stand) => void;
    selectedStandId?: string | null;
}

const MIN_ZOOM = 0.4;
const FULLSCREEN_CLASS = 'standmap-fullscreen';
const MAX_ZOOM = 4;

export default function StandMap({ stands, onStandClick, selectedStandId }: StandMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgContainerRef = useRef<HTMLDivElement>(null);

    /* ── state ── */
    const [tooltip, setTooltip] = useState<{ x: number; y: number; stand: Stand } | null>(null);
    const [zoom, setZoom] = useState(0.85);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const lastPanRef = useRef({ x: 0, y: 0 });

    // Search
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedStand, setHighlightedStand] = useState<number | null>(null);

    // Show/hide image overlay
    const [showImage, setShowImage] = useState(false);
    const [overlayOpacity, setOverlayOpacity] = useState(0.5);

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
            if (nz <= 0.85) { setZoom(0.85); setPan({ x: 0, y: 0 }); }
            else zoomAtPoint(nz, rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
    };
    const handleZoomReset = () => { setZoom(0.85); setPan({ x: 0, y: 0 }); };

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
                    if (newZoom <= 0.85) return { x: 0, y: 0 };
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
        if (zoom > 0.85) {
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
            if (zoom > 0.85) {
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
        } else if (e.touches.length === 1 && isPanning && zoom > 0.85) {
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

    /* ── Search ── */
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase().trim();
        const num = parseInt(q, 10);
        if (!isNaN(num)) {
            const stand = stands.find(s => s.numero === num);
            return stand ? [stand] : [];
        }
        return stands.filter(s => s.empresa?.toLowerCase().includes(q)).slice(0, 5);
    }, [searchQuery, stands]);

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
        setSearchQuery('');
    };

    const tipoColors: Record<string, string> = {
        ouro: '#f59e0b',
        prata: '#94a3b8',
        bronze: '#b45309',
        master: '#a855f7',
    };

    const zoomPercent = Math.round(zoom * 100);

    /* ── Fullscreen ── */
    const [isFullscreen, setIsFullscreen] = useState(false);
    const toggleFullscreen = useCallback(async () => {
        const el = containerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            await el.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    }, []);
    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full overflow-hidden bg-gray-950 rounded-2xl border border-gray-700/50 shadow-2xl">
            {/* ═══ TOP BAR ═══ */}
            <div className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-gray-900/90 backdrop-blur-md border-b border-gray-700/30">
                {/* Search */}
                <div className="relative flex-1 min-w-[140px] max-w-[220px]">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="🔍 Buscar stand..."
                        className="w-full bg-gray-800/90 border border-gray-600/50 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    />
                    {searchQuery.trim() && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600/50 rounded-lg shadow-2xl overflow-hidden z-50">
                            {searchResults.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => handleSearchSelect(s)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <span className="font-bold text-amber-400">#{String(s.numero).padStart(2, '0')}</span>
                                    {s.empresa && <span className="text-gray-400 text-xs truncate">{s.empresa}</span>}
                                </button>
                            ))}
                        </div>
                    )}
                    {searchQuery.trim() && searchResults.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600/50 rounded-lg shadow-2xl px-3 py-2 z-50">
                            <p className="text-gray-500 text-xs">Nenhum stand encontrado</p>
                        </div>
                    )}
                </div>



                {/* Zoom controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleZoomOut}
                        className="w-8 h-8 rounded-lg bg-gray-800/90 hover:bg-gray-700 text-white flex items-center justify-center text-base font-bold border border-gray-600/50 transition-all active:scale-95"
                    >−</button>
                    <div className="hidden sm:flex items-center gap-1.5 px-1">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-200"
                                style={{ width: `${((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%` }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleZoomReset}
                        className="h-8 px-2 rounded-lg bg-gray-800/90 hover:bg-gray-700 text-white flex items-center justify-center text-xs font-bold border border-gray-600/50 transition-all active:scale-95 min-w-[44px]"
                    >{zoomPercent}%</button>
                    <button
                        onClick={handleZoomIn}
                        className="w-8 h-8 rounded-lg bg-gray-800/90 hover:bg-gray-700 text-white flex items-center justify-center text-base font-bold border border-gray-600/50 transition-all active:scale-95"
                    >+</button>

                    {/* Fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Sair da tela cheia (ESC)' : 'Tela cheia'}
                        className="w-8 h-8 ml-1 rounded-lg bg-gray-800/90 hover:bg-amber-600 text-white flex items-center justify-center border border-gray-600/50 transition-all active:scale-95 text-sm"
                    >
                        {isFullscreen ? '⊠' : '⛶'}
                    </button>
                </div>
            </div>

            {/* ═══ Map container ═══ */}
            <div
                ref={svgContainerRef}
                className="w-full overflow-hidden pt-12"
                style={{
                    cursor: zoom > 0.65 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                    touchAction: 'none',
                    background: '#0f172a',
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
                        maxHeight: '82vh',
                        transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                        transformOrigin: 'center center',
                        transition: isPanning ? 'none' : 'transform 0.2s ease-out',
                        willChange: 'transform',
                    }}
                >
                    <defs>
                        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0c1222" />
                            <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.4" opacity="0.5" />
                        </pattern>
                        <filter id="highlight-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feFlood floodColor="#f59e0b" floodOpacity="0.7" result="color" />
                            <feComposite in="color" in2="blur" operator="in" result="glow" />
                            <feMerge>
                                <feMergeNode in="glow" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        {/* Clip to SVG bounds */}
                        <clipPath id="svgClip">
                            <rect width={SVG_W} height={SVG_H} />
                        </clipPath>
                    </defs>

                    {/* ─── BACKGROUND ─── */}
                    <rect width={SVG_W} height={SVG_H} fill="url(#bg-gradient)" />
                    <rect width={SVG_W} height={SVG_H} fill="url(#grid)" />

                    {/* ─── IMAGEM DE REFERÊNCIA (semitransparente) ─── */}
                    {showImage && (
                        <image
                            href="/mapa_t3.png"
                            x="0" y="0"
                            width={SVG_W} height={SVG_H}
                            opacity={overlayOpacity}
                            clipPath="url(#svgClip)"
                            style={{ mixBlendMode: 'luminosity' }}
                        />
                    )}

                    {/* ─── CORREDORES ─── */}
                    {corridors.map((c, i) => (
                        <rect
                            key={`corridor-${i}`}
                            x={c.x} y={c.y}
                            width={c.width} height={c.height}
                            fill="#0f172a"
                            stroke="#1e293b"
                            strokeWidth={0.5}
                            opacity={0.7}
                        />
                    ))}

                    {/* ─── ÁREAS ESPECIAIS ─── */}
                    {specialAreas.map((area) => (
                        <g key={area.id}>
                            {/* Fundo */}
                            <rect
                                x={area.x} y={area.y}
                                width={area.width} height={area.height}
                                rx={area.borderRadius ?? 4}
                                fill={area.id === 'lounge' ? '#fef5ea' : area.color}
                                opacity={area.id === 'lounge' ? 1 : 0.25}
                                stroke={area.color}
                                strokeWidth={area.id === 'lounge' ? 3 : 1.5}
                                strokeOpacity={0.8}
                            />
                            {/* Hachura diagonal (lounge) */}
                            {area.id === 'lounge' && (
                                <path
                                    d={(() => {
                                        const lines = [];
                                        const step = 17;
                                        for (let i = -area.height; i < area.width + area.height; i += step) {
                                            lines.push(`M ${area.x + Math.max(0, i)} ${area.y} L ${area.x + Math.min(area.width, i + area.height)} ${area.y + Math.min(area.height, i + area.height > area.width ? area.height - (i + area.height - area.width) : area.height)}`);
                                        }
                                        return lines.join(' ');
                                    })()}
                                    stroke={area.color}
                                    strokeWidth={0.8}
                                    opacity={0.07}
                                    clipPath={`url(#clip-${area.id})`}
                                />
                            )}
                            {/* Clip para hachura */}
                            {area.id === 'lounge' && (
                                <clipPath id={`clip-${area.id}`}>
                                    <rect x={area.x} y={area.y} width={area.width} height={area.height} rx={area.borderRadius ?? 4} />
                                </clipPath>
                            )}
                            {/* Ícone ☕ (lounge) */}
                            {area.id === 'lounge' && (
                                <text
                                    x={area.x + area.width / 2}
                                    y={area.y + area.height / 2 - 38}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize={30}
                                    className="select-none pointer-events-none"
                                >☕</text>
                            )}
                            {/* Label principal */}
                            {area.label && (
                                <text
                                    x={area.x + area.width / 2}
                                    y={area.y + area.height / 2 + (area.subLabel ? -4 : 0)}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill={area.textColor || area.color}
                                    fontSize={area.fontSize || 14}
                                    fontWeight="700"
                                    fontStyle={area.id === 'lounge' ? 'italic' : 'normal'}
                                    fontFamily={area.id === 'lounge' ? 'Georgia, serif' : 'inherit'}
                                    letterSpacing={area.id === 'lounge' ? '0.2em' : '0'}
                                    opacity={0.9}
                                    className="select-none pointer-events-none"
                                >
                                    {area.label}
                                </text>
                            )}
                            {/* SubLabel */}
                            {area.subLabel && (
                                <text
                                    x={area.x + area.width / 2}
                                    y={area.y + area.height / 2 + (area.fontSize || 14) + 8}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill={area.textColor || area.color}
                                    fontSize={9}
                                    fontWeight="500"
                                    letterSpacing="0.2em"
                                    opacity={0.65}
                                    className="select-none pointer-events-none"
                                >
                                    {area.subLabel.toUpperCase()}
                                </text>
                            )}
                        </g>
                    ))}

                    {/* ─── ANOTAÇÕES ─── */}
                    {annotations.map((a, i) => (
                        <text
                            key={`ann-${i}`}
                            x={a.x} y={a.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={a.color || '#94a3b8'}
                            fontSize={a.fontSize || 9}
                            fontWeight={a.type === 'entrance' ? 'bold' : 'normal'}
                            opacity={0.8}
                            transform={a.rotation ? `rotate(${a.rotation}, ${a.x}, ${a.y})` : undefined}
                            className="select-none pointer-events-none tracking-wide"
                        >
                            {a.label}
                        </text>
                    ))}

                    {/* ─── STANDS ─── */}
                    {standPositions.map((pos) => {
                        const stand = getStandByNumero(pos.numero);
                        return (
                            <g
                                key={pos.numero}
                                onMouseEnter={(e) => stand && handleMouseEnter(e, stand)}
                                onMouseLeave={handleMouseLeave}
                                filter={highlightedStand === pos.numero ? 'url(#highlight-glow)' : undefined}
                            >
                                <StandItem
                                    position={pos}
                                    stand={stand}
                                    onClick={onStandClick}
                                    isSelected={stand?.id === selectedStandId}
                                    isHighlighted={highlightedStand === pos.numero}
                                />
                            </g>
                        );
                    })}

                    {/* ─── BORDA DO MAPA ─── */}
                    <rect x="2" y="2" width={SVG_W - 4} height={SVG_H - 4} fill="none" stroke="#1e293b" strokeWidth="2" rx="6" opacity="0.8" />
                </svg>
            </div>

            {/* ═══ TOOLTIP ═══ */}
            {tooltip && (
                <div
                    className="absolute z-40 pointer-events-none bg-gray-900/95 border border-amber-500/40 rounded-xl px-3 py-2 shadow-2xl backdrop-blur-sm"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    <p className="text-amber-400 font-bold text-sm">
                        Stand {String(tooltip.stand.numero).padStart(2, '0')}
                    </p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: tipoColors[tooltip.stand.tipo] || '#94a3b8' }}>
                        {standTypeLabels[tooltip.stand.tipo] || tooltip.stand.tipo}
                    </p>
                    {tooltip.stand.empresa && (
                        <p className="text-gray-300 text-xs">{tooltip.stand.empresa}</p>
                    )}
                    <p className="text-gray-400 text-xs capitalize">{tooltip.stand.status}</p>
                </div>
            )}

            {/* ═══ Mobile hint ═══ */}
            {zoom <= 0.85 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:hidden z-10">
                    <p className="text-[10px] text-gray-500 bg-gray-900/80 px-3 py-1 rounded-full backdrop-blur-sm border border-gray-700/30">
                        Pinch para zoom • Toque para ver detalhes
                    </p>
                </div>
            )}
        </div>
    );
}
