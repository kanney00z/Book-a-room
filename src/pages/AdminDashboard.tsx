import { useState } from 'react';
import { useData } from '../lib/DataContext';
import { Home, Users, Wallet, AlertCircle, TrendingUp, QrCode, X, Copy } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { printContract } from '../lib/utils';
import { Room, BookingRequest } from '../types';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminDashboard() {
  const { rooms, bookings, approveBooking, rejectBooking, settings, expenses } = useData();
  const [showQR, setShowQR] = useState(false);

  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const vacantRooms = rooms.filter(r => r.status === 'vacant').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
  
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  const stats = [
    { label: 'ห้องพักทั้งหมด', value: rooms.length, icon: Home, bg: 'bg-blue-100', color: 'text-blue-700' },
    { label: 'มีผู้เช่าแล้ว', value: occupiedRooms, icon: Users, bg: 'bg-emerald-100', color: 'text-emerald-700' },
    { label: 'ห้องว่าง', value: vacantRooms, icon: Wallet, bg: 'bg-amber-100', color: 'text-amber-700' },
    { label: 'คำขอจองห้องรอรอการตรวจสอบ', value: pendingBookings, icon: AlertCircle, bg: 'bg-orange-100', color: 'text-orange-700' }
  ];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const revenue = rooms.filter(r => r.status === 'occupied').reduce((acc, curr) => acc + curr.monthlyRent, 0);
  
  const currentMonthExpenses = expenses
    .filter(e => {
      const d = new Date(e.expense_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const netProfit = revenue - currentMonthExpenses;

  // Mock data for beautiful charts
  const revenueData = [
    { name: 'ต.ค.', revenue: revenue * 0.8, expenses: currentMonthExpenses * 0.7 },
    { name: 'พ.ย.', revenue: revenue * 0.85, expenses: currentMonthExpenses * 0.8 },
    { name: 'ธ.ค.', revenue: revenue * 0.9, expenses: currentMonthExpenses * 0.6 },
    { name: 'ม.ค.', revenue: revenue * 0.95, expenses: currentMonthExpenses * 1.1 },
    { name: 'ก.พ.', revenue: revenue * 0.98, expenses: currentMonthExpenses * 0.9 },
    { name: 'มี.ค.', revenue: revenue, expenses: currentMonthExpenses },
  ];

  const occupancyData = [
    { name: 'ว่าง', value: vacantRooms, color: '#6366f1' }, // Indigo
    { name: 'มีผู้เช่า', value: occupiedRooms, color: '#10b981' }, // Emerald
    { name: 'ซ่อมบำรุง', value: maintenanceRooms, color: '#f59e0b' } // Amber
  ];

  const handleApprove = async (booking: BookingRequest, room?: Room) => {
    await approveBooking(booking.id);
    if (room && window.confirm('อนุมัติการจองสำเร็จ ต้องการพิมพ์สัญญาเช่าสำหรับห้องนี้เลยหรือไม่?')) {
      const updatedRoom: Room = {
        ...room,
        status: 'occupied',
        tenantName: booking.applicantName,
        tenantPhone: booking.applicantPhone,
        moveInDate: booking.requestedMoveInDate,
        activeBookingType: booking.bookingType
      };
      printContract(updatedRoom, settings.hotelName);
    }
  };

  return (
    <div className="space-y-4 h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat 1 */}
        <div className="bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-bl-full -z-10"></div>
          <div className="flex justify-between items-start">
            <span className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm border border-emerald-100/50">
              <Home className="w-6 h-6" />
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-full backdrop-blur-sm">ทั้งหมด {rooms.length}</span>
          </div>
          <div className="mt-6">
            <p className="text-slate-500 font-medium text-sm mb-1">ห้องว่าง (Available)</p>
            <h3 className="text-4xl font-display font-bold text-slate-900 tracking-tight">{vacantRooms} <span className="text-xl text-slate-400 font-sans">/ {rooms.length}</span></h3>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-transparent rounded-bl-full -z-10"></div>
          <div className="flex justify-between items-start">
            <span className="p-3 bg-amber-50 rounded-2xl text-amber-600 shadow-sm border border-amber-100/50">
              <Users className="w-6 h-6" />
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-3 py-1.5 rounded-full backdrop-blur-sm">ซ่อม {maintenanceRooms}</span>
          </div>
          <div className="mt-6">
            <p className="text-slate-500 font-medium text-sm mb-1">ห้องเช่าแล้ว (Occupied)</p>
            <h3 className="text-4xl font-display font-bold text-slate-900 tracking-tight">{occupiedRooms} <span className="text-xl text-slate-400 font-sans">/ {rooms.length}</span></h3>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-transparent rounded-bl-full -z-10"></div>
          <div className="flex justify-between items-start">
            <span className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100/50">
              <Wallet className="w-6 h-6" />
            </span>
            {pendingBookings > 0 && <span className="text-xs font-bold text-orange-700 bg-orange-100/80 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm animate-pulse">จอง {pendingBookings}</span>}
          </div>
          <div className="mt-6">
            <p className="text-slate-500 font-medium text-sm mb-1">กำไรสุทธิ (Net Profit)</p>
            <h3 className="text-4xl font-display font-bold text-indigo-600 tracking-tight">฿{netProfit.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-[1.5rem] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-display font-bold text-slate-900 text-xl tracking-tight">แนวโน้มรายได้ 6 เดือนล่าสุด</h2>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><TrendingUp className="w-4 h-4 text-emerald-500" /> เติบโต +5.2% จากเดือนที่แล้ว</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>ปีนี้</option>
              <option>ปีที่แล้ว</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} tickFormatter={(value) => `฿${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number, name: string) => [`฿${value.toLocaleString()}`, name === 'revenue' ? 'รายได้' : 'รายจ่าย']}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }}/>
                <Area type="monotone" name="รายได้" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" name="รายจ่าย" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-white rounded-[1.5rem] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <div className="mb-6">
            <h2 className="font-display font-bold text-slate-900 text-xl tracking-tight">อัตราการเข้าพัก</h2>
            <p className="text-sm text-slate-500 mt-1">สัดส่วนสถานะห้องทั้งหมด</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`${value} ห้อง`, 'จำนวน']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-3xl font-display font-bold text-slate-800">{Math.round((occupiedRooms / (rooms.length || 1)) * 100)}%</span>
                <span className="text-xs text-slate-500">อัตราเช่า</span>
              </div>
            </div>
            
            <div className="w-full grid grid-cols-3 gap-2 mt-4">
              {occupancyData.map((item) => (
                <div key={item.name} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></span>
                    <span className="text-xs text-slate-500">{item.name}</span>
                  </div>
                  <p className="font-bold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="bg-white rounded-[1.5rem] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-display font-bold text-slate-900 text-2xl tracking-tight">รายการคำขอจองล่าสุด</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowQR(true)}
                className="flex items-center gap-1.5 text-sm px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl font-semibold text-indigo-600 transition-colors"
              >
                <QrCode className="w-4 h-4" /> QR Code ให้ลูกค้าจอง
              </button>
              <button className="text-sm px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl font-semibold text-slate-600 transition-colors">ดูทั้งหมด</button>
            </div>
          </div>
          
          {bookings.filter(b => b.status === 'pending').length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <AlertCircle className="w-10 h-10 mb-3 opacity-20" />
              <p className="font-medium text-slate-500">ไม่มีคำขอจองใหม่</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="pb-4 px-4">ผู้จอง</th>
                    <th className="pb-4 px-4">ห้องที่ต้องการ</th>
                    <th className="pb-4 px-4">เบอร์ติดต่อ</th>
                    <th className="pb-4 px-4 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                  {bookings.filter(b => b.status === 'pending').map(booking => {
                    const room = rooms.find(r => r.id === booking.roomId);
                    return (
                      <tr key={booking.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-4 font-medium">{booking.applicantName}</td>
                        <td className="py-4">
                          <div>ห้อง {room?.number} ({room?.type})</div>
                          <div className="text-xs text-indigo-600 mt-1 inline-flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {booking.bookingType === 'daily' ? 'รายวัน' : 'รายเดือน'}
                          </div>
                        </td>
                        <td className="py-4 text-slate-500">
                          <div><span className="text-xs font-semibold mr-1">เบอร์:</span>{booking.applicantPhone}</div>
                          <div className="text-xs mt-1">
                            <span className="font-semibold text-slate-700">วันที่: </span> 
                            {new Date(booking.requestedMoveInDate).toLocaleDateString('th-TH')}
                            {booking.bookingType === 'daily' && booking.requestedMoveOutDate && ` - ${new Date(booking.requestedMoveOutDate).toLocaleDateString('th-TH')}`}
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => handleApprove(booking, room)}
                              className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium hover:bg-emerald-200 transition"
                            >
                              อนุมัติ
                            </button>
                            <button 
                              onClick={() => rejectBooking(booking.id)}
                              className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium hover:bg-rose-200 transition"
                            >
                              ปฏิเสธ
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Share Booking QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div 
            className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-sm w-full shadow-2xl relative overflow-hidden text-center animate-in fade-in zoom-in duration-200"
          >
            <button 
              onClick={() => setShowQR(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-2 bg-slate-50 hover:bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex justify-center mb-4 mt-2">
              <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600">
                <QrCode className="w-8 h-8" />
              </div>
            </div>
            
            <h3 className="text-xl font-display font-bold text-slate-900 mb-2">QR Code สำหรับจองห้องพัก</h3>
            <p className="text-sm font-medium text-slate-500 mb-8">สแกนเพื่อเข้าสู่เว็บไซต์จองห้องพักของคุณ</p>
            
            <div className="flex justify-center mb-8 p-4 bg-white border-2 border-slate-100 rounded-3xl inline-block mx-auto shadow-sm">
              <QRCodeSVG 
                value={window.location.origin} 
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#0f172a"}
                level={"H"}
                includeMargin={false}
              />
            </div>

            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-2 pl-4 text-left">
              <span className="text-xs text-slate-500 font-mono truncate">{window.location.origin}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  alert('คัดลอกลิงก์สำเร็จ!');
                }}
                className="p-2 bg-white rounded-lg shadow-sm text-slate-600 hover:text-indigo-600 transition-colors shrink-0"
                title="คัดลอกลิงก์"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
