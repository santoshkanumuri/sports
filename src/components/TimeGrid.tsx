import React, { useState } from 'react';
import { BookingStatus, GameType } from '../types';
import { useCourts } from '../context/CourtContext';

interface TimeGridProps {
  courtId: number;
  editable?: boolean;
}

export const TimeGrid: React.FC<TimeGridProps> = ({ courtId, editable = true }) => {
  const { courts, updateTimeSlot, validateGameTypeSequence } = useCourts();
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [bookingMode, setBookingMode] = useState<BookingStatus>('available');
  const [participant, setParticipant] = useState('');
  const [gameType, setGameType] = useState<GameType>('B');

  const court = courts.find(c => c.id === courtId);
  if (!court) return null;

  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case 'closed': return 'bg-gray-400';
      case 'available': return 'bg-green-500';
      case 'booked': return 'bg-orange-500';
      case 'paid': return 'bg-red-500';
      case 'playing': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusText = (status: BookingStatus): string => {
    switch (status) {
      case 'closed': return 'Closed';
      case 'available': return 'Available';
      case 'booked': return 'Booked';
      case 'paid': return 'Paid';
      case 'playing': return 'Playing';
      default: return 'Unknown';
    }
  };

  const formatTime = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const handleSlotClick = (hour: number) => {
    if (!editable) return;
    
    const slot = court.timeSlots[hour];
    
    if (selectedSlots.includes(hour)) {
      setSelectedSlots(prev => prev.filter(h => h !== hour));
    } else {
      setSelectedSlots(prev => [...prev, hour]);
    }
  };

  const handleBooking = () => {
    if (selectedSlots.length === 0) return;
    
    const sortedSlots = [...selectedSlots].sort((a, b) => a - b);
    const startHour = sortedSlots[0];
    const duration = sortedSlots.length;
    
    // Validate game type sequence
    if (bookingMode !== 'available' && bookingMode !== 'closed') {
      if (!validateGameTypeSequence(courtId, startHour, duration, gameType)) {
        alert('Invalid game type sequence. Consecutive hours must have the same game type.');
        return;
      }
    }
    
    // Update each selected slot
    sortedSlots.forEach((hour, index) => {
      const slotDuration = index === 0 ? duration : 0; // Only first slot gets the full duration
      updateTimeSlot(courtId, hour, bookingMode, gameType, participant, slotDuration);
    });
    
    setSelectedSlots([]);
    setParticipant('');
  };

  const getSlotInfo = (hour: number) => {
    const slot = court.timeSlots[hour];
    return (
      <div className="text-xs text-center">
        <div className="font-medium">{formatTime(hour)}</div>
        {slot.participant && (
          <div className="truncate mt-1">{slot.participant}</div>
        )}
        {slot.gameType && (
          <div className="font-bold mt-1">{slot.gameType}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {editable && (
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-lg font-medium mb-4">Booking Controls</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={bookingMode}
                onChange={(e) => setBookingMode(e.target.value as BookingStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="paid">Paid</option>
                <option value="playing">Playing</option>
                <option value="closed">Closed</option>
              </select>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Participant</label>
              <input
                type="text"
                value={participant}
                onChange={(e) => setParticipant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleBooking}
                disabled={selectedSlots.length === 0}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Update ({selectedSlots.length})
              </button>
            </div>
          </div>
          {selectedSlots.length > 0 && (
            <div className="text-sm text-gray-600">
              Selected: {selectedSlots.sort((a, b) => a - b).map(h => formatTime(h)).join(', ')}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{court.name}</h2>
        </div>
        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1 p-4">
          {court.timeSlots.map((slot, hour) => (
            <button
              key={hour}
              onClick={() => handleSlotClick(hour)}
              disabled={!editable}
              className={`
                aspect-square p-2 rounded-lg border-2 transition-all duration-200 text-white
                ${getStatusColor(slot.status)}
                ${selectedSlots.includes(hour) ? 'ring-4 ring-blue-300 ring-opacity-50 !bg-blue-300 !text-blue-900' : ''}
                ${editable ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
                ${!editable ? 'opacity-75' : ''}
              `}
              title={`${formatTime(hour)} - ${getStatusText(slot.status)} ${slot.participant ? `(${slot.participant})` : ''}`}
            >
              {getSlotInfo(hour)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Closed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Paid</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Playing</span>
          </div>
        </div>
      </div>
    </div>
  );
};