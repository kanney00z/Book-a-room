import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Room } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRoomRent(room: Room) {
  // If we have a custom rent set manually, use it
  if (room.customRent) return room.customRent;
  
  // See if the room is occupied by someone who booked daily
  if (room.activeBookingType === 'daily' && room.dailyRent) {
    if (room.moveInDate && room.moveOutDate) {
      const start = new Date(room.moveInDate).getTime();
      const end = new Date(room.moveOutDate).getTime();
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return room.dailyRent * (diffDays > 0 ? diffDays : 1);
    }
    return room.dailyRent;
  }
  return room.monthlyRent;
}
