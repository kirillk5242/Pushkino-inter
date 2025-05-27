'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { SearchResult } from '@/types/yandex-maps';

interface MapSearchProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onResultSelect: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export const MapSearch: React.FC<MapSearchProps> = ({
  onSearch,
  onResultSelect,
  placeholder = "Поиск по Пушкино...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Обработка поиска с задержкой
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        const searchResults = await onSearch(query);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  // Закрытие результатов при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setQuery(result.name);
    setIsOpen(false);
    onResultSelect(result);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Поле поиска */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />

        {/* Кнопка очистки */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}

        {/* Индикатор загрузки */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          </div>
        )}
      </div>

      {/* Результаты поиска */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {result.name}
                  </p>
                  {result.description && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {result.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 truncate mt-1">
                    {result.address}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Сообщение об отсутствии результатов */}
      {isOpen && !isLoading && query && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-center text-sm text-gray-500">
            Ничего не найдено
          </div>
        </div>
      )}
    </div>
  );
};
