import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as motion from 'motion/react-client';
import { Home, Phone, ArrowRight, HomeIcon } from 'lucide-react';
import { useData } from '../lib/DataContext';
import { cn } from '../lib/utils';

export default function TenantLogin({ onLogin }: { onLogin: (roomId: string) => void }) {
  const [roomNumber, setRoomNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { rooms } = useData();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const room = rooms.find(r => r.number === roomNumber && r.status === 'occupied');
    
    // For demo purposes, we allow room 101 with any phone or matching the exact room tenant
    if (room && (room.tenantPhone === phone || (roomNumber === '101' && phone === '0812345678'))) {
      onLogin(room.id);
      navigate('/tenant/dashboard');
    } else {
      // Create a demo fallback if no occupied room matches but they typed 101
      const fallbackRoom = rooms.find(r => r.number === '101');
      if (roomNumber === '101' && phone === '0812345678' && fallbackRoom) {
        onLogin(fallbackRoom.id);
        navigate('/tenant/dashboard');
      } else {
        setError('ไม่พบข้อมูลผู้เช่า กรุณาตรวจสอบหมายเลขห้องและเบอร์โทรศัพท์');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-slate-100 flex items-center justify-center p-4 relative overflow-hidden z-0">
      <div className="absolute top-0 left-0 -translate-y-12 -translate-x-1/3 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
      <div className="absolute bottom-0 right-0 translate-y-1/3 translate-x-1/3 w-[600px] h-[600px] bg-teal-200/40 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-[2.5rem] p-10 shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-white/50 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-teal-500 to-blue-500"></div>
          
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-6 relative group">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity"></div>
              <HomeIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-slate-900 tracking-tight">Tenant Portal</h1>
            <p className="text-sm font-medium text-slate-500 mt-2">เข้าสู่ระบบสำหรับผู้เช่าเพื่อดูบิลและแจ้งซ่อม</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-xl border border-rose-100 text-center">
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">หมายเลขห้อง</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Home className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                  placeholder="เช่น 101"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">เบอร์โทรศัพท์ที่ลงทะเบียน</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                  placeholder="เช่น 0812345678"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl text-sm font-bold text-white bg-slate-900 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-md hover:shadow-blue-600/20",
                  isLoading && "opacity-70 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    กำลังตรวจสอบ...
                  </span>
                ) : (
                  <>
                    เข้าสู่ระบบ <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
            
            <div className="text-center mt-6">
               <p className="text-xs text-slate-400">Demo Login: ห้อง <strong className="text-slate-600">101</strong> / โทร <strong className="text-slate-600">0812345678</strong></p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
