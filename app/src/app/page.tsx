'use client';

import { useState } from 'react';
import { YandexMap } from '@/components/map/YandexMap';
import { MapSearch } from '@/components/map/MapSearch';
import { RoutePanel } from '@/components/map/RoutePanel';
import { MarkerPanel } from '@/components/map/MarkerPanel';
import { MapMarker, SearchResult, UserMarker, RoutePoint, Route } from '@/types/yandex-maps';
import { YandexMapsAPI } from '@/lib/yandex/api';
import { MapPin, Navigation, Settings, Route as RouteIcon } from 'lucide-react';

export default function Home() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [activePanel, setActivePanel] = useState<'search' | 'route' | 'markers'>('search');
  // const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);

  // Временный API ключ для демонстрации (замените на настоящий)
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || 'demo-key';

  // Обработка поиска
  const handleSearch = async (query: string): Promise<SearchResult[]> => {
    try {
      const api = YandexMapsAPI.getInstance();
      if (!api.isAPILoaded()) {
        await api.loadAPI(apiKey);
      }
      return await api.geocode(query);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  // Обработка выбора результата поиска
  const handleSearchResultSelect = (result: SearchResult) => {
    // setSelectedLocation(result.coordinates);

    // Добавляем маркер для найденного места
    const newMarker: MapMarker = {
      id: `search-${Date.now()}`,
      coordinates: result.coordinates,
      title: result.name,
      description: result.address,
      type: 'attraction'
    };

    setMarkers(prev => [...prev.filter(m => !m.id.startsWith('search-')), newMarker]);
  };

  // Обработка клика по карте
  const handleMapClick = (coordinates: [number, number]) => {
    const newMarker: MapMarker = {
      id: `click-${Date.now()}`,
      coordinates,
      title: 'Выбранное место',
      description: `Координаты: ${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`,
      type: 'service'
    };

    setMarkers(prev => [...prev, newMarker]);
  };

  // Обработка запроса маршрута
  const handleRouteRequest = async (from: RoutePoint, to: RoutePoint, mode: string): Promise<Route | null> => {
    try {
      const api = YandexMapsAPI.getInstance();
      if (!api.isAPILoaded()) {
        await api.loadAPI(apiKey);
      }

      const routeResult = await api.buildRoute({
        from,
        to,
        routingMode: mode as any
      });

      const routeInfo = api.extractRouteInfo(routeResult);

      const route: Route = {
        id: `route-${Date.now()}`,
        from,
        to,
        distance: routeInfo.distance,
        duration: routeInfo.duration,
        routingMode: mode,
        coordinates: routeInfo.coordinates
      };

      setCurrentRoute(route);
      return route;
    } catch (error) {
      console.error('Route request error:', error);
      return null;
    }
  };

  // Очистка маршрута
  const handleClearRoute = () => {
    setCurrentRoute(null);
  };

  // Добавление пользовательской метки
  const handleAddUserMarker = (marker: UserMarker) => {
    setMarkers(prev => [...prev, marker]);
  };

  // Редактирование метки
  const handleEditMarker = (id: string, updates: Partial<UserMarker>) => {
    setMarkers(prev => prev.map(marker =>
      marker.id === id ? { ...marker, ...updates } : marker
    ));
  };

  // Удаление метки
  const handleDeleteMarker = (id: string) => {
    setMarkers(prev => prev.filter(marker => marker.id !== id));
  };

  // Клик по метке
  const handleMarkerClick = (marker: MapMarker) => {
    // Центрируем карту на метке
    console.log('Marker clicked:', marker);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Pushkino Inter
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActivePanel('search')}
                className={`p-2 rounded-md ${activePanel === 'search' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <MapPin className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActivePanel('route')}
                className={`p-2 rounded-md ${activePanel === 'route' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <RouteIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActivePanel('markers')}
                className={`p-2 rounded-md ${activePanel === 'markers' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Navigation className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Боковая панель */}
          <div className="lg:col-span-1 space-y-4">
            {/* Панель поиска */}
            {activePanel === 'search' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Поиск и навигация
                </h2>

                {/* Поиск */}
                <div className="mb-6">
                  <MapSearch
                    onSearch={handleSearch}
                    onResultSelect={handleSearchResultSelect}
                    placeholder="Найти в Пушкино..."
                  />
                </div>

                {/* Информация о маркерах */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Маркеры на карте ({markers.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {markers.map((marker) => (
                      <div
                        key={marker.id}
                        className="p-2 bg-gray-50 rounded text-sm cursor-pointer hover:bg-gray-100"
                        onClick={() => handleMarkerClick(marker)}
                      >
                        <div className="font-medium">{marker.title}</div>
                        <div className="text-gray-500 text-xs">
                          {marker.description}
                        </div>
                      </div>
                    ))}
                    {markers.length === 0 && (
                      <p className="text-sm text-gray-500">
                        Кликните по карте или найдите место для добавления маркеров
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Панель маршрутизации */}
            {activePanel === 'route' && (
              <RoutePanel
                onRouteRequest={handleRouteRequest}
                currentRoute={currentRoute}
                onClearRoute={handleClearRoute}
                onSearch={handleSearch}
              />
            )}

            {/* Панель пользовательских меток */}
            {activePanel === 'markers' && (
              <MarkerPanel
                markers={markers}
                onAddMarker={handleAddUserMarker}
                onEditMarker={handleEditMarker}
                onDeleteMarker={handleDeleteMarker}
                onMarkerClick={handleMarkerClick}
              />
            )}
          </div>

          {/* Карта */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <YandexMap
                apiKey={apiKey}
                markers={markers}
                onMapClick={handleMapClick}
                height="600px"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Информация */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Интерактивная карта Пушкино
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Исследуйте город Пушкино с помощью интерактивной карты.
              Найдите достопримечательности, маршруты транспорта и полезные места.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
