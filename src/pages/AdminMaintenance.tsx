import { useData } from '../lib/DataContext';
import { MaintenanceRequest } from '../types';
import { Wrench, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import * as motion from 'motion/react-client';

export default function AdminMaintenance() {
  const { maintenanceRequests, updateMaintenanceStatus, deleteMaintenanceRequest, rooms } = useData();

  const columns = [
    { id: 'pending', title: 'รอดำเนินการ', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    { id: 'in_progress', title: 'กำลังซ่อมแซม', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'completed', title: 'เสร็จสิ้น', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' }
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex bg-white rounded-[1.5rem] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-400/10 to-transparent rounded-bl-full -z-10"></div>
        <div className="w-16 h-16 bg-gradient-to-br from-orange-50 to-amber-100 text-orange-700 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-sm border border-orange-200/50">
          <Wrench className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">ระบบแจ้งซ่อม (Maintenance)</h2>
          <p className="text-slate-500 mt-2 font-medium">จัดการคำร้องแจ้งซ่อมจากผู้เช่า ลากเปลี่ยนสถานะได้ทันที</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-4">
        {columns.map(col => {
          const reqs = maintenanceRequests.filter(r => r.status === col.id);
          return (
            <div key={col.id} className="bg-slate-100/50 rounded-[1.5rem] p-4 flex flex-col h-full border border-slate-200/50">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className={cn("font-display font-bold text-lg flex items-center gap-2", col.color)}>
                  <col.icon className="w-5 h-5" />
                  {col.title}
                </h3>
                <span className="bg-white text-slate-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-slate-200">
                  {reqs.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {reqs.map((req, idx) => {
                  const room = rooms.find(r => r.id === req.roomId);
                  return (
                    <motion.div 
                      key={req.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200">
                          ห้อง {room ? room.number : 'ไม่ทราบ'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                          {col.id === 'completed' && (
                            <button 
                              onClick={() => {
                                if (window.confirm('ต้องการลบรายการแจ้งซ่อมนี้ใช่หรือไม่?')) {
                                  deleteMaintenanceRequest(req.id);
                                }
                              }}
                              className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                              title="ลบรายการนี้"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1">{req.title}</h4>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{req.description}</p>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                        {col.id !== 'pending' && (
                          <button 
                            onClick={() => updateMaintenanceStatus(req.id, 'pending')}
                            className="flex-1 text-xs font-bold py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          >
                            รอดำเนินการ
                          </button>
                        )}
                        {col.id !== 'in_progress' && (
                          <button 
                            onClick={() => updateMaintenanceStatus(req.id, 'in_progress')}
                            className="flex-1 text-xs font-bold py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            กำลังซ่อม
                          </button>
                        )}
                        {col.id !== 'completed' && (
                          <button 
                            onClick={() => updateMaintenanceStatus(req.id, 'completed')}
                            className="flex-1 text-xs font-bold py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          >
                            เสร็จสิ้น
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
                {reqs.length === 0 && (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-sm font-medium text-slate-400">ไม่มีรายการ</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
