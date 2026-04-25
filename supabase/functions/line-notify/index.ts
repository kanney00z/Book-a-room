import "jsr:@supabase/functions-js/edge-runtime.d.ts";

function createBookingFlex(data: any) {
  // Format amount
  const formattedAmount = data.amount ? Number(data.amount).toLocaleString() + ' บาท' : 'ไม่ระบุ';
  
  // Format dates
  const formatDate = (d: string) => {
    if (!d || d === 'ไม่ระบุ') return 'ไม่ระบุ';
    return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const moveInDate = formatDate(data.moveInDate);
  const moveOutDate = formatDate(data.moveOutDate);

  // Define date contents based on booking type
  const dateContents = [];
  if (data.bookingType === 'รายวัน') {
    dateContents.push(
      {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          { "type": "text", "text": "เช็คอิน", "color": "#8c8c8c", "size": "sm", "flex": 2 },
          { "type": "text", "text": moveInDate, "wrap": true, "color": "#ea580c", "size": "md", "weight": "bold", "flex": 4 }
        ],
        "margin": "md"
      },
      {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          { "type": "text", "text": "เช็คเอาท์", "color": "#8c8c8c", "size": "sm", "flex": 2 },
          { "type": "text", "text": moveOutDate, "wrap": true, "color": "#ea580c", "size": "md", "weight": "bold", "flex": 4 }
        ],
        "margin": "md"
      }
    );
  } else {
    dateContents.push(
      {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          { "type": "text", "text": "เข้าพักวันที่", "color": "#8c8c8c", "size": "sm", "flex": 2 },
          { "type": "text", "text": moveInDate, "wrap": true, "color": "#ea580c", "size": "md", "weight": "bold", "flex": 4 }
        ],
        "margin": "md"
      }
    );
  }

  return {
    "type": "flex",
    "altText": "🎉 มีรายการจองห้องพักใหม่",
    "contents": {
      "type": "bubble",
      "header": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "NEW BOOKING",
            "weight": "bold",
            "color": "#ffffff",
            "size": "sm"
          },
          {
            "type": "text",
            "text": "มีการจองห้องพักใหม่!",
            "weight": "bold",
            "size": "xl",
            "color": "#ffffff",
            "margin": "md"
          }
        ],
        "backgroundColor": "#4f46e5",
        "paddingAll": "20px"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "ห้องพัก",
                "color": "#8c8c8c",
                "size": "sm",
                "flex": 2
              },
              {
                "type": "text",
                "text": String(data.roomNumber),
                "wrap": true,
                "color": "#111827",
                "size": "md",
                "weight": "bold",
                "flex": 4
              }
            ],
            "margin": "md"
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "ชื่อผู้จอง",
                "color": "#8c8c8c",
                "size": "sm",
                "flex": 2
              },
              {
                "type": "text",
                "text": String(data.name),
                "wrap": true,
                "color": "#111827",
                "size": "md",
                "weight": "bold",
                "flex": 4
              }
            ],
            "margin": "md"
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "เบอร์โทร",
                "color": "#8c8c8c",
                "size": "sm",
                "flex": 2
              },
              {
                "type": "text",
                "text": String(data.phone),
                "wrap": true,
                "color": "#111827",
                "size": "md",
                "weight": "bold",
                "flex": 4
              }
            ],
            "margin": "md"
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "จำนวนผู้พัก",
                "color": "#8c8c8c",
                "size": "sm",
                "flex": 2
              },
              {
                "type": "text",
                "text": `${data.guestCount || 1} คน`,
                "wrap": true,
                "color": "#111827",
                "size": "md",
                "weight": "bold",
                "flex": 4
              }
            ],
            "margin": "md"
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "รูปแบบ",
                "color": "#8c8c8c",
                "size": "sm",
                "flex": 2
              },
              {
                "type": "text",
                "text": String(data.bookingType),
                "wrap": true,
                "color": "#4f46e5",
                "size": "md",
                "weight": "bold",
                "flex": 4
              }
            ],
            "margin": "md"
          },
          ...dateContents,
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "ยอดเงิน",
                "color": "#8c8c8c",
                "size": "sm",
                "flex": 2
              },
              {
                "type": "text",
                "text": formattedAmount,
                "wrap": true,
                "color": "#059669",
                "size": "md",
                "weight": "bold",
                "flex": 4
              }
            ],
            "margin": "md"
          }
        ],
        "paddingAll": "20px"
      }
    }
  };
}

function createMaintenanceFlex(data: any) {
  return {
    "type": "flex",
    "altText": "🛠️ แจ้งซ่อมด่วน",
    "contents": {
      "type": "bubble",
      "header": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "MAINTENANCE",
            "weight": "bold",
            "color": "#ffffff",
            "size": "sm"
          },
          {
            "type": "text",
            "text": "มีการแจ้งซ่อมใหม่",
            "weight": "bold",
            "size": "xl",
            "color": "#ffffff",
            "margin": "md"
          }
        ],
        "backgroundColor": "#ea580c",
        "paddingAll": "20px"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "ห้องพัก",
                "color": "#8c8c8c",
                "size": "sm",
                "flex": 2
              },
              {
                "type": "text",
                "text": String(data.roomNumber),
                "wrap": true,
                "color": "#111827",
                "size": "md",
                "weight": "bold",
                "flex": 4
              }
            ],
            "margin": "md"
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "ปัญหา",
                "color": "#8c8c8c",
                "size": "sm",
                "flex": 2
              },
              {
                "type": "text",
                "text": String(data.title),
                "wrap": true,
                "color": "#ea580c",
                "size": "md",
                "weight": "bold",
                "flex": 4
              }
            ],
            "margin": "md"
          },
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "รายละเอียด",
                "color": "#8c8c8c",
                "size": "sm",
                "margin": "md"
              },
              {
                "type": "text",
                "text": String(data.description || '-'),
                "wrap": true,
                "color": "#4b5563",
                "size": "sm",
                "margin": "sm"
              }
            ]
          }
        ],
        "paddingAll": "20px"
      }
    }
  };
}

function createCheckoutFlex(data: any) {
  return {
    "type": "flex",
    "altText": "👋 มีลูกค้าย้ายออกและคืนห้องพัก",
    "contents": {
      "type": "bubble",
      "header": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": "CHECK OUT",
            "weight": "bold",
            "color": "#ffffff",
            "size": "sm"
          },
          {
            "type": "text",
            "text": "มีลูกค้าย้ายออก",
            "weight": "bold",
            "size": "xl",
            "color": "#ffffff",
            "margin": "md"
          }
        ],
        "backgroundColor": "#dc2626",
        "paddingAll": "20px"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "ห้องพัก",
                "color": "#8c8c8c",
                "size": "sm",
                "flex": 2
              },
              {
                "type": "text",
                "text": String(data.roomNumber),
                "wrap": true,
                "color": "#111827",
                "size": "md",
                "weight": "bold",
                "flex": 4
              }
            ],
            "margin": "md"
          },
          {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "ชื่อผู้เช่า",
                "color": "#8c8c8c",
                "size": "sm",
                "flex": 2
              },
              {
                "type": "text",
                "text": String(data.tenantName || 'ไม่ระบุ'),
                "wrap": true,
                "color": "#111827",
                "size": "md",
                "weight": "bold",
                "flex": 4
              }
            ],
            "margin": "md"
          },
          {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "สถานะปัจจุบัน",
                "color": "#8c8c8c",
                "size": "sm",
                "margin": "md"
              },
              {
                "type": "text",
                "text": "🟢 ห้องว่าง (ลบข้อมูลเดิมแล้ว)",
                "wrap": true,
                "color": "#059669",
                "size": "sm",
                "margin": "sm",
                "weight": "bold"
              }
            ]
          }
        ],
        "paddingAll": "20px"
      }
    }
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }});
  }

  try {
    const payload = await req.json();
    
    // Hardcoded credentials for convenience
    const accessToken = "RNRkGEiBB4MLS6V1A0fjzMbuUIBKU3QhDDOxp1GZFZimOkPwMCZuQSFR4k/UMnqUzh/QzamSMBVz50pcurdIAzL3PZxV7p1wvmibXLXl6dc9DLKudYqpG6kDa0OWPzzMLyFmPBCCXZk4lJkJAJlRyAdB04t89/1O/w1cDnyilFU=";
    const adminUserId = "U13e4406579a66d398c92dcac87ab6b3a";

    let messageObj;
    if (payload.type === 'booking') {
      messageObj = createBookingFlex(payload);
    } else if (payload.type === 'maintenance') {
      messageObj = createMaintenanceFlex(payload);
    } else if (payload.type === 'checkout') {
      messageObj = createCheckoutFlex(payload);
    } else {
      messageObj = {
        type: "text",
        text: JSON.stringify(payload)
      };
    }

    // Call LINE Messaging API (Push Message)
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        to: adminUserId,
        messages: [messageObj]
      })
    });

    const result = await response.json().catch(() => ({ status: response.status }));

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});
