import React, { useEffect, useState } from 'react';
import { Clock, Users, Calendar } from 'lucide-react';
import { useCourts } from '../context/CourtContext';

export const PlayingPage: React.FC = () => {
  const { getCurrentlyPlaying, getUpcomingSessions, courts } = useCourts();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentlyPlaying = getCurrentlyPlaying();
  const upcomingSessions = getUpcomingSessions();

  const formatTime = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getGameTypeName = (gameType: string): string => {
    return gameType === 'B' ? 'Badminton' : 'Pickleball';
  };

  const getNextAvailableSlot = (courtId: number, fromHour: number) => {
    const court = courts.find(c => c.id === courtId);
    if (!court) return null;

    for (let hour = fromHour; hour < 24; hour++) {
      const slot = court.timeSlots[hour];
      if (slot.status === 'available') {
        return hour;
      }
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Now Playing</h1>
        <p className="text-gray-600">Current active sessions and upcoming bookings</p>
        <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
          <Clock size={16} />
          <span>Current time: {currentTime.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currently Playing */}
        <div className="bg-white rounded-lg shadow border">
          <div className="bg-blue-50 px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-blue-900 flex items-center">
              <Users className="mr-2" size={20} />
              Currently Playing ({currentlyPlaying.length})
            </h2>
          </div>
          <div className="p-6">
            {currentlyPlaying.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No active sessions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentlyPlaying.map(({ court, slot, hour }) => {
                  const nextAvailable = getNextAvailableSlot(court.id, hour + 1);
                  return (
                    <div key={`${court.id}-${hour}`} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-blue-900">{court.name}</h3>
                        <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded">
                          {getGameTypeName(slot.gameType || court.gameType)}
                        </span>
                      </div>
                      <div className="text-sm text-blue-700 space-y-1">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-2" />
                          <span>Playing: {formatTime(hour)} - {formatTime(hour + 1)}</span>
                        </div>
                        {slot.participant && (
                          <div className="flex items-center">
                            <Users size={14} className="mr-2" />
                            <span>Player: {slot.participant}</span>
                          </div>
                        )}
                        {nextAvailable && (
                          <div className="text-green-600">
                            <span>Next available: {formatTime(nextAvailable)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow border">
          <div className="bg-orange-50 px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-orange-900 flex items-center">
              <Calendar className="mr-2" size={20} />
              Upcoming Sessions ({upcomingSessions.length})
            </h2>
          </div>
          <div className="p-6">
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No upcoming sessions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map(({ court, slot, hour }) => (
                  <div key={`upcoming-${court.id}-${hour}`} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-orange-900">{court.name}</h3>
                      <div className="flex space-x-2">
                        <span className="text-sm bg-orange-600 text-white px-2 py-1 rounded">
                          {getGameTypeName(slot.gameType || court.gameType)}
                        </span>
                        <span className={`text-sm px-2 py-1 rounded text-white ${
                          slot.status === 'paid' ? 'bg-red-500' : 'bg-orange-500'
                        }`}>
                          {slot.status === 'paid' ? 'Paid' : 'Booked'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-orange-700 space-y-1">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-2" />
                        <span>Starting: {formatTime(hour)} - {formatTime(hour + (slot.duration || 1))}</span>
                      </div>
                      {slot.participant && (
                        <div className="flex items-center">
                          <Users size={14} className="mr-2" />
                          <span>Player: {slot.participant}</span>
                        </div>
                      )}
                      {slot.duration && slot.duration > 1 && (
                        <div className="text-orange-600">
                          <span>Duration: {slot.duration} hour{slot.duration !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div className="text-sm text-orange-600">
                        <span>Starts in: {hour - new Date().getHours()} hour{(hour - new Date().getHours()) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Courts Status Summary */}
      <div className="mt-8 bg-white rounded-lg shadow border">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Courts Status Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {courts.map(court => {
              const currentHour = new Date().getHours();
              const currentSlot = court.timeSlots[currentHour];
              
              // Find next available or booked slot
              let nextSlot = null;
              let nextHour = null;
              for (let i = 1; i <= 3; i++) {
                const checkHour = (currentHour + i) % 24;
                const slot = court.timeSlots[checkHour];
                if (slot.status !== 'closed') {
                  nextSlot = slot;
                  nextHour = checkHour;
                  break;
                }
              }
              
              if (!nextSlot) {
                nextSlot = court.timeSlots[(currentHour + 1) % 24];
                nextHour = (currentHour + 1) % 24;
              }
              
              return (
                <div key={court.id} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{court.name}</h3>
                  <div className="text-sm space-y-1">
                    <div className={`flex items-center ${
                      currentSlot.status === 'playing' ? 'text-blue-600' :
                      currentSlot.status === 'available' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        currentSlot.status === 'playing' ? 'bg-blue-500' :
                        currentSlot.status === 'available' ? 'bg-green-500' : 
                        currentSlot.status === 'booked' || currentSlot.status === 'paid' ? 'bg-orange-500' : 'bg-gray-400'
                      }`}></div>
                      <span>Now: {currentSlot.status === 'playing' ? 'Playing' : 
                             currentSlot.status === 'available' ? 'Available' : 
                             currentSlot.status === 'booked' || currentSlot.status === 'paid' ? 'Booked' : 'Closed'}</span>
                    </div>
                    <div className={`flex items-center ${
                      nextSlot.status === 'booked' || nextSlot.status === 'paid' ? 'text-orange-600' :
                      nextSlot.status === 'available' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        nextSlot.status === 'booked' || nextSlot.status === 'paid' ? 'bg-orange-500' :
                        nextSlot.status === 'available' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <span>Next: {nextSlot.status === 'booked' || nextSlot.status === 'paid' ? 'Booked' : 
                             nextSlot.status === 'available' ? 'Available' : 'Closed'} 
                             {nextHour !== null ? `(${formatTime(nextHour)})` : ''}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};