import { useState } from 'react';
import { useData } from '../lib/DataContext';
import { Room } from '../types';
import { FileText, CheckCircle, Receipt, Save, Printer, CalendarDays } from 'lucide-react';
import { cn, getRoomRent } from '../lib/utils';
import * as motion from 'motion/react-client';

export default function AdminBilling() {
  const { rooms, updateRoom } = useData();
  const occupiedRooms = rooms.filter(r => r.status === 'occupied');

  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [confirmRollover, setConfirmRollover] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    currentWaterMeter?: number;
    currentElectricMeter?: number;
    customRent?: number;
  }>({});

  const WATER_RATE = 18; // 18 baht per unit
  const ELECTRIC_RATE = 8; // 8 baht per unit

  const calculateTotal = (room: Room) => {
    let total = getRoomRent(room);

    if (room.currentWaterMeter && room.lastWaterMeter) {
      total += (room.currentWaterMeter - room.lastWaterMeter) * WATER_RATE;
    }
    if (room.currentElectricMeter && room.lastElectricMeter) {
      total += (room.currentElectricMeter - room.lastElectricMeter) * ELECTRIC_RATE;
    }
    return total;
  };

  const getNextDueDate = (moveInDate?: string, isPaid?: boolean) => {
    const today = new Date();
    
    let dueDay = 5; 
    if (moveInDate) {
      const moveIn = new Date(moveInDate);
      if (!isNaN(moveIn.getTime())) {
        dueDay = moveIn.getDate();
      }
    }
    
    // Find the closest due date (last month, this month, or next month)
    const lastMonthDue = new Date(today.getFullYear(), today.getMonth() - 1, dueDay);
    const thisMonthDue = new Date(today.getFullYear(), today.getMonth(), dueDay);
    const nextMonthDue = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
    
    const diffLast = Math.abs(today.getTime() - lastMonthDue.getTime());
    const diffThis = Math.abs(today.getTime() - thisMonthDue.getTime());
    const diffNext = Math.abs(today.getTime() - nextMonthDue.getTime());
    
    let closestDue = thisMonthDue;
    if (diffLast < diffThis) closestDue = lastMonthDue;
    if (diffNext < diffThis && diffNext < diffLast) closestDue = nextMonthDue;
    
    // If paid, the next due date is 1 month after the closest due date
    let targetDate = new Date(closestDue);
    if (isPaid) {
      targetDate.setMonth(targetDate.getMonth() + 1);
    }
    
    return targetDate.toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' });
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room.id);
    setEditValues({
      currentWaterMeter: room.currentWaterMeter || 0,
      currentElectricMeter: room.currentElectricMeter || 0,
      customRent: getRoomRent(room)
    });
  };

  const handleSave = async (roomId: string) => {
    if (!editingRoom) return;
    
    // Auto-calculate total and set to unpaid if meters changed
    await updateRoom(roomId, {
      ...editValues,
      isPaid: false
    });
    setEditingRoom(null);
    setEditValues({});
  };

  const handleNextMonth = async (room: Room) => {
    await updateRoom(room.id, {
      lastWaterMeter: room.currentWaterMeter || 0,
      lastElectricMeter: room.currentElectricMeter || 0,
      isPaid: false
    });
    setConfirmRollover(null);
  };

  const handlePrint = (room: Room) => {
    const totalRent = getRoomRent(room);
    const waterTotal = ((room.currentWaterMeter || 0) - (room.lastWaterMeter || 0)) * WATER_RATE;
    const electricTotal = ((room.currentElectricMeter || 0) - (room.lastElectricMeter || 0)) * ELECTRIC_RATE;
    const grandTotal = totalRent + waterTotal + electricTotal;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('กรุณาอนุญาต Pop-up เพื่อพิมพ์บิล');

    printWindow.document.write(`
      <html>
        <head>
          <title>ใบแจ้งหนี้ ห้อง ${room.number}</title>
          <style>
            body { font-family: 'Sarabun', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { margin: 0; color: #1e40af; font-size: 28px; }
            .header p { margin: 5px 0; color: #666; }
            .info { display: flex; justify-content: space-between; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
            table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
            th { font-weight: bold; color: #666; }
            .text-right { text-align: right; }
            .total-row { font-size: 20px; font-weight: bold; background: #f8fafc; }
            .footer { margin-top: 50px; text-align: center; color: #666; font-size: 14px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MODERN STAY</h1>
            <p>ใบแจ้งหนี้ประจำเดือน (Invoice)</p>
          </div>
          <div class="info">
            <div>
              <strong>ผู้เช่า:</strong> ${room.tenantName}<br>
              <strong>ห้องพัก:</strong> ${room.number} (${room.type})
            </div>
            <div class="text-right">
              <strong>วันที่:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>สถานะ:</strong> ${room.isPaid ? 'ชำระแล้ว' : 'รอชำระเงิน'}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>รายการ</th>
                <th class="text-right">จำนวนหน่วย</th>
                <th class="text-right">ราคา/หน่วย</th>
                <th class="text-right">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ค่าเช่าห้องพัก</td>
                <td class="text-right">1</td>
                <td class="text-right">${totalRent.toLocaleString()}</td>
                <td class="text-right">${totalRent.toLocaleString()}</td>
              </tr>
              <tr>
                <td>ค่าน้ำประปา (มิเตอร์ ${room.lastWaterMeter || 0} - ${room.currentWaterMeter || 0})</td>
                <td class="text-right">${(room.currentWaterMeter || 0) - (room.lastWaterMeter || 0)}</td>
                <td class="text-right">${WATER_RATE}</td>
                <td class="text-right">${waterTotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td>ค่าไฟฟ้า (มิเตอร์ ${room.lastElectricMeter || 0} - ${room.currentElectricMeter || 0})</td>
                <td class="text-right">${(room.currentElectricMeter || 0) - (room.lastElectricMeter || 0)}</td>
                <td class="text-right">${ELECTRIC_RATE}</td>
                <td class="text-right">${electricTotal.toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" class="text-right" style="padding-top: 20px;">ยอดรวมทั้งสิ้น</td>
                <td class="text-right" style="padding-top: 20px; color: #1e40af;">${grandTotal.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            <p>กรุณาชำระเงินภายในวันที่ ${getNextDueDate(room.moveInDate, false)}</p>
            <p>ขอขอบคุณที่ใช้บริการ Modern Stay</p>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert('กรุณาอนุญาต Pop-up เพื่อพิมพ์บิล');

    const totalIncome = occupiedRooms.reduce((sum, room) => sum + calculateTotal(room), 0);
    const currentDate = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

    const tableRows = occupiedRooms.map(room => {
      const rent = getRoomRent(room);
      const waterTotal = ((room.currentWaterMeter || 0) - (room.lastWaterMeter || 0)) * WATER_RATE;
      const electricTotal = ((room.currentElectricMeter || 0) - (room.lastElectricMeter || 0)) * ELECTRIC_RATE;
      const grandTotal = rent + waterTotal + electricTotal;
      const status = room.isPaid ? 'ชำระแล้ว' : 'ค้างชำระ';
      const statusColor = room.isPaid ? 'color: #059669;' : 'color: #e11d48;';
      
      return `
        <tr>
          <td class="text-center">${room.number}</td>
          <td>${room.tenantName}</td>
          <td class="text-right">${rent.toLocaleString()}</td>
          <td class="text-right">${waterTotal.toLocaleString()}</td>
          <td class="text-right">${electricTotal.toLocaleString()}</td>
          <td class="text-right font-bold">${grandTotal.toLocaleString()}</td>
          <td class="text-center" style="${statusColor} font-weight: bold;">${status}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>สรุปยอดค่าใช้จ่ายประจำเดือน</title>
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Sarabun', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { margin: 0; color: #1e40af; font-size: 28px; }
            .header p { margin: 5px 0; color: #666; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
            th, td { padding: 12px; border: 1px solid #e2e8f0; }
            th { background-color: #f8fafc; font-weight: bold; text-align: center; color: #475569; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .summary { background: #f1f5f9; padding: 20px; border-radius: 8px; font-size: 18px; text-align: right; font-weight: bold; color: #0f172a; border: 1px solid #e2e8f0; }
            .print-btn { padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; font-family: 'Sarabun', sans-serif; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); transition: background 0.2s; }
            .print-btn:hover { background: #4338ca; }
            @media print {
              body { padding: 0; }
              .print-btn { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MODERN STAY</h1>
            <p>สรุปยอดค่าใช้จ่ายผู้เช่าทั้งหมด</p>
            <p>ประจำวันที่ ${currentDate}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>ห้อง</th>
                <th>ผู้เช่า</th>
                <th>ค่าเช่า (฿)</th>
                <th>ค่าน้ำ (฿)</th>
                <th>ค่าไฟ (฿)</th>
                <th>ยอดรวม (฿)</th>
                <th>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
          <div class="summary">
            คาดการณ์ยอดเรียกเก็บรวมทั้งหมด: ${totalIncome.toLocaleString()} บาท
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
            <button class="print-btn" onclick="window.print()">พิมพ์เอกสารสรุปยอด</button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const togglePaid = (roomId: string, currentStatus: boolean) => {
    updateRoom(roomId, { isPaid: !currentStatus });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex bg-white rounded-[1.5rem] border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-400/10 to-transparent rounded-bl-full -z-10"></div>
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-700 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-sm border border-indigo-200/50">
          <Receipt className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">ระบบจัดการค่าเช่าและบิล</h2>
          <p className="text-slate-500 mt-2 font-medium">บันทึกมิเตอร์น้ำ-ไฟ และสรุปยอดค่าใช้จ่ายประจำเดือนสำหรับผู้เช่าทั้งหมด</p>
        </div>
        <div className="ml-auto">
          <button 
            onClick={handlePrintAll}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-all duration-300 shadow-md hover:shadow-indigo-600/20"
          >
            <FileText className="w-4 h-4" /> พิมพ์สรุปยอดทั้งหมด
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-100 p-2 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto flex-1 custom-scrollbar pb-4 pr-2">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">
              <tr>
                <th className="pb-4 px-4 text-slate-500 w-24">ห้องพัก</th>
                <th className="pb-4 px-4 text-slate-500 w-48">ผู้เช่า</th>
                <th className="pb-4 px-4 text-slate-500">ค่าเช่า(฿)</th>
                <th className="pb-4 px-4 text-slate-500 text-center">มิเตอร์น้ำ <span className="text-[10px] font-normal lowercase tracking-normal">(ด.ก่อน/ปัจจุบัน)</span></th>
                <th className="pb-4 px-4 text-slate-500 text-center">มิเตอร์ไฟ <span className="text-[10px] font-normal lowercase tracking-normal">(ด.ก่อน/ปัจจุบัน)</span></th>
                <th className="pb-4 px-4 text-slate-500 text-right">ยอดรวม(฿)</th>
                <th className="pb-4 px-4 text-center text-slate-500">สถานะ</th>
                <th className="pb-4 px-4 text-right text-slate-500 w-48">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-slate-50">
              {occupiedRooms.map(room => (
                <tr key={room.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-5 px-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex flex-col items-center justify-center font-display shadow-inner border border-slate-200/50">
                      <span className="text-base font-bold leading-none">{room.number}</span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <div className="font-semibold text-slate-800">{room.tenantName}</div>
                    {room.moveInDate && (
                      <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                        เข้าพัก: {new Date(room.moveInDate).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </td>
                  <td className="py-5 px-4">
                    {editingRoom === room.id ? (
                      <input 
                        type="number" 
                        value={editValues.customRent || ''} 
                        onChange={(e) => setEditValues({...editValues, customRent: Number(e.target.value)})}
                        className="w-24 px-3 py-1.5 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold"
                      />
                    ) : (
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">฿{getRoomRent(room).toLocaleString()}</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{room.activeBookingType === 'daily' ? 'รายวัน' : 'รายเดือน'}</span>
                      </div>
                    )}
                  </td>
                  
                  {/* Water */}
                  <td className="py-5 px-4">
                    {room.activeBookingType === 'daily' ? (
                      <div className="flex justify-center text-slate-300 font-bold">-</div>
                    ) : editingRoom === room.id ? (
                      <div className="flex items-center justify-center gap-2 bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                        <span className="text-slate-400 w-8 text-right font-medium">{room.lastWaterMeter || 0}</span>
                        <span className="text-slate-300">/</span>
                        <input 
                          type="number" 
                          value={editValues.currentWaterMeter || ''} 
                          onChange={(e) => setEditValues({...editValues, currentWaterMeter: Number(e.target.value)})}
                          className="w-20 px-2 py-1.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white font-semibold text-center"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 bg-slate-50 p-2 rounded-xl">
                        <span className="text-slate-400 font-medium">{room.lastWaterMeter || 0}</span> 
                        <span className="text-slate-300">/</span> 
                        <span className="font-bold text-blue-600">{room.currentWaterMeter || 0}</span>
                      </div>
                    )}
                  </td>

                  {/* Electric */}
                  <td className="py-5 px-4">
                    {room.activeBookingType === 'daily' ? (
                      <div className="flex justify-center text-slate-300 font-bold">-</div>
                    ) : editingRoom === room.id ? (
                      <div className="flex items-center justify-center gap-2 bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                        <span className="text-slate-400 w-8 text-right font-medium">{room.lastElectricMeter || 0}</span>
                        <span className="text-slate-300">/</span>
                        <input 
                          type="number" 
                          value={editValues.currentElectricMeter || ''} 
                          onChange={(e) => setEditValues({...editValues, currentElectricMeter: Number(e.target.value)})}
                          className="w-20 px-2 py-1.5 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white font-semibold text-center"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 bg-slate-50 p-2 rounded-xl">
                        <span className="text-slate-400 font-medium">{room.lastElectricMeter || 0}</span> 
                        <span className="text-slate-300">/</span> 
                        <span className="font-bold text-amber-600">{room.currentElectricMeter || 0}</span>
                      </div>
                    )}
                  </td>

                  <td className="py-5 px-4 text-right">
                    <span className="text-xl font-display font-bold text-slate-900">
                      ฿{calculateTotal(room).toLocaleString()}
                    </span>
                  </td>

                  <td className="py-5 px-4 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <button 
                        onClick={() => togglePaid(room.id, !!room.isPaid)}
                        className={cn(
                          "px-4 py-1.5 text-xs font-bold rounded-full transition-all shadow-sm w-full max-w-[100px]",
                          room.isPaid 
                            ? "bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200 border border-emerald-200" 
                            : "bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200"
                        )}
                      >
                        {room.isPaid ? 'ชำระแล้ว' : 'ค้างชำระ'}
                      </button>
                      <span className="text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-center">
                        {room.activeBookingType === 'daily' ? (
                          <>เช็คเอาท์ {room.moveOutDate ? new Date(room.moveOutDate).toLocaleDateString('th-TH', { year: '2-digit', month: 'short', day: 'numeric' }) : '-'}</>
                        ) : (
                          <>{room.isPaid ? 'กำหนดรอบหน้า' : 'ครบกำหนด'} {getNextDueDate(room.moveInDate, room.isPaid)}</>
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="py-5 px-4 text-right">
                    {editingRoom === room.id ? (
                      <button 
                        onClick={() => handleSave(room.id)}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20 text-sm font-semibold flex items-center justify-center gap-2 ml-auto shrink-0 whitespace-nowrap"
                      >
                        <Save className="w-4 h-4" /> บันทึก
                      </button>
                    ) : (
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        {room.isPaid && room.activeBookingType !== 'daily' && (
                          confirmRollover === room.id ? (
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleNextMonth(room)}
                                className="px-3 py-2 bg-rose-500 text-white hover:bg-rose-600 rounded-xl transition text-xs font-bold shrink-0 whitespace-nowrap"
                              >
                                ยืนยัน
                              </button>
                              <button 
                                onClick={() => setConfirmRollover(null)}
                                className="px-3 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-xl transition text-xs font-bold shrink-0 whitespace-nowrap"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setConfirmRollover(room.id)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-xl transition text-xs font-bold border border-emerald-200/50 shrink-0 whitespace-nowrap"
                              title="ขึ้นรอบบิลใหม่ (ยกยอดมิเตอร์และตั้งเป็นค้างชำระ)"
                            >
                              <CalendarDays className="w-3.5 h-3.5 shrink-0" /> ขึ้นรอบใหม่
                            </button>
                          )
                        )}
                        <button 
                          onClick={() => handlePrint(room)}
                          className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all shrink-0"
                          title="พิมพ์ใบเสร็จ"
                        >
                          <Printer className="w-4 h-4 shrink-0" />
                        </button>
                        {room.activeBookingType !== 'daily' && (
                          <button 
                            onClick={() => handleEdit(room)}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition text-sm font-semibold shadow-sm shrink-0 whitespace-nowrap"
                          >
                            จดมิเตอร์
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {occupiedRooms.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p>ยังไม่มีผู้เช่าห้องพัก</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
