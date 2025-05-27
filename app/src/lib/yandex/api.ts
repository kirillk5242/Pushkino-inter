// Утилиты для работы с Yandex Maps API

import { YandexMapConfig, RouteOptions, SearchResult } from '@/types/yandex-maps';

declare global {
  interface Window {
    ymaps: unknown;
  }
}

export class YandexMapsAPI {
  private static instance: YandexMapsAPI;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): YandexMapsAPI {
    if (!YandexMapsAPI.instance) {
      YandexMapsAPI.instance = new YandexMapsAPI();
    }
    return YandexMapsAPI.instance;
  }

  /**
   * Загружает Yandex Maps API
   */
  async loadAPI(apiKey: string): Promise<void> {
    if (this.isLoaded) return;

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // Проверяем, не загружен ли уже API
      if (window.ymaps) {
        this.isLoaded = true;
        resolve();
        return;
      }

      // Создаем script тег для загрузки API
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
      script.async = true;

      script.onload = () => {
        window.ymaps.ready(() => {
          this.isLoaded = true;
          resolve();
        });
      };

      script.onerror = () => {
        reject(new Error('Failed to load Yandex Maps API'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Создает карту
   */
  createMap(containerId: string, config: YandexMapConfig): unknown {
    if (!this.isLoaded || !window.ymaps) {
      throw new Error('Yandex Maps API not loaded');
    }

    // Проверяем, что элемент существует и имеет размеры
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Element with id "${containerId}" not found`);
    }

    if (element.offsetWidth === 0 || element.offsetHeight === 0) {
      throw new Error(`Element with id "${containerId}" has zero dimensions`);
    }

    const map = new (window.ymaps as any).Map(containerId, {
      center: config.center,
      zoom: config.zoom,
      controls: config.controls
    });

    return map;
  }

  /**
   * Создает маркер
   */
  createMarker(coordinates: [number, number], properties: unknown, options: unknown): unknown {
    if (!this.isLoaded || !window.ymaps) {
      throw new Error('Yandex Maps API not loaded');
    }

    return new (window.ymaps as any).Placemark(coordinates, properties, options);
  }

  /**
   * Поиск по адресу
   */
  async geocode(query: string): Promise<SearchResult[]> {
    if (!this.isLoaded || !window.ymaps) {
      throw new Error('Yandex Maps API not loaded');
    }

    try {
      const result = await (window.ymaps as any).geocode(query, {
        results: 10,
        boundedBy: [[55.9800, 37.7800], [56.0600, 37.9300]], // Ограничиваем поиск Пушкино
        strictBounds: true
      });

      const geoObjects = result.geoObjects;
      const results: SearchResult[] = [];

      for (let i = 0; i < geoObjects.getLength(); i++) {
        const geoObject = geoObjects.get(i);
        const coords = geoObject.geometry.getCoordinates();
        const name = geoObject.getAddressLine();
        const description = geoObject.properties.get('description') || '';

        results.push({
          id: `geocode_${i}`,
          name,
          description,
          coordinates: coords,
          address: name,
          category: 'address'
        });
      }

      return results;
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }

  /**
   * Построение маршрута
   */
  async buildRoute(options: RouteOptions): Promise<unknown> {
    if (!this.isLoaded || !window.ymaps) {
      throw new Error('Yandex Maps API not loaded');
    }

    const routingMode = this.getRoutingMode(options.routingMode || 'auto');

    try {
      const route = await (window.ymaps as any).route([
        options.from.coordinates,
        options.to.coordinates
      ], {
        routingMode,
        avoidTrafficJams: options.avoidTrafficJams || false
      });

      return route;
    } catch (error) {
      console.error('Route building error:', error);
      throw error;
    }
  }

  /**
   * Извлечение информации о маршруте
   */
  extractRouteInfo(routeObject: any): { distance: string; duration: string; coordinates: [number, number][] } {
    try {
      const route = routeObject.getRoutes().get(0);
      const distance = route.getLength();
      const duration = route.getJamsTime() || route.getTime();

      // Получаем координаты маршрута
      const coordinates: [number, number][] = [];
      const paths = route.getPaths();

      for (let i = 0; i < paths.getLength(); i++) {
        const path = paths.get(i);
        const segments = path.getSegments();

        for (let j = 0; j < segments.getLength(); j++) {
          const segment = segments.get(j);
          const geometry = segment.getGeometry();
          const coords = geometry.getCoordinates();
          coordinates.push(...coords);
        }
      }

      return {
        distance: this.formatDistance(distance),
        duration: this.formatDuration(duration),
        coordinates
      };
    } catch (error) {
      console.error('Error extracting route info:', error);
      return {
        distance: 'Неизвестно',
        duration: 'Неизвестно',
        coordinates: []
      };
    }
  }

  /**
   * Форматирование расстояния
   */
  private formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} м`;
    } else {
      return `${(meters / 1000).toFixed(1)} км`;
    }
  }

  /**
   * Форматирование времени
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} ч ${minutes} мин`;
    } else {
      return `${minutes} мин`;
    }
  }

  /**
   * Преобразует тип маршрута
   */
  private getRoutingMode(mode: string): string {
    const modes: { [key: string]: string } = {
      'auto': 'auto',
      'pedestrian': 'pedestrian',
      'bicycle': 'bicycle',
      'transit': 'masstransit'
    };

    return modes[mode] || 'auto';
  }

  /**
   * Проверяет, загружен ли API
   */
  isAPILoaded(): boolean {
    return this.isLoaded;
  }
}
