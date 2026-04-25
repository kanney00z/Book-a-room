export type RoomStatus = 'vacant' | 'occupied' | 'maintenance';

export interface RoomType {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
  monthlyRent: number;
  dailyRent?: number;
  status: RoomStatus;
  tenantName?: string;
  tenantPhone?: string;
  moveInDate?: string;
  moveOutDate?: string;
  activeBookingType?: 'daily' | 'monthly';
  imageUrl?: string;
  amenities?: string[];
  // Billing
  lastWaterMeter?: number;
  currentWaterMeter?: number;
  lastElectricMeter?: number;
  currentElectricMeter?: number;
  customRent?: number;
  otherCharges?: number;
  isPaid?: boolean;
  // Position for Map View
  posX?: number;
  posY?: number;
  // Payment Verification
  paymentSlipUrl?: string;
}

export interface BookingRequest {
  id: string;
  roomId: string;
  applicantName: string;
  applicantPhone: string;
  bookingType: 'daily' | 'monthly';
  requestedMoveInDate: string;
  requestedMoveOutDate?: string;
  guestCount?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  roomId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export type ExpenseCategory = 'utilities' | 'maintenance' | 'salary' | 'marketing' | 'other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string;
  created_at?: string;
}
