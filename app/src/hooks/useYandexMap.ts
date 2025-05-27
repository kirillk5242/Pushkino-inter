'use client';

import { useEffect, useRef, useState } from 'react';
import { YandexMapsAPI } from '@/lib/yandex/api';
import { YandexMapConfig, MapMarker } from '@/types/yandex-maps';

interface UseYandexMapProps {
  apiKey: string;
  config: YandexMapConfig;
  containerId: string;
}

export const useYandexMap = ({ apiKey, config, containerId }: UseYandexMapProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<unknown>(null);
  const markersRef = useRef<Map<string, unknown>>(new Map());
  const routeRef = useRef<unknown>(null);
  const apiRef = useRef<YandexMapsAPI>(YandexMapsAPI.getInstance());

  // Инициализация карты
  useEffect(() => {
    // Не инициализируем карту, пока containerId не установлен
    if (!containerId) return;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Ждем, пока DOM элемент станет доступным
        const waitForElement = () => {
          return new Promise<void>((resolve) => {
            const checkElement = () => {
              const element = document.getElementById(containerId);
              if (element && element.offsetWidth > 0) {
                resolve();
              } else {
                setTimeout(checkElement, 50);
              }
            };
            checkElement();
          });
        };

        await waitForElement();

        // Загружаем API
        await apiRef.current.loadAPI(apiKey);

        // Создаем карту
        const mapInstance = apiRef.current.createMap(containerId, config);
        setMap(mapInstance);

        setIsLoading(false);
      } catch (err) {
        console.error('Map initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize map');
        setIsLoading(false);
      }
    };

    initMap();
  }, [apiKey, containerId, config]);

  // Добавление маркера
  const addMarker = (marker: MapMarker) => {
    if (!map || !apiRef.current.isAPILoaded()) return;

    try {
      const placemark = apiRef.current.createMarker(
        marker.coordinates,
        {
          balloonContent: `
            <div>
              <h3>${marker.title}</h3>
              ${marker.description ? `<p>${marker.description}</p>` : ''}
            </div>
          `,
          hintContent: marker.title
        },
        {
          preset: getMarkerPreset(marker.type),
          iconColor: getMarkerColor(marker.type)
        }
      );

      map.geoObjects.add(placemark);
      markersRef.current.set(marker.id, placemark);
    } catch (err) {
      console.error('Error adding marker:', err);
    }
  };

  // Удаление маркера
  const removeMarker = (markerId: string) => {
    if (!map) return;

    const marker = markersRef.current.get(markerId);
    if (marker) {
      map.geoObjects.remove(marker);
      markersRef.current.delete(markerId);
    }
  };

  // Очистка всех маркеров
  const clearMarkers = () => {
    if (!map) return;

    markersRef.current.forEach((marker) => {
      map.geoObjects.remove(marker);
    });
    markersRef.current.clear();
  };

  // Центрирование карты на координатах
  const centerMap = (coordinates: [number, number], zoom?: number) => {
    if (!map) return;

    map.setCenter(coordinates, zoom || map.getZoom());
  };

  // Установка границ карты
  const setBounds = (bounds: [[number, number], [number, number]]) => {
    if (!map) return;

    map.setBounds(bounds);
  };

  // Поиск
  const search = async (query: string) => {
    if (!apiRef.current.isAPILoaded()) {
      throw new Error('API not loaded');
    }

    return await apiRef.current.geocode(query);
  };

  // Построение маршрута
  const buildRoute = async (from: [number, number], to: [number, number], routingMode = 'auto') => {
    if (!map || !apiRef.current.isAPILoaded()) {
      throw new Error('Map or API not ready');
    }

    try {
      // Удаляем предыдущий маршрут
      if (routeRef.current) {
        (map as any).geoObjects.remove(routeRef.current);
      }

      const route = await apiRef.current.buildRoute({
        from: { coordinates: from },
        to: { coordinates: to },
        routingMode: routingMode as any
      });

      (map as any).geoObjects.add(route);
      routeRef.current = route;

      // Извлекаем информацию о маршруте
      const routeInfo = apiRef.current.extractRouteInfo(route);

      return {
        route,
        ...routeInfo
      };
    } catch (err) {
      console.error('Route building error:', err);
      throw err;
    }
  };

  // Очистка маршрута
  const clearRoute = () => {
    if (!map || !routeRef.current) return;

    try {
      (map as any).geoObjects.remove(routeRef.current);
      routeRef.current = null;
    } catch (err) {
      console.error('Error clearing route:', err);
    }
  };

  return {
    map,
    isLoading,
    error,
    addMarker,
    removeMarker,
    clearMarkers,
    centerMap,
    setBounds,
    search,
    buildRoute,
    clearRoute
  };
};

// Вспомогательные функции для маркеров
const getMarkerPreset = (type: string): string => {
  const presets: { [key: string]: string } = {
    attraction: 'islands#redIcon',
    transport: 'islands#blueIcon',
    service: 'islands#greenIcon',
    work: 'islands#orangeIcon'
  };

  return presets[type] || 'islands#blueIcon';
};

const getMarkerColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    attraction: '#e74c3c',
    transport: '#3498db',
    service: '#2ecc71',
    work: '#f39c12'
  };

  return colors[type] || '#3498db';
};
