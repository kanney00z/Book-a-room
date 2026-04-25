import React, { useState } from 'react';
import { useData } from '../lib/DataContext';
import { supabase } from '../lib/supabase';
import { Room, RoomStatus } from '../types';
import { Search, Filter, Edit, Eye, User, Plus, X, Save, Image as ImageIcon, Loader2, Trash2, LogOut, Settings, LayoutGrid, Building, Check, FileText, Printer } from 'lucide-react';
import { cn, getRoomRent, printContract } from '../lib/utils';
import * as motion from 'motion/react-client';
import FloorPlanView from '../components/FloorPlanView';

export default function AdminRooms() {
  const { rooms, roomTypes, addRoom, updateRoom, deleteRoom, addRoomType, deleteRoomType, sendLineNotification, settings } = useData();
  const [filter, setFilter] = useState<'all' | 'vacant' | 'occupied'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'floorplan'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Room | null>(null);
  const [showBillModal, setShowBillModal] = useState<Room | null>(null);
  const [showTypesModal, setShowTypesModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCheckout, setConfirmCheckout] = useState(false);
  const [confirmDeleteType, setConfirmDeleteType] = useState<string | null>(null);
  
  const [newRoomType, setNewRoomType] = useState('');
  const [newAmenitiesText, setNewAmenitiesText] = useState('');
  const [editAmenitiesText, setEditAmenitiesText] = useState('');

  const [newRoomFormat, setNewRoomFormat] = useState<'monthly' | 'daily' | 'both'>('monthly');
  const [editRoomFormat, setEditRoomFormat] = useState<'monthly' | 'daily' | 'both'>('monthly');

  // New room form
  const [newRoom, setNewRoom] = useState({
    number: '',
    type: roomTypes[0]?.name || 'Standard',
    floor: 1,
    monthlyRent: 4500,
    dailyRent: 500,
    status: 'vacant' as RoomStatus,
    imageUrl: '',
    amenities: [] as string[]
  });

  // Edit room form
  const [editRoomData, setEditRoomData] = useState<Partial<Room>>({});

  const filteredRooms = rooms.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleAddRoomType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomType.trim()) return;
    addRoomType(newRoomType.trim());
    setNewRoomType('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('room-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      alert('อัปโหลดรูปภาพไม่สำเร็จ กรุณาตรวจสอบการตั้งค่าพื้นที่จัดเก็บ Storage');
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from('room-images').getPublicUrl(fileName);
    
    if (isEdit) {
      setEditRoomData(prev => ({ ...prev, imageUrl: data.publicUrl }));
    } else {
      setNewRoom(prev => ({ ...prev, imageUrl: data.publicUrl }));
    }
    
    setIsUploading(false);
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalDailyRent = newRoomFormat === 'monthly' ? 0 : newRoom.dailyRent;
    const finalMonthlyRent = newRoomFormat === 'daily' ? 0 : newRoom.monthlyRent;
    
    addRoom({
      ...newRoom,
      dailyRent: finalDailyRent,
      monthlyRent: finalMonthlyRent,
      amenities: newAmenitiesText.split(',').map(s => s.trim()).filter(Boolean)
    });
    
    setShowAddModal(false);
    setNewRoom({
      number: '',
      type: 'Standard',
      floor: 1,
      monthlyRent: 4500,
      dailyRent: 500,
      status: 'vacant',
      imageUrl: '',
      amenities: []
    });
    setNewAmenitiesText('');
    setNewRoomFormat('monthly');
  };

  const handleEditClick = (room: Room) => {
    setShowEditModal(room);
    setConfirmDelete(false);
    setConfirmCheckout(false);
    setEditAmenitiesText(room.amenities ? room.amenities.join(', ') : '');
    
    let initialFormat: 'monthly' | 'daily' | 'both' = 'both';
    if ((!room.dailyRent || room.dailyRent === 0) && room.monthlyRent > 0) initialFormat = 'monthly';
    else if ((!room.monthlyRent || room.monthlyRent === 0) && room.dailyRent && room.dailyRent > 0) initialFormat = 'daily';
    setEditRoomFormat(initialFormat);
    
    setEditRoomData({
      number: room.number,
      type: room.type,
      floor: room.floor,
      monthlyRent: room.monthlyRent,
      dailyRent: room.dailyRent || 0,
      status: room.status,
      tenantName: room.tenantName || '',
      imageUrl: room.imageUrl || '',
      amenities: room.amenities || [],
      activeBookingType: room.activeBookingType || 'monthly',
      moveInDate: room.moveInDate || '',
      moveOutDate: room.moveOutDate || ''
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showEditModal) {
      const finalDailyRent = editRoomFormat === 'monthly' ? 0 : editRoomData.dailyRent;
      const finalMonthlyRent = editRoomFormat === 'daily' ? 0 : editRoomData.monthlyRent;
      
      updateRoom(showEditModal.id, {
        ...editRoomData,
        dailyRent: finalDailyRent,
        monthlyRent: finalMonthlyRent,
        amenities: editAmenitiesText.split(',').map(s => s.trim()).filter(Boolean)
      });
      setShowEditModal(null);
    }
  };

  const handleDeleteRoom = () => {
    if (!showEditModal) return;
    deleteRoom(showEditModal.id);
    setShowEditModal(null);
  };

  const handlePrintContract = (room: Room) => {
    printContract(room, settings.hotelName);
  };

  const handleCheckout = () => {
    if (!showEditModal) return;
    
    // Send Line Notification for Check Out
    sendLineNotification({
      type: 'checkout',
      roomNumber: showEditModal.number,
      tenantName: showEditModal.tenantName
    });

    updateRoom(showEditModal.id, {
      status: 'vacant',
      tenantName: null as any,
      tenantPhone: null as any,
      moveInDate: null as any,
      moveOutDate: null as any,
      activeBookingType: null as any,
      currentWaterMeter: 0,
      lastWaterMeter: 0,
      currentElectricMeter: 0,
      lastElectricMeter: 0,
      isPaid: true
    });
    setShowEditModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/60 shadow-inner">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2", viewMode === 'grid' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <LayoutGrid className="w-4 h-4" /> Grid
            </button>
            <button 
              onClick={() => setViewMode('floorplan')}
              className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2", viewMode === 'floorplan' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <Building className="w-4 h-4" /> Floor Plan
            </button>
          </div>

          <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

          {/* Filters */}
          <div className="flex bg-slate-50 rounded-xl border border-slate-200/60 p-1 overflow-x-auto w-full sm:w-auto">
            <button 
              onClick={() => setFilter('all')}
              className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap", filter === 'all' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              ทั้งหมด ({rooms.length})
            </button>
            <button 
              onClick={() => setFilter('vacant')}
              className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap", filter === 'vacant' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              ว่าง ({rooms.filter(r => r.status === 'vacant').length})
            </button>
            <button 
              onClick={() => setFilter('occupied')}
              className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap", filter === 'occupied' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              มีผู้เช่า ({rooms.filter(r => r.status === 'occupied').length})
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="ค้นหาห้อง..." className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full sm:w-64 text-sm font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner" />
          </div>
          <button 
            onClick={() => setShowTypesModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-200 transition shadow-sm border border-slate-200/50"
            title="จัดการประเภทห้อง"
          >
            <Settings className="w-4 h-4" /> 
            <span className="hidden sm:inline">ประเภทห้อง</span>
          </button>
          <button 
            onClick={() => {
              setNewRoom({...newRoom, type: roomTypes[0]?.name || 'Standard'});
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" /> เพิ่มห้องพัก
          </button>
        </div>
      </div>

      {viewMode === 'floorplan' ? (
        <FloorPlanView 
          rooms={filteredRooms} 
          onRoomClick={handleEditClick} 
          onRoomMove={(room, x, y) => {
            updateRoom(room.id, { posX: x, posY: y });
          }}
        />
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredRooms.map((room) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            key={room.id} 
            className="bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-3xl font-display font-bold tracking-tight text-slate-900">{room.number}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 bg-slate-50 inline-block px-2 py-0.5 rounded-md border border-slate-100">{room.type} • ชั้น {room.floor}</p>
              </div>
              <span className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-full shadow-sm backdrop-blur-sm",
                room.status === 'occupied' ? "bg-emerald-100/80 text-emerald-700 border border-emerald-200/50" : 
                room.status === 'vacant' ? "bg-indigo-50 text-indigo-600 border border-indigo-100/50" : "bg-amber-50 text-amber-600 border border-amber-100/50"
              )}>
                {room.status === 'occupied' ? 'มีผู้พัก' : room.status === 'vacant' ? 'ว่าง' : 'ซ่อมบำรุง'}
              </span>
            </div>
            
            <div className="flex-1 mt-2 mb-6">
              {room.status === 'occupied' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-bold truncate">{room.tenantName}</span>
                  </div>
                  <div className="text-sm flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 font-medium">ค่าเช่า ({room.activeBookingType === 'daily' ? 'รวม' : 'รายเดือน'})</span>
                    <span className="font-bold text-slate-900">
                      ฿{getRoomRent(room).toLocaleString()}
                    </span>
                  </div>
                  {room.moveInDate && (
                    <div className="text-xs text-slate-500 flex flex-col gap-1 px-2 pt-1">
                      <div className="flex justify-between">
                        <span>วันที่เข้าพัก:</span>
                        <span className="font-semibold text-emerald-600">
                          {new Date(room.moveInDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      {room.activeBookingType === 'daily' && room.moveOutDate && (
                        <div className="flex justify-between">
                          <span>วันที่เช็คเอาท์:</span>
                          <span className="font-semibold text-rose-500">
                            {new Date(room.moveOutDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col justify-center space-y-2 bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-5 rounded-xl shadow-inner">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ราคาค่าเช่า</p>
                  <div className="flex flex-col gap-1">
                    {room.monthlyRent > 0 && (
                      <p className="text-2xl font-display font-bold text-indigo-600">฿{room.monthlyRent.toLocaleString()}<span className="text-sm font-medium text-slate-500 ml-1">/เดือน</span></p>
                    )}
                    {room.dailyRent && room.dailyRent > 0 && (
                      <p className={room.monthlyRent > 0 ? "text-sm font-bold text-slate-600" : "text-2xl font-display font-bold text-indigo-600"}>฿{room.dailyRent.toLocaleString()}<span className={room.monthlyRent > 0 ? "text-xs font-medium text-slate-400 ml-1" : "text-sm font-medium text-slate-500 ml-1"}>/วัน</span></p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleEditClick(room)}
                className="flex-1 flex justify-center items-center gap-2 py-3 bg-indigo-50 text-xs font-bold text-indigo-700 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-100/50"
              >
                <Edit className="w-4 h-4" /> จัดการ
              </button>
              {room.status === 'occupied' && (
                <button 
                  onClick={() => handlePrintContract(room)}
                  className="flex-[0.5] flex justify-center items-center gap-2 py-3 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all border border-slate-200"
                  title="พิมพ์สัญญาเช่า"
                >
                  <FileText className="w-4 h-4" /> สัญญา
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0 bg-white">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">เพิ่มห้องพักใหม่</h3>
                <p className="text-sm text-slate-500">กรอกข้อมูลเพื่อเพิ่มเข้าสู่ระบบ</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition p-2 bg-slate-50 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="add-room-form" onSubmit={handleAddRoom} className="flex flex-col overflow-hidden h-full">
              <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หมายเลขห้อง</label>
                <input 
                  required
                  type="text" 
                  value={newRoom.number}
                  onChange={e => setNewRoom({...newRoom, number: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  placeholder="เช่น 101, 205A"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทห้อง</label>
                  <select 
                    value={newRoom.type}
                    onChange={e => setNewRoom({...newRoom, type: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    {roomTypes.map(type => (
                      <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ชั้น</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    value={newRoom.floor}
                    onChange={e => setNewRoom({...newRoom, floor: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รูปแบบการให้เช่า</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setNewRoomFormat('monthly')} className={cn("py-2 px-3 text-sm font-medium rounded-xl border transition-all", newRoomFormat === 'monthly' ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>รายเดือน</button>
                  <button type="button" onClick={() => setNewRoomFormat('daily')} className={cn("py-2 px-3 text-sm font-medium rounded-xl border transition-all", newRoomFormat === 'daily' ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>รายวัน</button>
                  <button type="button" onClick={() => setNewRoomFormat('both')} className={cn("py-2 px-3 text-sm font-medium rounded-xl border transition-all", newRoomFormat === 'both' ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>ทั้งสองแบบ</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(newRoomFormat === 'monthly' || newRoomFormat === 'both') && (
                  <div className={newRoomFormat === 'monthly' ? "col-span-2" : ""}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ค่าเช่าต่อเดือน (บาท)</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      value={newRoom.monthlyRent}
                      onChange={e => setNewRoom({...newRoom, monthlyRent: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                )}
                {(newRoomFormat === 'daily' || newRoomFormat === 'both') && (
                  <div className={newRoomFormat === 'daily' ? "col-span-2" : ""}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ค่าเช่ารายวัน (บาท)</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      value={newRoom.dailyRent || 0}
                      onChange={e => setNewRoom({...newRoom, dailyRent: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">สิ่งอำนวยความสะดวก</label>
                <input 
                  type="text" 
                  value={newAmenitiesText}
                  onChange={e => setNewAmenitiesText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  placeholder="เช่น 30 ตร.ม., คีย์การ์ด, ฟรี WiFi, แอร์ (คั่นด้วยลูกน้ำ)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รูปภาพห้องพัก</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition relative overflow-hidden">
                  {newRoom.imageUrl ? (
                    <div className="relative">
                      <img src={newRoom.imageUrl} alt="Room preview" className="h-32 w-full object-cover rounded-lg" />
                      <button type="button" onClick={() => setNewRoom({...newRoom, imageUrl: ''})} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm text-rose-500 hover:bg-rose-50"><X size={16}/></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center p-4">
                      {isUploading ? <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" /> : <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />}
                      <span className="text-sm font-medium text-indigo-600">{isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ'}</span>
                      <span className="text-xs text-slate-500 mt-1">PNG, JPG ไม่เกิน 5MB</span>
                      <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={(e) => handleImageUpload(e, false)} />
                    </label>
                  )}
                </div>
              </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                <button 
                  type="submit"
                  form="add-room-form"
                  className="w-full py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm flex justify-center items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> บันทึกข้อมูล
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0 bg-white">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">แก้ไขข้อมูลห้อง {showEditModal.number}</h3>
                <p className="text-sm text-slate-500">อัปเดตข้อมูลของห้องพัก</p>
              </div>
              <div className="flex items-center gap-2">
                {confirmDelete ? (
                  <div className="flex items-center gap-1 bg-rose-50 px-2 py-1.5 rounded-xl border border-rose-100">
                    <span className="text-xs font-bold text-rose-600 mr-1">ลบห้องนี้?</span>
                    <button onClick={handleDeleteRoom} className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setConfirmDelete(false)} className="p-1.5 bg-white text-slate-500 hover:text-slate-700 rounded-lg shadow-sm border border-slate-200 transition"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(true)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-xl transition" title="ลบห้องพัก">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => setShowEditModal(null)} className="text-slate-400 hover:text-slate-600 transition p-2 bg-slate-50 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form id="edit-room-form" onSubmit={handleSaveEdit} className="flex flex-col overflow-hidden h-full">
              <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หมายเลขห้อง</label>
                <input 
                  required
                  type="text" 
                  value={editRoomData.number || ''}
                  onChange={e => setEditRoomData({...editRoomData, number: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทห้อง</label>
                  <select 
                    value={editRoomData.type || ''}
                    onChange={e => setEditRoomData({...editRoomData, type: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    {roomTypes.map(type => (
                      <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">สถานะ</label>
                  <select 
                    value={editRoomData.status || ''}
                    onChange={e => setEditRoomData({...editRoomData, status: e.target.value as RoomStatus})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    <option value="vacant">ว่าง</option>
                    <option value="occupied">มีผู้เช่า</option>
                    <option value="maintenance">ซ่อมบำรุง</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รูปแบบการให้เช่า</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setEditRoomFormat('monthly')} className={cn("py-2 px-3 text-sm font-medium rounded-xl border transition-all", editRoomFormat === 'monthly' ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>รายเดือน</button>
                  <button type="button" onClick={() => setEditRoomFormat('daily')} className={cn("py-2 px-3 text-sm font-medium rounded-xl border transition-all", editRoomFormat === 'daily' ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>รายวัน</button>
                  <button type="button" onClick={() => setEditRoomFormat('both')} className={cn("py-2 px-3 text-sm font-medium rounded-xl border transition-all", editRoomFormat === 'both' ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>ทั้งสองแบบ</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(editRoomFormat === 'monthly' || editRoomFormat === 'both') && (
                  <div className={editRoomFormat === 'monthly' ? "col-span-2" : ""}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ค่าเช่าต่อเดือน (บาท)</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      value={editRoomData.monthlyRent || 0}
                      onChange={e => setEditRoomData({...editRoomData, monthlyRent: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                )}
                {(editRoomFormat === 'daily' || editRoomFormat === 'both') && (
                  <div className={editRoomFormat === 'daily' ? "col-span-2" : ""}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ค่าเช่ารายวัน (บาท)</label>
                    <input 
                      required
                      type="number" 
                      min="0"
                      value={editRoomData.dailyRent || 0}
                      onChange={e => setEditRoomData({...editRoomData, dailyRent: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">สิ่งอำนวยความสะดวก</label>
                <input 
                  type="text" 
                  value={editAmenitiesText}
                  onChange={e => setEditAmenitiesText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  placeholder="เช่น 30 ตร.ม., คีย์การ์ด, ฟรี WiFi, แอร์ (คั่นด้วยลูกน้ำ)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รูปภาพห้องพัก</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition relative overflow-hidden">
                  {editRoomData.imageUrl ? (
                    <div className="relative">
                      <img src={editRoomData.imageUrl} alt="Room preview" className="h-32 w-full object-cover rounded-lg" />
                      <button type="button" onClick={() => setEditRoomData({...editRoomData, imageUrl: ''})} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm text-rose-500 hover:bg-rose-50"><X size={16}/></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center p-4">
                      {isUploading ? <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" /> : <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />}
                      <span className="text-sm font-medium text-indigo-600">{isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ'}</span>
                      <span className="text-xs text-slate-500 mt-1">PNG, JPG ไม่เกิน 5MB</span>
                      <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={(e) => handleImageUpload(e, true)} />
                    </label>
                  )}
                </div>
              </div>

              {editRoomData.status === 'occupied' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้เช่าปัจจุบัน</label>
                    <input 
                      type="text" 
                      value={editRoomData.tenantName || ''}
                      onChange={e => setEditRoomData({...editRoomData, tenantName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      placeholder="ชื่อ-นามสกุล ผู้เช่า"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทการเข้าพัก</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setEditRoomData({...editRoomData, activeBookingType: 'monthly'})} className={cn("py-2 px-3 text-sm font-medium rounded-xl border transition-all", (!editRoomData.activeBookingType || editRoomData.activeBookingType === 'monthly') ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>รายเดือน</button>
                      <button type="button" onClick={() => setEditRoomData({...editRoomData, activeBookingType: 'daily'})} className={cn("py-2 px-3 text-sm font-medium rounded-xl border transition-all", editRoomData.activeBookingType === 'daily' ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>รายวัน</button>
                    </div>
                  </div>

                  {editRoomData.activeBookingType === 'daily' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">วันที่เช็คอิน</label>
                        <input 
                          type="date" 
                          value={editRoomData.moveInDate || ''}
                          onChange={e => setEditRoomData({...editRoomData, moveInDate: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">วันที่เช็คเอาท์</label>
                        <input 
                          type="date" 
                          value={editRoomData.moveOutDate || ''}
                          onChange={e => setEditRoomData({...editRoomData, moveOutDate: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                      </div>
                    </div>
                  )}

                  {editRoomData.activeBookingType === 'daily' && editRoomData.moveInDate && editRoomData.moveOutDate && (
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex justify-between items-center">
                      <span className="text-sm font-medium text-indigo-900">
                        ยอดชำระรวม ({Math.max(1, Math.ceil(Math.abs(new Date(editRoomData.moveOutDate).getTime() - new Date(editRoomData.moveInDate).getTime()) / (1000 * 60 * 60 * 24)))} คืน):
                      </span>
                      <span className="text-xl font-bold text-indigo-700">
                        ฿{((editRoomData.dailyRent || 0) * Math.max(1, Math.ceil(Math.abs(new Date(editRoomData.moveOutDate).getTime() - new Date(editRoomData.moveInDate).getTime()) / (1000 * 60 * 60 * 24)))).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    {confirmCheckout ? (
                      <div className="w-full flex items-center gap-2 pt-2">
                        <span className="text-sm font-medium text-rose-600 flex-1 text-center">ยืนยันการย้ายออก?</span>
                        <button type="button" onClick={handleCheckout} className="px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700 transition">ยืนยัน</button>
                        <button type="button" onClick={() => setConfirmCheckout(false)} className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-300 transition">ยกเลิก</button>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setConfirmCheckout(true)}
                        className="w-full py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-medium rounded-xl transition flex justify-center items-center gap-2 border border-rose-100"
                      >
                        <LogOut className="w-4 h-4" /> แจ้งย้ายออก / ล้างข้อมูลผู้เช่า
                      </button>
                    )}
                  </div>
                </div>
              )}
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                <button 
                  type="submit"
                  form="edit-room-form"
                  className="w-full py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm flex justify-center items-center gap-2"
                >
                  <Save className="w-5 h-5" /> บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showBillModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">บิลค่าเช่าห้อง {showBillModal.number}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-slate-500">{showBillModal.tenantName}</p>
                  <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-full", showBillModal.isPaid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                    {showBillModal.isPaid ? "ชำระแล้ว" : "ค้างชำระ"}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowBillModal(null)} className="text-slate-400 hover:text-slate-600 transition p-2 bg-slate-50 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-600">ค่าเช่าห้องพัก</span>
                <span className="font-semibold text-slate-800">
                  ฿{getRoomRent(showBillModal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-600 block">ค่าน้ำประปา (18 บ./หน่วย)</span>
                  <span className="text-xs text-slate-400">มิเตอร์: {(showBillModal.lastWaterMeter || 0)} &rarr; {(showBillModal.currentWaterMeter || 0)}</span>
                </div>
                <span className="font-semibold text-slate-800">
                  ฿{(((showBillModal.currentWaterMeter || 0) - (showBillModal.lastWaterMeter || 0)) * 18).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-600 block">ค่าไฟฟ้า (8 บ./หน่วย)</span>
                  <span className="text-xs text-slate-400">มิเตอร์: {(showBillModal.lastElectricMeter || 0)} &rarr; {(showBillModal.currentElectricMeter || 0)}</span>
                </div>
                <span className="font-semibold text-slate-800">
                  ฿{(((showBillModal.currentElectricMeter || 0) - (showBillModal.lastElectricMeter || 0)) * 8).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-slate-800">ยอดชำระรวม</span>
                <span className="text-2xl font-bold text-indigo-600">
                  ฿{(
                    getRoomRent(showBillModal) + 
                    (((showBillModal.currentWaterMeter || 0) - (showBillModal.lastWaterMeter || 0)) * 18) + 
                    (((showBillModal.currentElectricMeter || 0) - (showBillModal.lastElectricMeter || 0)) * 8)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
               <button onClick={() => setShowBillModal(null)} className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition">
                 ปิดหน้าต่าง
               </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Room Types Modal */}
      {showTypesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">จัดการประเภทห้อง</h3>
                <p className="text-sm text-slate-500">เพิ่มหรือลบประเภทห้องพัก</p>
              </div>
              <button onClick={() => setShowTypesModal(false)} className="text-slate-400 hover:text-slate-600 transition p-2 bg-slate-50 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <form onSubmit={handleAddRoomType} className="flex gap-2">
                <input 
                  type="text"
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  placeholder="เพิ่มประเภทห้องใหม่ (เช่น VIP)" 
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
                <button type="submit" className="px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition flex items-center gap-1">
                  <Plus className="w-4 h-4" /> เพิ่ม
                </button>
              </form>

              <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {roomTypes.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-sm">ยังไม่มีประเภทห้องพัก</div>
                ) : (
                  roomTypes.map(type => {
                    const isUsed = rooms.some(r => r.type === type.name);
                    return (
                      <div key={type.id} className="flex items-center justify-between p-3">
                        <span className="font-medium text-slate-700">{type.name}</span>
                        <div className="flex items-center gap-3">
                          {isUsed && <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">ใช้งานอยู่</span>}
                          {confirmDeleteType === type.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-full">
                              <span className="text-xs text-rose-600 font-medium px-2">ยืนยัน?</span>
                              <button type="button" onClick={() => { deleteRoomType(type.id); setConfirmDeleteType(null); }} className="px-2 py-1 bg-rose-500 text-white rounded-full text-xs hover:bg-rose-600 transition">ลบ</button>
                              <button type="button" onClick={() => setConfirmDeleteType(null)} className="px-2 py-1 bg-slate-200 text-slate-700 rounded-full text-xs hover:bg-slate-300 transition">ยกเลิก</button>
                            </div>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => {
                                if (!isUsed) setConfirmDeleteType(type.id);
                              }}
                              className={cn("p-1.5 rounded-lg transition", 
                                isUsed ? "text-slate-300 cursor-not-allowed" : "text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                              )}
                              disabled={isUsed}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 mb-4">
                <strong>หมายเหตุ:</strong> การเปลี่ยนหรือลบประเภทห้อง ต้องตั้งค่าตาราง <code>room_types</code> ใน Supabase SQL เพิ่มเติม
              </div>
               <button onClick={() => setShowTypesModal(false)} className="w-full py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition">
                 ปิดหน้าต่าง
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
