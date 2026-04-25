import { Room } from '../types';
import { cn } from '../lib/utils';
import * as motion from 'motion/react-client';

interface FloorPlanViewProps {
  rooms: Room[];
  onRoomClick: (r: Room) => void;
  onRoomMove: (room: Room, x: number, y: number) => void;
}

export default function FloorPlanView({ rooms, onRoomClick, onRoomMove }: FloorPlanViewProps) {
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
        <h2 className="font-display text-2xl font-bold text-slate-900">แผนผังอาคาร (Floor Plan)</h2>
        <div className="flex gap-4 text-sm font-medium bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-1.5 text-indigo-600"><span className="w-3 h-3 rounded-full bg-indigo-400"></span> ว่าง</div>
          <div className="flex items-center gap-1.5 text-emerald-600"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> มีผู้เช่า</div>
          <div className="flex items-center gap-1.5 text-amber-600"><span className="w-3 h-3 rounded-full bg-amber-400"></span> ซ่อมบำรุง</div>
        </div>
      </div>
      
      <div className="p-4 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-sm font-medium shadow-inner">
        💡 <strong>เคล็ดลับ:</strong> คุณสามารถคลิกค้างที่การ์ดห้องพักแล้วลาก (Drag & Drop) เพื่อจัดตำแหน่งให้ตรงกับแผนผังตึกจริงของคุณได้เลย! ระบบจะบันทึกตำแหน่งอัตโนมัติ
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
            
            <div className="w-full h-[600px] bg-slate-100/50 rounded-[1.5rem] relative overflow-hidden border border-slate-200/50 shadow-inner" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
               {floorRooms.map((room, idx) => {
                 return (
                   <motion.div
                     drag
                     dragMomentum={false}
                     initial={{ opacity: 0, scale: 0.9, x: room.posX || (idx % 5) * 160 + 20, y: room.posY || Math.floor(idx / 5) * 180 + 20 }}
                     animate={{ opacity: 1, scale: 1, x: room.posX || (idx % 5) * 160 + 20, y: room.posY || Math.floor(idx / 5) * 180 + 20 }}
                     onDragEnd={(_, info) => {
                       const newX = (room.posX || (idx % 5) * 160 + 20) + info.offset.x;
                       const newY = (room.posY || Math.floor(idx / 5) * 180 + 20) + info.offset.y;
                       onRoomMove(room, newX, newY);
                     }}
                     style={{ position: 'absolute' }}
                     key={room.id}
                     className={cn(
                       "w-32 h-40 rounded-2xl border-2 flex flex-col items-center justify-center p-3 transition-colors duration-300 shadow-lg cursor-grab active:cursor-grabbing backdrop-blur-sm",
                       room.status === 'occupied' ? "bg-emerald-50/90 border-emerald-300 text-emerald-800" :
                       room.status === 'vacant' ? "bg-white/90 border-indigo-200 text-indigo-700" :
                       "bg-amber-50/90 border-amber-300 text-amber-800"
                     )}
                   >
                     <div className={cn("absolute top-3 right-3 w-3 h-3 rounded-full",
                       room.status === 'occupied' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                       room.status === 'vacant' ? "bg-indigo-400" : "bg-amber-400"
                     )}></div>
                     <span className="text-4xl font-display font-bold tracking-tight mt-2">{room.number}</span>
                     <span className="text-[10px] mt-1 font-bold uppercase tracking-widest opacity-60">{room.type}</span>
                     
                     <div className="mt-auto w-full pt-2">
                       <button 
                         onClick={() => onRoomClick(room)}
                         className={cn(
                           "w-full py-1.5 text-xs font-bold rounded-lg transition-colors border",
                           room.status === 'occupied' ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" :
                           room.status === 'vacant' ? "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100" :
                           "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
                         )}
                       >
                         {room.status === 'occupied' ? 'ดูข้อมูลผู้เช่า' : 'รายละเอียด'}
                       </button>
                     </div>
                   </motion.div>
                 );
               })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
