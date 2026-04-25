import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../lib/DataContext';
import { supabase } from '../lib/supabase';
import { LogOut, Receipt, QrCode, Wrench, AlertCircle, CheckCircle, Clock, X, Copy } from 'lucide-react';
import * as motion from 'motion/react-client';
import { cn, getRoomRent } from '../lib/utils';

export default function TenantDashboard() {
  const navigate = useNavigate();
  const { rooms, maintenanceRequests, addMaintenanceRequest, updateRoom, settings } = useData();
  const [roomId, setRoomId] = useState(localStorage.getItem('tenantRoomId'));
  
  const [isReporting, setIsReporting] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{title: string, message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (!roomId) {
      navigate('/tenant/login');
    }
  }, [roomId, navigate]);

  const room = rooms.find(r => r.id === roomId);

  if (!room) return null;

  const handleLogout = () => {
    localStorage.removeItem('tenantRoomId');
    navigate('/tenant/login');
  };

  const submitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;
    addMaintenanceRequest({
      roomId: room.id,
      title: reportTitle,
      description: reportDesc
    });
    setIsReporting(false);
    setReportTitle('');
    setReportDesc('');
    setToastMessage({
      title: 'ส่งเรื่องสำเร็จ',
      message: 'ส่งเรื่องแจ้งซ่อมเรียบร้อยแล้ว ช่างจะติดต่อกลับโดยเร็วที่สุด',
      type: 'success'
    });
  };

  const waterTotal = ((room.currentWaterMeter || 0) - (room.lastWaterMeter || 0)) * 18;
  const electricTotal = ((room.currentElectricMeter || 0) - (room.lastElectricMeter || 0)) * 8;
  const grandTotal = getRoomRent(room) + waterTotal + electricTotal;

  const myRequests = maintenanceRequests.filter(r => r.roomId === room.id);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-500 selection:text-white pb-20">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white flex items-center justify-center font-bold font-display shadow-lg shadow-blue-500/20">
            {room.number}
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">{settings.hotelName || 'Modern Stay'}</h1>
            <p className="text-xs text-slate-500 font-medium">ห้อง {room.number} • {room.tenantName}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 mt-8 space-y-8">
        {/* Bill Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-2xl flex items-center gap-2">
              <Receipt className="w-6 h-6 text-blue-500" /> บิลค่าเช่าเดือนนี้
            </h2>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-bold shadow-sm", 
              room.isPaid ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : 
              room.paymentSlipUrl ? "bg-amber-100 text-amber-700 border border-amber-200" : 
              "bg-rose-100 text-rose-700 border border-rose-200 animate-pulse"
            )}>
              {room.isPaid ? "ชำระแล้ว" : room.paymentSlipUrl ? "รอตรวจสอบสลิป" : "รอชำระเงิน"}
            </span>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-slate-600 font-medium">ค่าเช่าห้องพัก</span>
                <span className="font-bold text-slate-800 text-lg">฿{getRoomRent(room).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <span className="text-slate-600 font-medium block">ค่าน้ำประปา (18 บ./หน่วย)</span>
                  <span className="text-xs text-slate-400 font-medium mt-0.5 block">
                    มิเตอร์: {(room.lastWaterMeter || 0)} &rarr; {(room.currentWaterMeter || 0)}
                  </span>
                </div>
                <span className="font-bold text-slate-800 text-lg">฿{waterTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <span className="text-slate-600 font-medium block">ค่าไฟฟ้า (8 บ./หน่วย)</span>
                  <span className="text-xs text-slate-400 font-medium mt-0.5 block">
                    มิเตอร์: {(room.lastElectricMeter || 0)} &rarr; {(room.currentElectricMeter || 0)}
                  </span>
                </div>
                <span className="font-bold text-slate-800 text-lg">฿{electricTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">ยอดรวมที่ต้องชำระ</p>
                <p className="text-4xl font-display font-bold text-blue-600">
                  ฿{grandTotal.toLocaleString()}
                </p>
              </div>
              
              {!room.isPaid && !room.paymentSlipUrl && (
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                >
                  <QrCode className="w-5 h-5" /> สแกนจ่าย PromptPay
                </button>
              )}
              {!room.isPaid && room.paymentSlipUrl && (
                <div className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-100 text-amber-700 rounded-xl font-bold border border-amber-200">
                  <Clock className="w-5 h-5" /> ส่งสลิปแล้ว กำลังรอตรวจสอบ
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Maintenance Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-2xl flex items-center gap-2">
              <Wrench className="w-6 h-6 text-orange-500" /> แจ้งซ่อม
            </h2>
            <button 
              onClick={() => setIsReporting(!isReporting)}
              className="text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition"
            >
              {isReporting ? 'ยกเลิก' : '+ แจ้งปัญหาใหม่'}
            </button>
          </div>

          {isReporting && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={submitReport}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 mb-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">หัวข้อปัญหา</label>
                  <input 
                    required
                    type="text" 
                    value={reportTitle}
                    onChange={e => setReportTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    placeholder="เช่น แอร์ไม่เย็น, ท่อน้ำตัน"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">รายละเอียด</label>
                  <textarea 
                    value={reportDesc}
                    onChange={e => setReportDesc(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none h-24"
                    placeholder="อธิบายเพิ่มเติม (ถ้ามี)"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md shadow-orange-500/20">
                  ส่งเรื่องแจ้งซ่อม
                </button>
              </div>
            </motion.form>
          )}

          <div className="space-y-4">
            {myRequests.length === 0 ? (
              <div className="bg-slate-100/50 rounded-2xl p-8 text-center border border-slate-200/50 text-slate-500 font-medium">
                ไม่มีประวัติการแจ้งซ่อม
              </div>
            ) : (
              myRequests.map((req, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={req.id} 
                  className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">{req.title}</h4>
                    <p className="text-sm text-slate-500 mb-2">{req.description}</p>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      วันที่แจ้ง: {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="shrink-0">
                    {req.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold bg-amber-50 text-amber-600 border border-amber-200/50">
                        <AlertCircle className="w-4 h-4" /> รอดำเนินการ
                      </span>
                    )}
                    {req.status === 'in_progress' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold bg-blue-50 text-blue-600 border border-blue-200/50">
                        <Clock className="w-4 h-4" /> กำลังซ่อมแซม
                      </span>
                    )}
                    {req.status === 'completed' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/50">
                        <CheckCircle className="w-4 h-4" /> เสร็จสิ้น
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* PromptPay Mock Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-center"
          >
            <button 
              onClick={() => setShowPaymentModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-2 bg-slate-50 hover:bg-slate-100 rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex justify-center mb-2 mt-2">
              <div className="bg-[#113566] text-white px-6 py-1.5 rounded-full font-bold text-lg tracking-wide shadow-md">
                PromptPay
              </div>
            </div>
            
            <p className="text-sm font-semibold text-slate-500 mb-2">สแกน QR Code เพื่อชำระเงิน</p>
            <p className="text-md font-bold text-slate-800 mb-1">{settings.promptpayName}</p>
            <p className="text-sm font-medium text-slate-600 mb-6">{settings.promptpayNumber}</p>

            {/* Mock QR Code Image Placeholder */}
            <div className="w-48 h-48 mx-auto bg-white border-8 border-slate-100 rounded-2xl shadow-sm flex items-center justify-center p-2 mb-6">
              <img 
                src={`https://promptpay.io/${settings.promptpayNumber}/${grandTotal}.png`} 
                alt="PromptPay QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">ยอดชำระทั้งหมด</p>
              <p className="text-2xl font-display font-bold text-blue-600">฿{grandTotal.toLocaleString()}</p>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-6">
              <p className="text-sm font-bold text-slate-700 mb-3 text-left">อัปโหลดหลักฐานการโอนเงิน</p>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Receipt className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500 font-medium">คลิกเพื่ออัปโหลดสลิป</p>
                      <p className="text-xs text-slate-400 mt-1">JPEG, PNG, หรือ JPG</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                  if (!e.target.files || e.target.files.length === 0) return;
                  const file = e.target.files[0];
                  
                  // @ts-ignore
                  setIsUploading(true);
                  const fileExt = file.name.split('.').pop();
                  const fileName = `slip-${room.number}-${Date.now()}.${fileExt}`;
                  
                  // @ts-ignore
                  const { error: uploadError } = await supabase.storage
                    .from('room-images')
                    .upload(fileName, file);

                  if (uploadError) {
                    console.error(uploadError);
                    setToastMessage({
                      title: 'ข้อผิดพลาด',
                      message: 'อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่',
                      type: 'error'
                    });
                    // @ts-ignore
                    setIsUploading(false);
                    return;
                  }

                  // @ts-ignore
                  const { data } = supabase.storage.from('room-images').getPublicUrl(fileName);
                  
                  if (room.id) {
                    updateRoom(room.id, { paymentSlipUrl: data.publicUrl });
                  }
                  
                  // @ts-ignore
                  setIsUploading(false);
                  setShowPaymentModal(false);
                  setToastMessage({
                    title: 'อัปโหลดสำเร็จ',
                    message: 'อัปโหลดหลักฐานการโอนเงินเรียบร้อยแล้ว กรุณารอแอดมินตรวจสอบ',
                    type: 'success'
                  });
                }} disabled={isUploading} />
              </label>
            </div>
          </motion.div>
        </div>
      )}

      {/* Beautiful Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
              "w-full rounded-2xl p-4 shadow-xl shadow-slate-900/10 border flex items-start gap-3 backdrop-blur-md",
              toastMessage.type === 'success' ? "bg-emerald-50/95 border-emerald-200" : "bg-rose-50/95 border-rose-200"
            )}
          >
            <div className="shrink-0 mt-0.5">
              {toastMessage.type === 'success' ? (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className={cn("font-bold text-sm", toastMessage.type === 'success' ? "text-emerald-800" : "text-rose-800")}>
                {toastMessage.title}
              </h4>
              <p className={cn("text-xs font-medium mt-0.5", toastMessage.type === 'success' ? "text-emerald-600" : "text-rose-600")}>
                {toastMessage.message}
              </p>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className={cn("p-1 rounded-full transition-colors", toastMessage.type === 'success' ? "hover:bg-emerald-100 text-emerald-500" : "hover:bg-rose-100 text-rose-500")}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
          
          {/* Auto dismiss logic */}
          <span className="hidden">
            {setTimeout(() => setToastMessage(null), 4000)}
          </span>
        </div>
      )}
    </div>
  );
}
