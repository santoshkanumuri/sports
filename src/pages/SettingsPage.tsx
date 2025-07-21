import React, { useState } from 'react';
import { Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { useCourts } from '../context/CourtContext';
import { GameType } from '../types';

export const SettingsPage: React.FC = () => {
  const { courts, addCourt, removeCourt, updateCourtSettings } = useCourts();
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtGameType, setNewCourtGameType] = useState<GameType>('B');
  const [editingCourt, setEditingCourt] = useState<number | null>(null);

  const handleAddCourt = () => {
    if (newCourtName.trim()) {
      addCourt(newCourtName.trim(), newCourtGameType);
      setNewCourtName('');
      setNewCourtGameType('B');
    }
  };

  const handleSaveCourtSettings = (courtId: number, settings: any) => {
    updateCourtSettings(courtId, settings);
    setEditingCourt(null);
  };

  const badmintonCourts = courts.filter(court => court.gameType === 'B');
  const pickleballCourts = courts.filter(court => court.gameType === 'P');

  const CourtEditor: React.FC<{ court: any }> = ({ court }) => {
    const [name, setName] = useState(court.name);
    const [gameType, setGameType] = useState<GameType>(court.gameType);
    const [openingTime, setOpeningTime] = useState(court.openingTime);
    const [closingTime, setClosingTime] = useState(court.closingTime);

    const handleSave = () => {
      handleSaveCourtSettings(court.id, {
        name,
        gameType,
        openingTime: Number(openingTime),
        closingTime: Number(closingTime)
      });
    };

    const formatTimeOptions = () => {
      const options = [];
      for (let i = 0; i < 24; i++) {
        const period = i >= 12 ? 'PM' : 'AM';
        const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i;
        options.push(
          <option key={i} value={i}>
            {displayHour}:00 {period}
          </option>
        );
      }
      return options;
    };

    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Court Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Game Type</label>
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value as GameType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="B">Badminton</option>
              <option value="P">Pickleball</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
            <select
              value={openingTime}
              onChange={(e) => setOpeningTime(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {formatTimeOptions()}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
            <select
              value={closingTime}
              onChange={(e) => setClosingTime(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {formatTimeOptions()}
            </select>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Save</span>
          </button>
          <button
            onClick={() => setEditingCourt(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const CourtCard: React.FC<{ court: any }> = ({ court }) => {
    const formatTime = (hour: number): string => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:00 ${period}`;
    };

    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{court.name}</h3>
            <p className="text-sm text-gray-600">
              {court.gameType === 'B' ? 'Badminton' : 'Pickleball'}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setEditingCourt(court.id)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to remove ${court.name}?`)) {
                  removeCourt(court.id);
                }
              }}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <p>Hours: {formatTime(court.openingTime)} - {formatTime(court.closingTime)}</p>
          <p>Court ID: {court.id}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage courts, schedules, and system configuration</p>
      </div>

      {/* Add New Court */}
      <div className="bg-white rounded-lg shadow border p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Court</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Court Name</label>
            <input
              type="text"
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
              placeholder="Enter court name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Game Type</label>
            <select
              value={newCourtGameType}
              onChange={(e) => setNewCourtGameType(e.target.value as GameType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="B">Badminton</option>
              <option value="P">Pickleball</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddCourt}
              disabled={!newCourtName.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Court</span>
            </button>
          </div>
        </div>
      </div>

      {/* Game Type Rules */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
          <div>
            <h3 className="text-yellow-800 font-medium mb-1">Game Type Validation Rules</h3>
            <p className="text-yellow-700 text-sm">
              Consecutive booking hours must have the same game type. For example: PPPP (valid) or BBBBB (valid), 
              but PBPB or BPBP (invalid). This ensures proper court setup and equipment consistency.
            </p>
          </div>
        </div>
      </div>

      {/* Badminton Courts */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Badminton Courts ({badmintonCourts.length})
        </h2>
        <div className="space-y-4">
          {badmintonCourts.map(court => (
            <div key={court.id}>
              {editingCourt === court.id ? (
                <CourtEditor court={court} />
              ) : (
                <CourtCard court={court} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pickleball Courts */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Pickleball Courts ({pickleballCourts.length})
        </h2>
        <div className="space-y-4">
          {pickleballCourts.map(court => (
            <div key={court.id}>
              {editingCourt === court.id ? (
                <CourtEditor court={court} />
              ) : (
                <CourtCard court={court} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Stats */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{courts.length}</div>
            <div className="text-sm text-gray-600">Total Courts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{badmintonCourts.length}</div>
            <div className="text-sm text-gray-600">Badminton Courts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{pickleballCourts.length}</div>
            <div className="text-sm text-gray-600">Pickleball Courts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{courts.length * 24}</div>
            <div className="text-sm text-gray-600">Total Time Slots</div>
          </div>
        </div>
      </div>
    </div>
  );
};