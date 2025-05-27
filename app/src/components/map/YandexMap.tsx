'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useYandexMap } from '@/hooks/useYandexMap';
import { YandexMapConfig, MapMarker } from '@/types/yandex-maps';
import { PUSHKINO_CONFIG, MAP_CONTROLS } from '@/types/yandex-maps';
import { Loader2 } from 'lucide-react';

interface YandexMapProps {
  apiKey: string;
  markers?: MapMarker[];
  onMapClick?: (coordinates: [number, number]) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
  height?: string;
  config?: Partial<YandexMapConfig>;
}

export const YandexMap: React.FC<YandexMapProps> = ({
  apiKey,
  markers = [],
  onMapClick,
  // onMarkerClick,
  className = '',
  height = '400px',
  config = {}
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [containerId, setContainerId] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  // Генерация ID только на клиенте для избежания ошибок гидратации
  useEffect(() => {
    setIsClient(true);
    setContainerId(`yandex-map-${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  // Конфигурация карты с настройками по умолчанию для Пушкино
  const mapConfig: YandexMapConfig = {
    apiKey,
    center: PUSHKINO_CONFIG.center,
    zoom: PUSHKINO_CONFIG.zoom,
    controls: MAP_CONTROLS,
    ...config
  };

  const {
    map,
    isLoading,
    error,
    addMarker,
    // removeMarker,
    clearMarkers
  } = useYandexMap({
    apiKey,
    config: mapConfig,
    containerId: containerId
  });

  // Добавление маркеров при изменении пропса markers
  useEffect(() => {
    if (!map || !markers.length) return;

    // Очищаем существующие маркеры
    clearMarkers();

    // Добавляем новые маркеры
    markers.forEach(marker => {
      addMarker(marker);
    });
  }, [map, markers, addMarker, clearMarkers]);

  // Обработка кликов по карте
  useEffect(() => {
    if (!map || !onMapClick) return;

    const handleMapClick = (e: unknown) => {
      const coords = e.get('coords');
      onMapClick(coords);
    };

    map.events.add('click', handleMapClick);

    return () => {
      map.events.remove('click', handleMapClick);
    };
  }, [map, onMapClick]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-gray-600">Ошибка загрузки карты</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Контейнер для карты */}
      {isClient && (
        <div
          ref={mapContainerRef}
          id={containerId}
          className="w-full h-full rounded-lg overflow-hidden"
        />
      )}

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
            <p className="text-sm text-gray-600">Загрузка карты...</p>
          </div>
        </div>
      )}

      {/* Информация о карте */}
      <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
        Пушкино • Яндекс.Карты
      </div>
    </div>
  );
};
