# EcoRoute 🚛
**Smart Real-Time Waste Collection PWA**
> Smart Waste. Smarter Cities. — Built for Mysuru, Karnataka

---

## 📁 Project Structure

```
ecoroute/
├── public/
│   ├── index.html          ← Main PWA (all screens)
│   ├── manifest.json       ← PWA manifest
│   ├── sw.js               ← Service worker (offline)
│   ├── css/
│   │   └── style.css       ← All styles (dark theme)
│   ├── js/
│   │   ├── config.js       ← 🔑 SET YOUR MAPBOX TOKEN HERE
│   │   ├── data.js         ← Mock users & data (Mysuru)
│   │   ├── map.js          ← Mapbox GL JS + routing + animation
│   │   └── app.js          ← Main app logic & navigation
│   └── images/
│       └── icon.png        ← App icon
├── server.js               ← Express server
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set your Mapbox Token
Open `public/js/config.js` and replace:
```js
MAPBOX_TOKEN: 'YOUR_MAPBOX_TOKEN_HERE',
```
With your actual token from https://account.mapbox.com/access-tokens/

> **Free tier:** 50,000 map loads/month + 100,000 directions/month — no cost.

### 3. Run the server
```bash
npm start
# or for dev with auto-restart:
npm run dev
```

### 4. Open in browser
```
http://localhost:3000
```

---

## 🗺️ Map Features

### How real-road routing works:
1. Switch to **Driver** role (tab on home screen)
2. Go to **Map** tab
3. Tap **"Start Collection Route"**
4. The app:
   - Filters users with fill level **> 70%** only
   - Calls **Mapbox Directions API** with all waypoints
   - Route: `Hebbal Depot → [active stops] → Vidyaranyapuram Dump Yard`
   - Draws **gradient route** (orange → cyan) on real roads
   - Animates 🚛 truck along the route with correct bearing/rotation
   - Shows **ETA card** and **stops list** in bottom sheet

---

## 👥 User Roles

| Role | Description |
|------|-------------|
| 🏠 Home User | Direct house garbage pickup |
| 🗑 Point User | Community bin reporting |
| 🚛 Driver | Route planning, truck tracking, live collection |

---

## 📍 Mock Data — Mysuru Locations

10 sample users across:
- Vijayanagar, Kuvempunagar, Saraswathipuram
- Jayalakshmipuram, Gokulam, Rajivnagar
- Nazarbad, Hebbal, Lashkar Mohalla, Devaraja

Fill levels are randomized; users with **≥ 70%** are flagged **active** (green pins) and included in driver route.

---

## 🤖 Chatbot

The AI waste classification model is a placeholder for now.  
To integrate your ML model later, update the `sendChatMessage()` function in `public/js/app.js`:

```js
// Replace this block in app.js:
async function sendChatMessage() {
  // Call your ML model API here
  const response = await fetch('/api/classify', {
    method: 'POST',
    body: JSON.stringify({ text: val })
  });
  const data = await response.json();
  appendChatMsg(data.reply, 'bot');
}
```

---

## 🔧 Configuration (config.js)

```js
MAPBOX_TOKEN: 'pk.eyJ1...',   // Your Mapbox token
MAP_STYLE: 'mapbox://styles/mapbox/dark-v11',  // Map style
DEPOT: { lng: 76.6180, lat: 12.3050 },         // Start point
DUMP_YARD: { lng: 76.6720, lat: 12.3680 },     // End point
ACTIVE_THRESHOLD: 70,   // Min fill % to include in route
ANIMATION_SPEED: 20,    // Truck animation frame delay (ms)
```

---

## 📱 PWA Installation

The app shows an install banner after 3 seconds on supported browsers.  
On iOS: tap **Share → Add to Home Screen**  
On Android: tap the banner or browser install prompt

---

## 🎨 Design System

- **Font:** Syne (display) + DM Sans (body)  
- **Accent:** `#FF6B00` Orange  
- **Background:** `#0A0A0A` (near-black)  
- **Active:** `#22C55E` Green (< 70% fill)  
- **Alert:** `#EF4444` Red (≥ 70% fill, needs collection)
