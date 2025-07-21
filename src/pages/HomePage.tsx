import React from 'react';
import { useCourts } from '../context/CourtContext';
import { TimeGrid } from '../components/TimeGrid';

export const HomePage: React.FC = () => {
  const { courts, selectedCourt, setSelectedCourt } = useCourts();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Court Reservation System</h1>
        <p className="text-gray-600">Select a court and manage time slot bookings</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Court</label>
        <select
          value={selectedCourt}
          onChange={(e) => setSelectedCourt(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-64"
        >
          {courts.map(court => (
            <option key={court.id} value={court.id}>
              {court.name} ({court.gameType === 'B' ? 'Badminton' : 'Pickleball'})
            </option>
          ))}
        </select>
      </div>

      <TimeGrid courtId={selectedCourt} editable={true} />
    </div>
  );
};