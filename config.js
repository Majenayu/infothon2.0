// ============================================================
//  EcoRoute Configuration
// ============================================================

const ECOROUTE_CONFIG = {
  // 🔑 Mapbox PUBLIC token (must start with pk. — get from https://account.mapbox.com)
  MAPBOX_TOKEN: 'YOUR_MAPBOX_TOKEN_HERE',

  // Map settings
  MAP_STYLE: 'mapbox://styles/mapbox/satellite-streets-v12',
  DEFAULT_CENTER: [76.638, 12.322], // Centroid of all 5 Gokulam zone boxes, Mysuru
  DEFAULT_ZOOM: 14,

  // Depot and dump yard
  DEPOT: { lng: 76.6180, lat: 12.3050, name: 'Hebbal Depot' },
  DUMP_YARD: { lng: 76.6720, lat: 12.3680, name: 'Vidyaranyapuram Dump Yard' },

  ACTIVE_THRESHOLD: 70,
  ANIMATION_SPEED: 1,

  POINTS: {
    REPORT_FILL: 100,
    CONFIRM_PICKUP: 50,
    EARLY_CONFIRM: 10
  },

  // 🤖 Chatbot — set ENABLED: true after adding credentials
  CHATBOT: {
    API_KEY: 'YOUR_CHATBOT_API_KEY_HERE',
    API_ENDPOINT: 'YOUR_CHATBOT_API_ENDPOINT_HERE',
    MODEL: 'YOUR_MODEL_NAME_HERE',
    ENABLED: false
  },

  // ──────────────────────────────────────────────────────────
  // 🌿 BACKEND API
  //   The Express server handles MongoDB and JWT auth.
  //   Change API_BASE only if you deploy to a different host.
  // ──────────────────────────────────────────────────────────
  API_BASE: ''   // Empty = same origin (localhost:3000). Set to your deployed URL when hosting.
};
