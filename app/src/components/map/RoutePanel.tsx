'use client';

import React, { useState } from 'react';
import { Navigation, MapPin, Clock, Route as RouteIcon, X, Car, User, Bike, Bus } from 'lucide-react';
import { RoutePoint, Route } from '@/types/yandex-maps';

interface RoutePanelProps {
  onRouteRequest: (from: RoutePoint, to: RoutePoint, mode: string) => Promise<Route | null>;
  currentRoute?: Route | null;
  onClearRoute: () => void;
  onSearch: (query: string) => Promise<any[]>;
}

export const RoutePanel: React.FC<RoutePanelProps> = ({
  onRouteRequest,
  currentRoute,
  onClearRoute,
  onSearch
}) => {
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [routingMode, setRoutingMode] = useState<string>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const routingModes = [
    { id: 'auto', label: 'Автомобиль', icon: Car },
    { id: 'pedestrian', label: 'Пешком', icon: User },
    { id: 'bicycle', label: 'Велосипед', icon: Bike },
    { id: 'transit', label: 'Транспорт', icon: Bus }
  ];

  // Поиск для поля "Откуда"
  const handleFromSearch = async (query: string) => {
    setFromAddress(query);
    if (query.length > 2) {
      try {
        const results = await onSearch(query);
        setFromSuggestions(results);
        setShowFromSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setShowFromSuggestions(false);
    }
  };

  // Поиск для поля "Куда"
  const handleToSearch = async (query: string) => {
    setToAddress(query);
    if (query.length > 2) {
      try {
        const results = await onSearch(query);
        setToSuggestions(results);
        setShowToSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setShowToSuggestions(false);
    }
  };

  // Выбор адреса из предложений
  const selectFromAddress = (result: any) => {
    setFromAddress(result.name);
    setShowFromSuggestions(false);
  };

  const selectToAddress = (result: any) => {
    setToAddress(result.name);
    setShowToSuggestions(false);
  };

  // Построение маршрута
  const handleBuildRoute = async () => {
    if (!fromAddress || !toAddress) return;

    setIsLoading(true);
    try {
      // Получаем координаты для адресов
      const fromResults = await onSearch(fromAddress);
      const toResults = await onSearch(toAddress);

      if (fromResults.length === 0 || toResults.length === 0) {
        alert('Не удалось найти один из адресов');
        return;
      }

      const fromPoint: RoutePoint = {
        coordinates: fromResults[0].coordinates,
        address: fromAddress,
        name: fromAddress
      };

      const toPoint: RoutePoint = {
        coordinates: toResults[0].coordinates,
        address: toAddress,
        name: toAddress
      };

      await onRouteRequest(fromPoint, toPoint, routingMode);
    } catch (error) {
      console.error('Route building error:', error);
      alert('Ошибка при построении маршрута');
    } finally {
      setIsLoading(false);
    }
  };

  // Очистка маршрута
  const handleClearRoute = () => {
    setFromAddress('');
    setToAddress('');
    onClearRoute();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Navigation className="h-5 w-5 mr-2" />
          Маршрут
        </h3>
        {currentRoute && (
          <button
            onClick={handleClearRoute}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Поля ввода адресов */}
      <div className="space-y-3 mb-4">
        {/* Откуда */}
        <div className="relative">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={fromAddress}
              onChange={(e) => handleFromSearch(e.target.value)}
              placeholder="Откуда"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Предложения для "Откуда" */}
          {showFromSuggestions && fromSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {fromSuggestions.map((result, index) => (
                <button
                  key={index}
                  onClick={() => selectFromAddress(result)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  {result.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Куда */}
        <div className="relative">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={toAddress}
              onChange={(e) => handleToSearch(e.target.value)}
              placeholder="Куда"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Предложения для "Куда" */}
          {showToSuggestions && toSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {toSuggestions.map((result, index) => (
                <button
                  key={index}
                  onClick={() => selectToAddress(result)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                >
                  {result.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Выбор типа маршрута */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2">
          {routingModes.map((mode) => {
            const IconComponent = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setRoutingMode(mode.id)}
                className={`flex items-center justify-center p-2 rounded-md border text-sm ${
                  routingMode === mode.id
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="h-4 w-4 mr-1" />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Кнопка построения маршрута */}
      <button
        onClick={handleBuildRoute}
        disabled={!fromAddress || !toAddress || isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Построение...
          </>
        ) : (
          <>
            <RouteIcon className="h-4 w-4 mr-2" />
            Построить маршрут
          </>
        )}
      </button>

      {/* Информация о маршруте */}
      {currentRoute && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Маршрут построен</span>
            <span className="text-xs text-gray-500">{currentRoute.routingMode}</span>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {currentRoute.duration}
            </div>
            <div className="flex items-center">
              <RouteIcon className="h-3 w-3 mr-1" />
              {currentRoute.distance}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
