// Типы для работы с Яндекс.Картами API

export interface YandexMapConfig {
  apiKey: string;
  center: [number, number]; // [latitude, longitude]
  zoom: number;
  controls: string[];
}

export interface MapMarker {
  id: string;
  coordinates: [number, number];
  title: string;
  description?: string;
  type: 'attraction' | 'transport' | 'service' | 'work' | 'user' | 'route';
  icon?: string;
  category?: string;
  createdAt?: string;
  userId?: string;
}

export interface UserMarker extends MapMarker {
  type: 'user';
  category: 'favorite' | 'note' | 'reminder' | 'photo';
  isPrivate: boolean;
  tags?: string[];
  color?: string;
}

export interface RoutePoint {
  coordinates: [number, number];
  address?: string;
  name?: string;
}

export interface RouteOptions {
  from: RoutePoint;
  to: RoutePoint;
  routingMode?: 'auto' | 'pedestrian' | 'bicycle' | 'transit';
  avoidTrafficJams?: boolean;
}

export interface Route {
  id: string;
  from: RoutePoint;
  to: RoutePoint;
  distance: string;
  duration: string;
  routingMode: string;
  coordinates: [number, number][];
  instructions?: RouteInstruction[];
}

export interface RouteInstruction {
  text: string;
  distance: string;
  duration: string;
  coordinates: [number, number];
}

export interface SearchResult {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  address: string;
  category: string;
}

export interface WorkNotification {
  id: string;
  title: string;
  description: string;
  area: [number, number][];
  startDate: string;
  endDate: string;
  type: 'road_work' | 'utility_work' | 'event';
  severity: 'low' | 'medium' | 'high';
}

// Константы для Пушкино
export const PUSHKINO_CONFIG = {
  center: [56.0184, 37.8547] as [number, number], // Центр Пушкино
  zoom: 13,
  bounds: [
    [55.9800, 37.7800], // Юго-западный угол
    [56.0600, 37.9300]  // Северо-восточный угол
  ] as [[number, number], [number, number]]
};

export const MAP_CONTROLS = [
  'zoomControl',
  'searchControl',
  'typeSelector',
  'fullscreenControl',
  'geolocationControl'
];

export const MARKER_TYPES = {
  attraction: {
    color: '#e74c3c',
    icon: 'landmark'
  },
  transport: {
    color: '#3498db',
    icon: 'bus'
  },
  service: {
    color: '#2ecc71',
    icon: 'store'
  },
  work: {
    color: '#f39c12',
    icon: 'construction'
  }
} as const;
