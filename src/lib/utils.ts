import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Room } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRoomRent(room: Room) {
  // If we have a custom rent set manually, use it
  if (room.customRent) return room.customRent;
  
  // See if the room is occupied by someone who booked daily
  if (room.activeBookingType === 'daily' && room.dailyRent) {
    if (room.moveInDate && room.moveOutDate) {
      const start = new Date(room.moveInDate).getTime();
      const end = new Date(room.moveOutDate).getTime();
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return room.dailyRent * (diffDays > 0 ? diffDays : 1);
    }
    return room.dailyRent;
  }
  return room.monthlyRent;
}

export function printContract(room: Room, hotelName: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return alert('กรุณาอนุญาต Pop-up เพื่อพิมพ์สัญญาเช่า');

  const checkInDate = room.moveInDate 
    ? new Date(room.moveInDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="th">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>สัญญาเช่าห้องพัก - ห้อง ${room.number}</title>
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Sarabun', sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 40px;
            background: white;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
          }
          .hotel-name {
            font-size: 28px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 5px 0;
          }
          .document-title {
            font-size: 20px;
            font-weight: 600;
            color: #475569;
            margin: 0;
          }
          .contract-date {
            text-align: right;
            font-size: 14px;
            color: #64748b;
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            margin-top: 25px;
            margin-bottom: 15px;
            color: #334155;
            background: #f8fafc;
            padding: 8px 12px;
            border-left: 4px solid #4f46e5;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          .info-item {
            font-size: 15px;
          }
          .info-label {
            font-weight: 600;
            color: #475569;
            width: 120px;
            display: inline-block;
          }
          .info-value {
            font-weight: 500;
            border-bottom: 1px dotted #cbd5e1;
            padding-bottom: 2px;
          }
          .terms {
            font-size: 14px;
            color: #475569;
            margin-top: 20px;
          }
          .terms li {
            margin-bottom: 8px;
          }
          .signatures {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 80px;
            text-align: center;
          }
          .signature-box {
            padding: 20px;
          }
          .signature-line {
            border-bottom: 1px solid #94a3b8;
            margin-bottom: 10px;
            height: 40px;
          }
          .print-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4f46e5;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
          @media print {
            .print-btn { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="hotel-name">${hotelName || 'Modern Stay'}</h1>
          <h2 class="document-title">สัญญาเช่าห้องพัก / หนังสือตกลงการเข้าพัก</h2>
        </div>

        <div class="contract-date">
          ทำสัญญา ณ วันที่: ${checkInDate}
        </div>

        <div class="section-title">ข้อมูลห้องพักและอัตราค่าเช่า</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">หมายเลขห้อง:</span>
            <span class="info-value">${room.number}</span>
          </div>
          <div class="info-item">
            <span class="info-label">ประเภทห้อง:</span>
            <span class="info-value">${room.type}</span>
          </div>
          <div class="info-item">
            <span class="info-label">อัตราค่าเช่า:</span>
            <span class="info-value">
              ${getRoomRent(room).toLocaleString()} บาท / ${room.activeBookingType === 'daily' ? 'วัน' : 'เดือน'}
            </span>
          </div>
        </div>

        <div class="section-title">ข้อมูลผู้เช่า</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">ชื่อ-นามสกุล:</span>
            <span class="info-value">${room.tenantName || '-'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">เบอร์โทรศัพท์:</span>
            <span class="info-value">${room.tenantPhone || '-'}</span>
          </div>
        </div>

        <div class="section-title">เงื่อนไขการเช่าพัก (เบื้องต้น)</div>
        <ul class="terms">
          <li>ผู้เช่าตกลงชำระค่าเช่าห้องพักล่วงหน้าตามรอบที่กำหนด</li>
          <li>ห้ามมิให้นำสิ่งผิดกฎหมาย หรือสารเสพติดเข้ามาในบริเวณที่พักโดยเด็ดขาด</li>
          <li>ห้ามส่งเสียงดังรบกวนผู้เช่าห้องอื่น โดยเฉพาะหลังเวลา 22:00 น.</li>
          <li>ผู้เช่าต้องรับผิดชอบต่อความเสียหายที่เกิดขึ้นกับทรัพย์สินภายในห้องพักอันเกิดจากการกระทำของผู้เช่า</li>
        </ul>

        <div class="signatures">
          <div class="signature-box">
            ${room.contractSignature 
              ? '<img src="' + room.contractSignature + '" alt="Signature" style="height: 50px; object-fit: contain; margin-bottom: 0px;" />'
              : '<div class="signature-line"></div>'}
            <div>( ${room.tenantName || 'ผู้เช่า'} )</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 5px;">ผู้เช่า / ผู้เข้าพัก</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div>( ${hotelName || 'ผู้ให้เช่า'} )</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 5px;">ผู้ให้เช่า / ผู้รับมอบอำนาจ</div>
          </div>
        </div>

        <button class="print-btn" onclick="window.print()">พิมพ์สัญญาเช่า</button>
      </body>
    </html>
  `);
  
  printWindow.document.close();
}
