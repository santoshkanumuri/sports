import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Court, TimeSlot, BookingStatus, GameType, Reservation } from '../types';

interface CourtContextType {
  courts: Court[];
  selectedDate: Date;
  selectedCourt: number;
  setSelectedCourt: (courtId: number) => void;
  setSelectedDate: (date: Date) => void;
  updateTimeSlot: (courtId: number, hour: number, status: BookingStatus, gameType?: GameType, participant?: string, duration?: number) => void;
  addCourt: (name: string, gameType: GameType) => void;
  removeCourt: (courtId: number) => void;
  updateCourtSettings: (courtId: number, settings: Partial<Court>) => void;
  getCurrentlyPlaying: () => { court: Court; slot: TimeSlot; hour: number }[];
  getUpcomingSessions: () => { court: Court; slot: TimeSlot; hour: number }[];
  validateGameTypeSequence: (courtId: number, startHour: number, duration: number, gameType: GameType) => boolean;
}

const CourtContext = createContext<CourtContextType | undefined>(undefined);

const initializeCourts = (): Court[] => {
  const courts: Court[] = [];
  
  // Badminton courts (1-6)
  for (let i = 1; i <= 6; i++) {
    courts.push({
      id: i,
      name: `Badminton Court ${i}`,
      gameType: 'B',
      openingTime: 6,
      closingTime: 22,
      timeSlots: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        status: (hour >= 6 && hour < 22) ? 'available' : 'closed'
      }))
    });
  }
  
  // Pickleball courts (7-12)
  for (let i = 7; i <= 12; i++) {
    courts.push({
      id: i,
      name: `Pickleball Court ${i - 6}`,
      gameType: 'P',
      openingTime: 6,
      closingTime: 22,
      timeSlots: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        status: (hour >= 6 && hour < 22) ? 'available' : 'closed'
      }))
    });
  }
  
  return courts;
};

export const CourtProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [courts, setCourts] = useState<Court[]>(() => {
    const saved = localStorage.getItem('courts-data');
    return saved ? JSON.parse(saved) : initializeCourts();
  });
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourt, setSelectedCourt] = useState(1);

  useEffect(() => {
    localStorage.setItem('courts-data', JSON.stringify(courts));
  }, [courts]);

  const updateTimeSlot = (courtId: number, hour: number, status: BookingStatus, gameType?: GameType, participant?: string, duration: number = 1) => {
    setCourts(prev => prev.map(court => {
      if (court.id === courtId) {
        const newTimeSlots = [...court.timeSlots];
        
        // Update the main slot
        newTimeSlots[hour] = {
          ...newTimeSlots[hour],
          status,
          gameType: gameType || court.gameType,
          participant,
          duration
        };
        
        // If duration > 1, mark subsequent slots as part of this booking
        for (let i = 1; i < duration; i++) {
          if (hour + i < 24) {
            newTimeSlots[hour + i] = {
              ...newTimeSlots[hour + i],
              status,
              gameType: gameType || court.gameType,
              participant,
              duration: 0 // Indicates this is a continuation slot
            };
          }
        }
        
        return { ...court, timeSlots: newTimeSlots };
      }
      return court;
    }));
  };

  const validateGameTypeSequence = (courtId: number, startHour: number, duration: number, gameType: GameType): boolean => {
    const court = courts.find(c => c.id === courtId);
    if (!court) return false;
    
    // Check if all hours in the sequence can accommodate the same game type
    for (let i = 0; i < duration; i++) {
      const hour = startHour + i;
      if (hour >= 24) return false;
      
      const slot = court.timeSlots[hour];
      if (slot.status !== 'available' && slot.status !== 'closed') {
        // Check if existing booking has different game type
        if (slot.gameType && slot.gameType !== gameType) {
          return false;
        }
      }
    }
    
    return true;
  };

  const addCourt = (name: string, gameType: GameType) => {
    const newId = Math.max(...courts.map(c => c.id)) + 1;
    const newCourt: Court = {
      id: newId,
      name,
      gameType,
      openingTime: 6,
      closingTime: 22,
      timeSlots: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        status: (hour >= 6 && hour < 22) ? 'available' : 'closed'
      }))
    };
    setCourts(prev => [...prev, newCourt]);
  };

  const removeCourt = (courtId: number) => {
    setCourts(prev => prev.filter(court => court.id !== courtId));
  };

  const updateCourtSettings = (courtId: number, settings: Partial<Court>) => {
    setCourts(prev => prev.map(court => {
      if (court.id === courtId) {
        const updated = { ...court, ...settings };
        
        // Update time slots based on new opening/closing times
        if (settings.openingTime !== undefined || settings.closingTime !== undefined) {
          updated.timeSlots = updated.timeSlots.map(slot => ({
            ...slot,
            status: (slot.hour >= updated.openingTime && slot.hour < updated.closingTime) 
              ? (slot.status === 'closed' ? 'available' : slot.status)
              : 'closed'
          }));
        }
        
        return updated;
      }
      return court;
    }));
  };

  const getCurrentlyPlaying = () => {
    const currentHour = new Date().getHours();
    const result: { court: Court; slot: TimeSlot; hour: number }[] = [];
    
    courts.forEach(court => {
      const slot = court.timeSlots[currentHour];
      if (slot.status === 'playing') {
        result.push({ court, slot, hour: currentHour });
      }
    });
    
    return result;
  };

  const getUpcomingSessions = () => {
    const currentHour = new Date().getHours();
    const nextHour = (currentHour + 1) % 24;
    const result: { court: Court; slot: TimeSlot; hour: number }[] = [];
    
    courts.forEach(court => {
      const slot = court.timeSlots[nextHour];
      if (slot.status === 'booked' || slot.status === 'paid') {
        result.push({ court, slot, hour: nextHour });
      }
    });
    
    return result;
  };

  return (
    <CourtContext.Provider value={{
      courts,
      selectedDate,
      selectedCourt,
      setSelectedCourt,
      setSelectedDate,
      updateTimeSlot,
      addCourt,
      removeCourt,
      updateCourtSettings,
      getCurrentlyPlaying,
      getUpcomingSessions,
      validateGameTypeSequence
    }}>
      {children}
    </CourtContext.Provider>
  );
};

export const useCourts = () => {
  const context = useContext(CourtContext);
  if (!context) {
    throw new Error('useCourts must be used within a CourtProvider');
  }
  return context;
};