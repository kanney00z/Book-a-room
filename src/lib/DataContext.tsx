import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, BookingRequest, RoomStatus, RoomType, MaintenanceRequest } from '../types';
import { supabase } from './supabase';

interface AppSettings {
  promptpayNumber: string;
  promptpayName: string;
}

interface DataContextType {
  rooms: Room[];
  bookings: BookingRequest[];
  roomTypes: RoomType[];
  maintenanceRequests: MaintenanceRequest[];
  updateRoom: (roomId: string, data: Partial<Room>) => Promise<void>;
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  addBooking: (booking: Omit<BookingRequest, 'id' | 'createdAt'>) => Promise<void>;
  approveBooking: (bookingId: string) => Promise<void>;
  rejectBooking: (bookingId: string) => Promise<void>;
  addRoomType: (name: string) => Promise<void>;
  deleteRoomType: (id: string) => Promise<void>;
  addMaintenanceRequest: (req: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateMaintenanceStatus: (id: string, status: MaintenanceRequest['status']) => void;
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  isConfigured: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    { id: '1', name: 'Standard' },
    { id: '2', name: 'Deluxe' },
    { id: '3', name: 'Suite' }
  ]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([
    { id: 'm1', roomId: '1', title: 'แอร์น้ำหยด', description: 'แอร์มีน้ำหยดลงมาตรงปลายเตียงครับ', status: 'pending', createdAt: new Date().toISOString() },
    { id: 'm2', roomId: '2', title: 'หลอดไฟห้องน้ำขาด', description: 'เปิดไม่ติดเลยครับ', status: 'in_progress', createdAt: new Date().toISOString() }
  ]);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('adminSettings');
    return saved ? JSON.parse(saved) : { promptpayNumber: '0812345678', promptpayName: 'เจ้าของหอพัก' };
  });

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('adminSettings', JSON.stringify(newSettings));
  };
  
  const isConfigured = !!(import.meta as any).env.VITE_SUPABASE_URL && !!(import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (!isConfigured) return;

    fetchData();
    
    // Subscribe to real-time changes
    const roomsSub = supabase.channel('custom-rooms-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, fetchData)
      .subscribe();
      
    const bookingsSub = supabase.channel('custom-bookings-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchData)
      .subscribe();

    const roomTypesSub = supabase.channel('custom-room-types-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_types' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(roomsSub);
      supabase.removeChannel(bookingsSub);
      supabase.removeChannel(roomTypesSub);
    };
  }, [isConfigured]);

  const fetchData = async () => {
    // Fetch Rooms
    const { data: roomsData } = await supabase
      .from('rooms')
      .select('*')
      .order('number', { ascending: true });
      
    if (roomsData) setRooms(roomsData);

    // Fetch Bookings
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*')
      .order('createdAt', { ascending: false });

    if (bookingsData) setBookings(bookingsData);

    // Fetch Room Types (Handle gracefully if table doesn't exist yet)
    try {
      const { data: typesData, error } = await supabase
        .from('room_types')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (typesData && !error) {
        setRoomTypes(typesData);
      }
    } catch (e) {
      console.log('Room types table might not exist yet.');
    }
  };

  const updateRoom = async (roomId: string, data: Partial<Room>) => {
    if (!isConfigured) return;
    setRooms(prev => prev.map(room => room.id === roomId ? { ...room, ...data } : room));
    const { error } = await supabase.from('rooms').update(data).eq('id', roomId);
    if (error) console.error("Error updating room:", error);
  };

  const deleteRoom = async (roomId: string) => {
    if (!isConfigured) return;
    setRooms(prev => prev.filter(r => r.id !== roomId));
    const { error } = await supabase.from('rooms').delete().eq('id', roomId);
    if (error) console.error("Error deleting room:", error);
  };

  const addRoom = async (room: Omit<Room, 'id'>) => {
    if (!isConfigured) return alert('ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ');
    const { data, error } = await supabase
      .from('rooms')
      .insert([Object.assign({ isPaid: true, currentWaterMeter: 0, lastWaterMeter: 0, currentElectricMeter: 0, lastElectricMeter: 0 }, room)])
      .select()
      .single();
    if (data) setRooms(prev => [...prev, data]);
    else if (error) alert('เกิดข้อผิดพลาดในการเพิ่มห้องพัก');
  };

  const sendLineNotification = async (payload: any) => {
    if (!isConfigured) return;
    try {
      await supabase.functions.invoke('line-notify', {
        body: payload
      });
    } catch (e) {
      console.error('Failed to send LINE notification', e);
    }
  };

  const addBooking = async (booking: Omit<BookingRequest, 'id' | 'createdAt'>) => {
    if (!isConfigured) return alert('ระบบฐานข้อมูลยังไม่ได้เชื่อมต่อ');
    const { data, error } = await supabase.from('bookings').insert([booking]).select().single();
    if (data) {
      setBookings(prev => [data, ...prev]);
      // ส่งแจ้งเตือน LINE (Flex Message)
      const room = rooms.find(r => r.id === booking.roomId);
      await sendLineNotification({
        type: 'booking',
        roomNumber: room?.number || 'ไม่ระบุ',
        name: booking.applicantName,
        phone: booking.applicantPhone,
        bookingType: booking.bookingType === 'monthly' ? 'รายเดือน' : 'รายวัน',
        amount: booking.bookingType === 'monthly' ? room?.monthlyRent : room?.dailyRent,
        moveInDate: booking.requestedMoveInDate,
        moveOutDate: booking.requestedMoveOutDate,
        guestCount: booking.guestCount || 1
      });
    }
    else if (error) alert('เกิดข้อผิดพลาดในการจองห้อง');
  };

  const approveBooking = async (bookingId: string) => {
    if (!isConfigured) return;
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'approved' } : b));
    await supabase.from('bookings').update({ status: 'approved' }).eq('id', bookingId);
    await updateRoom(booking.roomId, {
      status: 'occupied',
      tenantName: booking.applicantName,
      tenantPhone: booking.applicantPhone,
      moveInDate: booking.requestedMoveInDate,
      moveOutDate: booking.requestedMoveOutDate || null,
      activeBookingType: booking.bookingType,
      lastWaterMeter: 0, currentWaterMeter: 0,
      lastElectricMeter: 0, currentElectricMeter: 0,
      customRent: null,
      isPaid: true
    });
  };

  const rejectBooking = async (bookingId: string) => {
    if (!isConfigured) return;
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'rejected' } : b));
    await supabase.from('bookings').update({ status: 'rejected' }).eq('id', bookingId);
  };

  const addRoomType = async (name: string) => {
    if (!isConfigured) return;
    // Optimistic fallback (useful if they haven't made table yet, though it won't persist)
    // Actually, don't do optimistic add if we want real db integrity, 
    // but we can try insert
    const { data, error } = await supabase.from('room_types').insert([{ name }]).select().single();
    if (data) setRoomTypes(prev => [...prev, data]);
    if (error) alert('กรุณาอัปเดตฐานข้อมูล SQL ก่อนเพิ่มประเภทห้อง');
  };

  const deleteRoomType = async (id: string) => {
    if (!isConfigured) return;
    setRoomTypes(prev => prev.filter(t => t.id !== id));
    await supabase.from('room_types').delete().eq('id', id);
  };

  const addMaintenanceRequest = (req: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: MaintenanceRequest = {
      ...req,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setMaintenanceRequests(prev => [newReq, ...prev]);
    
    // ส่งแจ้งเตือน LINE (Flex Message)
    const room = rooms.find(r => r.id === req.roomId);
    sendLineNotification({
      type: 'maintenance',
      roomNumber: room?.number || 'ไม่ระบุ',
      title: req.title,
      description: req.description
    });
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceRequest['status']) => {
    setMaintenanceRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
  };

  return (
    <DataContext.Provider value={{ 
      rooms, bookings, roomTypes, maintenanceRequests,
      updateRoom, addRoom, deleteRoom, 
      addBooking, approveBooking, rejectBooking, 
      addRoomType, deleteRoomType, 
      addMaintenanceRequest, updateMaintenanceStatus,
      settings, updateSettings,
      isConfigured 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
