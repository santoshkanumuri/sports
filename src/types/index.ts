export type GameType = 'B' | 'P'; // Badminton or Pickleball
export type BookingStatus = 'closed' | 'available' | 'booked' | 'paid' | 'playing';

export interface TimeSlot {
  hour: number;
  status: BookingStatus;
  gameType?: GameType;
  participant?: string;
  duration?: number; // in hours
  notes?: string;
}

export interface Court {
  id: number;
  name: string;
  gameType: GameType;
  openingTime: number; // 0-23
  closingTime: number; // 0-23
  timeSlots: TimeSlot[];
}

export interface Reservation {
  courtId: number;
  startHour: number;
  duration: number;
  gameType: GameType;
  participant: string;
  status: BookingStatus;
  notes?: string;
}