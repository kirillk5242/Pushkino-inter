'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Edit, Trash2, Heart, MessageSquare, Camera, Bell, Tag } from 'lucide-react';
import { UserMarker, MapMarker } from '@/types/yandex-maps';

interface MarkerPanelProps {
  markers: MapMarker[];
  onAddMarker: (marker: UserMarker) => void;
  onEditMarker: (id: string, marker: Partial<UserMarker>) => void;
  onDeleteMarker: (id: string) => void;
  onMarkerClick: (marker: MapMarker) => void;
}

export const MarkerPanel: React.FC<MarkerPanelProps> = ({
  markers,
  onAddMarker,
  onEditMarker,
  onDeleteMarker,
  onMarkerClick
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMarker, setEditingMarker] = useState<string | null>(null);
  const [newMarker, setNewMarker] = useState({
    title: '',
    description: '',
    category: 'note' as 'favorite' | 'note' | 'reminder' | 'photo',
    isPrivate: false,
    tags: '',
    color: '#3b82f6'
  });

  const categories = [
    { id: 'favorite', label: 'Избранное', icon: Heart, color: '#ef4444' },
    { id: 'note', label: 'Заметка', icon: MessageSquare, color: '#3b82f6' },
    { id: 'reminder', label: 'Напоминание', icon: Bell, color: '#f59e0b' },
    { id: 'photo', label: 'Фото место', icon: Camera, color: '#10b981' }
  ];

  const colors = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#6b7280', '#000000'
  ];

  // Добавление новой метки
  const handleAddMarker = () => {
    if (!newMarker.title.trim()) return;

    const marker: UserMarker = {
      id: `user-${Date.now()}`,
      coordinates: [56.0184, 37.8547], // Временные координаты, будут заменены при клике по карте
      title: newMarker.title,
      description: newMarker.description,
      type: 'user',
      category: newMarker.category,
      isPrivate: newMarker.isPrivate,
      tags: newMarker.tags ? newMarker.tags.split(',').map(tag => tag.trim()) : [],
      color: newMarker.color,
      createdAt: new Date().toISOString()
    };

    onAddMarker(marker);
    setNewMarker({
      title: '',
      description: '',
      category: 'note',
      isPrivate: false,
      tags: '',
      color: '#3b82f6'
    });
    setShowAddForm(false);
  };

  // Редактирование метки
  const handleEditMarker = (markerId: string) => {
    const marker = markers.find(m => m.id === markerId) as UserMarker;
    if (!marker) return;

    setNewMarker({
      title: marker.title,
      description: marker.description || '',
      category: marker.category,
      isPrivate: marker.isPrivate,
      tags: marker.tags?.join(', ') || '',
      color: marker.color || '#3b82f6'
    });
    setEditingMarker(markerId);
    setShowAddForm(true);
  };

  // Сохранение изменений
  const handleSaveEdit = () => {
    if (!editingMarker || !newMarker.title.trim()) return;

    onEditMarker(editingMarker, {
      title: newMarker.title,
      description: newMarker.description,
      category: newMarker.category,
      isPrivate: newMarker.isPrivate,
      tags: newMarker.tags ? newMarker.tags.split(',').map(tag => tag.trim()) : [],
      color: newMarker.color
    });

    setEditingMarker(null);
    setShowAddForm(false);
    setNewMarker({
      title: '',
      description: '',
      category: 'note',
      isPrivate: false,
      tags: '',
      color: '#3b82f6'
    });
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setEditingMarker(null);
    setShowAddForm(false);
    setNewMarker({
      title: '',
      description: '',
      category: 'note',
      isPrivate: false,
      tags: '',
      color: '#3b82f6'
    });
  };

  // Получение иконки для категории
  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : MessageSquare;
  };

  // Получение цвета для категории
  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : '#3b82f6';
  };

  // Фильтрация пользовательских меток
  const userMarkers = markers.filter(m => m.type === 'user') as UserMarker[];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Мои метки ({userMarkers.length})
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1 text-blue-600 hover:text-blue-800"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Форма добавления/редактирования метки */}
      {showAddForm && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="space-y-3">
            {/* Название */}
            <input
              type="text"
              value={newMarker.title}
              onChange={(e) => setNewMarker({ ...newMarker, title: e.target.value })}
              placeholder="Название метки"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />

            {/* Описание */}
            <textarea
              value={newMarker.description}
              onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })}
              placeholder="Описание (необязательно)"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />

            {/* Категория */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Категория</label>
              <div className="grid grid-cols-2 gap-1">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setNewMarker({ ...newMarker, category: category.id as any })}
                      className={`flex items-center p-2 rounded text-xs ${
                        newMarker.category === category.id
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      } border`}
                    >
                      <IconComponent className="h-3 w-3 mr-1" />
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Цвет */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Цвет</label>
              <div className="flex space-x-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewMarker({ ...newMarker, color })}
                    className={`w-6 h-6 rounded-full border-2 ${
                      newMarker.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Теги */}
            <input
              type="text"
              value={newMarker.tags}
              onChange={(e) => setNewMarker({ ...newMarker, tags: e.target.value })}
              placeholder="Теги через запятую"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />

            {/* Приватность */}
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={newMarker.isPrivate}
                onChange={(e) => setNewMarker({ ...newMarker, isPrivate: e.target.checked })}
                className="mr-2"
              />
              Приватная метка
            </label>

            {/* Кнопки */}
            <div className="flex space-x-2">
              <button
                onClick={editingMarker ? handleSaveEdit : handleAddMarker}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 text-sm"
              >
                {editingMarker ? 'Сохранить' : 'Добавить'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-400 text-sm"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Список меток */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {userMarkers.map((marker) => {
          const IconComponent = getCategoryIcon(marker.category);
          return (
            <div
              key={marker.id}
              className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
              onClick={() => onMarkerClick(marker)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: marker.color }}
                    />
                    <IconComponent className="h-4 w-4 mr-1" style={{ color: getCategoryColor(marker.category) }} />
                    <span className="font-medium text-sm">{marker.title}</span>
                  </div>
                  {marker.description && (
                    <p className="text-xs text-gray-600 mb-1">{marker.description}</p>
                  )}
                  {marker.tags && marker.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {marker.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-200 text-gray-700"
                        >
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditMarker(marker.id);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMarker(marker.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {userMarkers.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Нет пользовательских меток</p>
            <p className="text-xs">Нажмите + чтобы добавить</p>
          </div>
        )}
      </div>
    </div>
  );
};
