'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useStands } from '@/hooks/useStands';
import StandMap from '@/components/StandMap';
import StandModal from '@/components/StandModal';
import DashboardStats from '@/components/DashboardStats';
import { Stand } from '@/types/stand';
import Link from 'next/link';

export default function HomePage() {
  const { stands, loading, stats, updateStand } = useStands();
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  const handleStandClick = (stand: Stand) => {
    setSelectedStand(stand);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStand(null);
  };

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await mapWrapperRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listener para ESC sair do fullscreen
  React.useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              T3 Experience
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Mapa Interativo de Stands</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all text-sm font-medium border border-gray-700/50 hover:border-gray-600"
          >
            ⚙️ Admin
          </Link>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <DashboardStats stats={stats} />
      </div>

      {/* Map — largura total */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-8">
        <div
          ref={mapWrapperRef}
          className="relative"
          style={isFullscreen ? { background: '#0f172a', padding: '1rem' } : {}}
        >
          {/* Botão fullscreen */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800/90 hover:bg-gray-700 text-white border border-gray-600/50 transition-all shadow-lg text-base"
          >
            {isFullscreen ? '⛶' : '⛶'}
            <span className="sr-only">{isFullscreen ? 'Sair fullscreen' : 'Fullscreen'}</span>
          </button>

          <StandMap
            stands={stands}
            onStandClick={handleStandClick}
            selectedStandId={selectedStand?.id}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-4 text-center">
        <p className="text-sm text-gray-500">
          T3 Experience © {new Date().getFullYear()} • {stats.vendido} vendidos de {stats.total} stands
        </p>
      </footer>

      {/* Modal */}
      <StandModal
        stand={selectedStand}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={updateStand}
        isAdmin={false}
      />
    </div>
  );
}
