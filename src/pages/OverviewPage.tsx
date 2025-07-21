import React from 'react';
import { useCourts } from '../context/CourtContext';

export const OverviewPage: React.FC = () => {
  const { courts } = useCourts();

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'closed': return 'bg-gray-400';
      case 'available': return 'bg-green-500';
      case 'booked': return 'bg-orange-500';
      case 'paid': return 'bg-red-500';
      case 'playing': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  const formatTime = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const badmintonCourts = courts.filter(court => court.gameType === 'B');
  const pickleballCourts = courts.filter(court => court.gameType === 'P');

  const CourtSection = ({ title, courtList }: { title: string; courtList: typeof courts }) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="bg-white rounded-lg shadow border">
        {/* Header with court names */}
        <div className="bg-gray-50 border-b">
          <div className="grid grid-cols-[120px_repeat(auto-fit,minmax(100px,1fr))] gap-px">
            <div className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
              Time
            </div>
            {courtList.map(court => (
              <div key={court.id} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                <div className="font-semibold">{court.name}</div>
                <div className="text-gray-400 mt-1">
                  {court.openingTime}:00-{court.closingTime}:00
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Time rows */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 24 }, (_, hour) => {
            // Only show hours that are within opening times for at least one court
            const isRelevantHour = courtList.some(court => 
              hour >= court.openingTime && hour < court.closingTime
            );
            
            if (!isRelevantHour) return null;
            
            return (
            <div key={hour} className="grid grid-cols-[120px_repeat(auto-fit,minmax(100px,1fr))] gap-px hover:bg-gray-25">
              <div className="px-4 py-1 text-sm font-medium text-gray-900 bg-gray-50 border-r">
                {formatTime(hour)}
              </div>
              {courtList.map(court => {
                const slot = court.timeSlots[hour];
                // Show as closed if outside this court's operating hours
                const isWithinHours = hour >= court.openingTime && hour < court.closingTime;
                const displayStatus = isWithinHours ? slot.status : 'closed';
                
                return (
                  <div key={court.id} className="px-1 py-1 text-center border-r border-gray-100 last:border-r-0">
                    <div
                      className={`h-4 w-full ${getStatusColor(displayStatus)} flex items-center justify-center text-white text-xs font-medium`}
                      title={`${court.name} - ${formatTime(hour)} - ${slot.status} ${slot.participant ? `(${slot.participant})` : ''}`}
                    >
                      {isWithinHours && <span className="mr-0.5">{slot.gameType || court.gameType}</span>}
                      {isWithinHours && slot.participant && (
                        <span className="truncate max-w-[50px]">{slot.participant}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Courts Overview</h1>
        <p className="text-gray-600">Daily schedule for all courts</p>
      </div>

      <CourtSection title="Badminton Courts" courtList={badmintonCourts} />
      <CourtSection title="Pickleball Courts" courtList={pickleballCourts} />

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