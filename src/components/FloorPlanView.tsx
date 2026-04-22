import { Room } from '../types';
import { cn } from '../lib/utils';
import * as motion from 'motion/react-client';

export default function FloorPlanView({ rooms, onRoomClick }: { rooms: Room[], onRoomClick: (r: Room) => void }) {
  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => b - a);

  if (rooms.length === 0) {
    return (
      <div className="text-center py-24 glass-card rounded-3xl">
        <h3 className="text-2xl font-display font-bold text-slate-800">ไม่มีข้อมูลห้องพัก</h3>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-slate-50/50 p-4 md:p-8 rounded-[2rem] border border-slate-100/50 mt-6">
      <div className="flex justify-between items-end">
        <h2 className="font-display text-2xl font-bold text-slate-900">แผนผังอาคาร</h2>
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-1.5 text-indigo-600"><span className="w-3 h-3 rounded-full bg-indigo-400"></span> ว่าง</div>
          <div className="flex items-center gap-1.5 text-emerald-600"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> มีผู้เช่า</div>
          <div className="flex items-center gap-1.5 text-amber-600"><span className="w-3 h-3 rounded-full bg-amber-400"></span> ซ่อมบำรุง</div>
        </div>
      </div>

      {floors.map(floor => {
        const floorRooms = rooms.filter(r => r.floor === floor).sort((a, b) => a.number.localeCompare(b.number));
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={floor} 
            className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
          >
            <h3 className="text-xl font-display font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg border border-indigo-100/50 shadow-sm">{floor}</span>
              ชั้นที่ {floor}
            </h3>
            
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center bg-slate-100/50 p-8 rounded-[1.5rem] relative overflow-hidden border border-slate-200/50">
               {/* Decorative structural elements */}
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200"></div>
               <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200"></div>
               
               {floorRooms.map((room, idx) => (
                 <motion.button
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: idx * 0.05 }}
                   whileHover={{ scale: 1.05, y: -4 }}
                   whileTap={{ scale: 0.95 }}
                   key={room.id}
                   onClick={() => onRoomClick(room)}
                   className={cn(
                     "relative w-32 h-44 rounded-2xl border-2 flex flex-col items-center justify-center p-3 transition-all duration-300 shadow-sm",
                     room.status === 'occupied' ? "bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:shadow-emerald-200" :
                     room.status === 'vacant' ? "bg-white border-indigo-100 text-indigo-700 hover:border-indigo-400 hover:shadow-indigo-200" :
                     "bg-amber-50/80 border-amber-200 text-amber-800 hover:shadow-amber-200"
                   )}
                 >
                   <div className={cn("absolute top-3 right-3 w-3 h-3 rounded-full",
                     room.status === 'occupied' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                     room.status === 'vacant' ? "bg-indigo-400" : "bg-amber-400"
                   )}></div>
                   <span className="text-4xl font-display font-bold tracking-tight">{room.number}</span>
                   <span className="text-[10px] mt-2 font-bold uppercase tracking-widest opacity-60">{room.type}</span>
                   
                   {room.status === 'occupied' ? (
                     <div className="mt-auto w-full pt-2 border-t border-emerald-200/50">
                       <span className="text-xs font-semibold truncate w-full block text-center text-emerald-700">
                         {room.tenantName?.split(' ')[0] || 'Tenant'}
                       </span>
                     </div>
                   ) : room.status === 'vacant' ? (
                     <div className="mt-auto w-full pt-2 border-t border-indigo-100/50">
                       <span className="text-xs font-semibold truncate w-full block text-center text-indigo-500">
                         ว่าง
                       </span>
                     </div>
                   ) : (
                     <div className="mt-auto w-full pt-2 border-t border-amber-200/50">
                       <span className="text-xs font-semibold truncate w-full block text-center text-amber-600">
                         ซ่อมบำรุง
                       </span>
                     </div>
                   )}
                 </motion.button>
               ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
