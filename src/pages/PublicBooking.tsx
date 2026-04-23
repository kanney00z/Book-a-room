import { useState } from 'react';
import { useData } from '../lib/DataContext';
import { Room } from '../types';
import { Search, Home, Building, ShieldCheck, Phone, ChevronRight, X, Users, Wifi, Wind, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, getRoomRent } from '../lib/utils';
import * as motion from 'motion/react-client';

export default function PublicBooking() {
  const { rooms, addBooking } = useData();
  const [showModal, setShowModal] = useState<Room | null>(null);
  
  // Booking Form State
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantPhone: '',
    bookingType: 'monthly' as 'monthly' | 'daily',
    requestedMoveInDate: '',
    requestedMoveOutDate: '',
    guestCount: 1
  });
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);

  // Tenant Bill Search State
  const [showBillSearch, setShowBillSearch] = useState(false);
  const [searchRoom, setSearchRoom] = useState('');
  const [searchName, setSearchName] = useState('');
  const [tenantBill, setTenantBill] = useState<Room | null>(null);
  const [searchError, setSearchError] = useState('');

  // Form and Filtering state
  const [selectedType, setSelectedType] = useState<string>('all');
  const vacantRooms = rooms.filter(r => r.status === 'vacant');
  
  const availableTypes = Array.from(new Set(vacantRooms.map(r => r.type)));
  
  const displayedRooms = selectedType === 'all' 
    ? vacantRooms 
    : vacantRooms.filter(r => r.type === selectedType);

  const getAmenityIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('wifi') || lower.includes('ไวไฟ') || lower.includes('เน็ต')) return <Wifi className="w-4 h-4 text-sky-500" />;
    if (lower.includes('แอร์') || lower.includes('air')) return <Wind className="w-4 h-4 text-cyan-500" />;
    if (lower.includes('คีย์การ์ด') || lower.includes('key')) return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
    if (lower.includes('ตร.ม.') || lower.includes('sqm')) return <Building className="w-4 h-4 text-indigo-500" />;
    return <CheckCircle2 className="w-4 h-4 text-indigo-400" />;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStep(step => (step + 1) as 1 | 2 | 3);
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (showModal) {
      addBooking({
        roomId: showModal.id,
        applicantName: formData.applicantName,
        applicantPhone: formData.applicantPhone,
        bookingType: formData.bookingType,
        requestedMoveInDate: formData.requestedMoveInDate,
        requestedMoveOutDate: formData.bookingType === 'daily' ? formData.requestedMoveOutDate : undefined,
        guestCount: formData.guestCount,
        status: 'pending'
      });
      setShowModal(null);
      setBookingStep(1);
      setFormData({ applicantName: '', applicantPhone: '', bookingType: 'monthly', requestedMoveInDate: '', requestedMoveOutDate: '', guestCount: 1 });
      alert('ส่งคำขอจองห้องสำเร็จ! เจ้าหน้าที่จะติดต่อกลับ');
    }
  };

  const handleSearchBill = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    
    // Find room
    const room = rooms.find(r => 
      r.number.toLowerCase() === searchRoom.trim().toLowerCase() && 
      r.status === 'occupied'
    );

    if (!room) {
      setSearchError('ไม่พบข้อมูลห้องพักนี้ หรือห้องยังไม่มีผู้เช่า');
      return;
    }

    if (room.tenantName?.trim().toLowerCase() !== searchName.trim().toLowerCase()) {
      setSearchError('ชื่อผู้เช่าไม่ถูกต้อง กรุณาตรวจสอบให้ตรงกับที่ลงทะเบียนไว้');
      return;
    }

    setTenantBill(room);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-6 bg-transparent absolute top-0 w-full z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-600/20 font-bold text-white flex items-center justify-center font-display text-xl">
            M
          </div>
          <span className="font-display font-bold text-xl text-slate-900 tracking-tight">Modern Stay</span>
        </div>
        <button 
          onClick={() => setShowBillSearch(true)}
          className="text-sm font-semibold px-5 py-2.5 bg-white text-indigo-600 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.15)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.2)] border border-slate-100 hover:border-indigo-100 rounded-full transition-all duration-300 hover:-translate-y-0.5"
        >
          เช็คบิลค่าห้อง
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-28 px-8 md:px-16 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-slate-50 -z-10" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
        <div className="absolute top-20 left-0 -translate-x-1/3 w-72 h-72 bg-indigo-200/40 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 text-sm font-semibold mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            ห้องพักสวยพร้อมอยู่ ว่าง {vacantRooms.length} ห้อง
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
            ยกระดับการใช้ชีวิต<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">ที่ลงตัวสำหรับคุณ</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            สัมผัสประสบการณ์การพักอาศัยเหนือระดับ ด้วยระบบรักษาความปลอดภัย 24 ชม. และสิ่งอำนวยความสะดวกครบครัน ตอบโจทย์ทุกไลฟ์สไตล์
          </p>
          
        </motion.div>
      </section>

      {/* Rooms Section */}
      <section className="px-8 md:px-16 py-16 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">ห้องพักที่ว่างอยู่ขณะนี้</h2>
            <p className="text-slate-500 mt-2 text-lg">จองล่วงหน้าวันนี้ เพื่อรับข้อเสนอสุดพิเศษ</p>
          </div>
          
          {/* Category Tabs */}
          {availableTypes.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar w-full md:w-auto mt-2 md:mt-0 p-1 bg-slate-200/50 rounded-full">
              <button 
                onClick={() => setSelectedType('all')}
                className={cn("px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300", selectedType === 'all' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900")}
              >
                ดูทั้งหมด ({vacantRooms.length})
              </button>
              {availableTypes.map(type => (
                <button
                   key={type}
                   onClick={() => setSelectedType(type)}
                   className={cn("px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300", selectedType === type ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900")}
                >
                  {type} ({vacantRooms.filter(r => r.type === type).length})
                </button>
              ))}
            </div>
          )}
        </div>

        {displayedRooms.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-3xl">
            <h3 className="text-2xl font-display font-bold text-slate-800">ไม่มีห้องว่างในหมวดหมู่นี้</h3>
            <p className="text-slate-500 mt-3 text-lg">กรุณาเลือกหมวดหมู่ใหม่ หรือติดต่อพนักงานเพื่อจองคิว</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayedRooms.map((room, idx) => (
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ delay: idx * 0.1, duration: 0.5 }}
               key={room.id}
               className="group bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
             >
               <div className="h-56 bg-slate-100 relative overflow-hidden">
                 <img 
                   src={room.imageUrl || `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80`} 
                   alt="Room" 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                 <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold text-slate-900 shadow-sm">
                   ห้อง {room.number}
                 </div>
                 <div className="absolute bottom-4 left-4 text-white">
                   <h3 className="text-2xl font-display font-bold text-white shadow-sm">{room.type}</h3>
                   <p className="text-sm text-white/90 font-medium">ชั้น {room.floor}</p>
                 </div>
               </div>
               <div className="p-6 flex-1 flex flex-col">
                 <div className="flex justify-between items-end mb-6">
                   <div className="text-left w-full">
                     {room.dailyRent ? (
                       <div className="flex justify-between items-end w-full">
                         <div>
                           <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">รายเดือน</p>
                           <p className="text-xl font-bold text-slate-900">
                             ฿{room.monthlyRent.toLocaleString()} <span className="font-medium text-slate-500 text-sm">/ด.</span>
                           </p>
                         </div>
                         <div className="text-right">
                           <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">รายวัน</p>
                           <p className="text-lg font-bold text-indigo-600">
                             ฿{room.dailyRent.toLocaleString()} <span className="font-medium text-slate-500 text-sm">/ว.</span>
                           </p>
                         </div>
                       </div>
                     ) : (
                       <>
                         <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">ค่าเช่ารายเดือน</p>
                         <p className="text-3xl font-display font-bold text-indigo-600">
                           ฿{room.monthlyRent.toLocaleString()}
                           <span className="text-base font-medium text-slate-500 ml-1">/เดือน</span>
                         </p>
                       </>
                     )}
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-8 text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                   {(room.amenities && room.amenities.length > 0) ? (
                     room.amenities.map((amenity, i) => (
                       <div key={i} className="flex items-center gap-2">
                         {getAmenityIcon(amenity)} {amenity}
                       </div>
                     ))
                   ) : (
                     <>
                       <div className="flex items-center gap-2">
                         <Building className="w-4 h-4 text-indigo-500" /> 30 ตร.ม.
                       </div>
                       <div className="flex items-center gap-2">
                         <ShieldCheck className="w-4 h-4 text-emerald-500" /> คีย์การ์ด
                       </div>
                       <div className="flex items-center gap-2">
                         <Wifi className="w-4 h-4 text-sky-500" /> ฟรี WiFi
                       </div>
                       <div className="flex items-center gap-2">
                         <Wind className="w-4 h-4 text-cyan-500" /> แอร์เย็นฉ่ำ
                       </div>
                     </>
                   )}
                 </div>

                 <div className="mt-auto">
                   <button 
                     onClick={() => setShowModal(room)}
                     className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-600/20 transition-all duration-300 flex justify-center items-center gap-2"
                   >
                     จองห้องพัก <ChevronRight className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
              <motion.div 
                className="h-full bg-indigo-600" 
                initial={{ width: 0 }}
                animate={{ width: `${(bookingStep / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <div className="flex justify-between items-start mb-6 mt-2">
              <div>
                <h3 className="text-2xl font-display font-bold text-slate-800">จองห้องพัก {showModal.number}</h3>
                <p className="text-slate-500 text-sm mt-1">
                  {bookingStep === 1 ? 'ขั้นตอน 1/3: เลือกรูปแบบและเวลา' : bookingStep === 2 ? 'ขั้นตอน 2/3: ข้อมูลผู้ติดต่อ' : 'ขั้นตอน 3/3: ยืนยันข้อมูล'}
                </p>
              </div>
              <button 
                onClick={() => { setShowModal(null); setBookingStep(1); }} 
                className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={bookingStep < 3 ? handleNextStep : handleBook} className="space-y-5">
              
              {bookingStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">รูปแบบการเข้าพัก</label>
                    <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/80 rounded-[1.25rem]">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, bookingType: 'monthly'})}
                        className={cn("py-2.5 text-sm font-bold rounded-xl transition-all duration-300", formData.bookingType === 'monthly' ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700")}
                      >
                        รายเดือน
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, bookingType: 'daily'})}
                        className={cn("py-2.5 text-sm font-bold rounded-xl transition-all duration-300", formData.bookingType === 'daily' ? "bg-white shadow-sm text-indigo-700" : "text-slate-500 hover:text-slate-700")}
                        disabled={!showModal.dailyRent || showModal.dailyRent <= 0}
                      >
                        รายวัน
                      </button>
                    </div>
                    {(!showModal.dailyRent || showModal.dailyRent <= 0) && formData.bookingType === 'monthly' && (
                      <p className="text-[11px] font-semibold text-rose-500 mt-2">* ห้องนี้รองรับเฉพาะการเช่ารายเดือนเท่านั้น</p>
                    )}
                  </div>

                  {formData.bookingType === 'monthly' ? (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">วันที่พร้อมเข้าอยู่</label>
                      <input 
                        required
                        type="date" 
                        value={formData.requestedMoveInDate}
                        onChange={e => setFormData({...formData, requestedMoveInDate: e.target.value})}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">เช็คอิน</label>
                        <input 
                          required
                          type="date" 
                          value={formData.requestedMoveInDate}
                          onChange={e => setFormData({...formData, requestedMoveInDate: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">เช็คเอาท์</label>
                        <input 
                          required
                          type="date" 
                          min={formData.requestedMoveInDate}
                          value={formData.requestedMoveOutDate}
                          onChange={e => setFormData({...formData, requestedMoveOutDate: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {bookingStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">ชื่อ-นามสกุลผู้จอง</label>
                    <input 
                      required
                      type="text" 
                      value={formData.applicantName}
                      onChange={e => setFormData({...formData, applicantName: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                      placeholder="สมชาย ใจดี"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">เบอร์โทรศัพท์ติดต่อ</label>
                    <input 
                      required
                      type="tel" 
                      value={formData.applicantPhone}
                      onChange={e => setFormData({...formData, applicantPhone: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                      placeholder="081-234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">จำนวนผู้เข้าพัก</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <input 
                        required
                        type="number" 
                        min="1"
                        max="4"
                        value={formData.guestCount}
                        onChange={e => setFormData({...formData, guestCount: parseInt(e.target.value) || 1})}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {bookingStep === 3 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 text-center mb-4">โปรดตรวจสอบข้อมูลก่อนยืนยัน</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">ห้องพัก:</span>
                      <span className="font-bold text-slate-800">ห้อง {showModal.number} ({showModal.type})</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">รูปแบบ:</span>
                      <span className="font-bold text-slate-800">{formData.bookingType === 'monthly' ? 'รายเดือน' : 'รายวัน'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">ชื่อผู้ติดต่อ:</span>
                      <span className="font-bold text-slate-800">{formData.applicantName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">เบอร์โทร:</span>
                      <span className="font-bold text-slate-800">{formData.applicantPhone}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-slate-500">จำนวนผู้เข้าพัก:</span>
                      <span className="font-bold text-slate-800">{formData.guestCount} คน</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-indigo-50 rounded-xl text-indigo-700 text-xs font-semibold text-center border border-indigo-100">
                    * เมื่อกดยืนยันแล้ว เจ้าหน้าที่จะติดต่อกลับเพื่อชี้แจงรายละเอียดมัดจำ
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3 pt-6 mt-4 border-t border-slate-100">
                {bookingStep > 1 && (
                  <button 
                    type="button"
                    onClick={() => setBookingStep(step => step - 1 as 1 | 2 | 3)}
                    className="py-3.5 px-6 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    ย้อนกลับ
                  </button>
                )}
                <button 
                  type="submit"
                  className="flex-1 py-3.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                  {bookingStep < 3 ? 'ถัดไป' : 'ยืนยันการจองห้อง'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Bill Search Modal */}
      {showBillSearch && !tenantBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">เช็คยอดบิลค่าเช่า</h3>
                <p className="text-slate-500 text-sm mt-1">สำหรับผู้เช่าปัจจุบัน</p>
              </div>
              <button onClick={() => { setShowBillSearch(false); setSearchError(''); }} className="text-slate-400 hover:text-slate-600 transition p-2 bg-slate-50 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchBill} className="space-y-4">
              {searchError && (
                <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100">
                  {searchError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หมายเลขห้อง</label>
                <input 
                  required
                  type="text" 
                  value={searchRoom}
                  onChange={e => setSearchRoom(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  placeholder="เช่น 101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้เช่า</label>
                <input 
                  required
                  type="text" 
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  placeholder="ชื่อ-นามสกุล ที่ทำสัญญาไว้"
                />
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
                >
                  ค้นหาบิล
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Tenant Bill Detail Modal */}
      {tenantBill && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">บิลค่าเช่าห้อง {tenantBill.number}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-slate-500">{tenantBill.tenantName}</p>
                  <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-full", tenantBill.isPaid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                    {tenantBill.isPaid ? "ชำระแล้ว" : "ค้างชำระ"}
                  </span>
                </div>
              </div>
              <button onClick={() => { setTenantBill(null); setShowBillSearch(false); setSearchError(''); }} className="text-slate-400 hover:text-slate-600 transition p-2 bg-slate-50 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <span className="text-slate-600">ค่าเช่าห้องพัก</span>
                <span className="font-semibold text-slate-800">
                  ฿{getRoomRent(tenantBill).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-600 block">ค่าน้ำประปา (18 บ./หน่วย)</span>
                  <span className="text-xs text-slate-400">มิเตอร์: {(tenantBill.lastWaterMeter || 0)} &rarr; {(tenantBill.currentWaterMeter || 0)}</span>
                </div>
                <span className="font-semibold text-slate-800">
                  ฿{(((tenantBill.currentWaterMeter || 0) - (tenantBill.lastWaterMeter || 0)) * 18).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-600 block">ค่าไฟฟ้า (8 บ./หน่วย)</span>
                  <span className="text-xs text-slate-400">มิเตอร์: {(tenantBill.lastElectricMeter || 0)} &rarr; {(tenantBill.currentElectricMeter || 0)}</span>
                </div>
                <span className="font-semibold text-slate-800">
                  ฿{(((tenantBill.currentElectricMeter || 0) - (tenantBill.lastElectricMeter || 0)) * 8).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-slate-800">ยอดชำระรวม</span>
                <span className="text-2xl font-bold text-indigo-600">
                  ฿{(
                    getRoomRent(tenantBill) + 
                    (((tenantBill.currentWaterMeter || 0) - (tenantBill.lastWaterMeter || 0)) * 18) + 
                    (((tenantBill.currentElectricMeter || 0) - (tenantBill.lastElectricMeter || 0)) * 8)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
               <button onClick={() => { setTenantBill(null); setShowBillSearch(false); setSearchError(''); }} className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition">
                 ปิดหน้าต่าง
               </button>
            </div>
          </motion.div>
        </div>
      )}
      
      <footer className="py-8 text-center text-slate-500 text-sm mt-12 border-t border-slate-200">
        &copy; {new Date().getFullYear()} Modern Stay Management.
      </footer>
    </div>
  );
}
