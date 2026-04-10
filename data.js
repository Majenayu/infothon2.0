// ============================================================
//  EcoRoute Mock Data — Mysuru, Karnataka
//  10 sample users with realistic coordinates and fill levels
// ============================================================

const MOCK_USERS = [
  {
    id: 'U001', name: 'Rahul Sharma', role: 'home',
    address: 'Vijayanagar 1st Stage, Mysuru',
    lng: 76.6082, lat: 12.3258,
    fillLevel: 85, lastReported: '2 hrs ago',
    avatar: null, points: 1250, phone: '+91 98450 12345'
  },
  {
    id: 'U002', name: 'Priya Nair', role: 'home',
    address: 'Kuvempunagar, Mysuru',
    lng: 76.6231, lat: 12.3441,
    fillLevel: 45, lastReported: '5 hrs ago',
    avatar: null, points: 870, phone: '+91 97424 56789'
  },
  {
    id: 'U003', name: 'Community Bin — Saraswathipuram', role: 'point',
    address: 'Saraswathipuram Main Road',
    lng: 76.6358, lat: 12.3312,
    fillLevel: 92, lastReported: '1 hr ago',
    avatar: null, points: 2100, phone: null
  },
  {
    id: 'U004', name: 'Deepak Hegde', role: 'home',
    address: 'Jayalakshmipuram, Mysuru',
    lng: 76.6501, lat: 12.3189,
    fillLevel: 78, lastReported: '3 hrs ago',
    avatar: null, points: 540, phone: '+91 99001 34567'
  },
  {
    id: 'U005', name: 'Community Bin — Gokulam', role: 'point',
    address: 'Gokulam 3rd Stage',
    lng: 76.6143, lat: 12.3502,
    fillLevel: 33, lastReported: '8 hrs ago',
    avatar: null, points: 1680, phone: null
  },
  {
    id: 'U006', name: 'Anitha Reddy', role: 'home',
    address: 'Rajivnagar, Mysuru',
    lng: 76.6620, lat: 12.3390,
    fillLevel: 73, lastReported: '2 hrs ago',
    avatar: null, points: 990, phone: '+91 96323 78901'
  },
  {
    id: 'U007', name: 'Community Bin — Nazarbad', role: 'point',
    address: 'Nazarbad Mohalla',
    lng: 76.6432, lat: 12.3088,
    fillLevel: 88, lastReported: '30 mins ago',
    avatar: null, points: 3200, phone: null
  },
  {
    id: 'U008', name: 'Suresh Kumar', role: 'home',
    address: 'Hebbal 2nd Stage, Mysuru',
    lng: 76.6195, lat: 12.2980,
    fillLevel: 55, lastReported: '6 hrs ago',
    avatar: null, points: 430, phone: '+91 94481 23456'
  },
  {
    id: 'U009', name: 'Meera Iyengar', role: 'home',
    address: 'Lashkar Mohalla, Mysuru',
    lng: 76.6553, lat: 12.3055,
    fillLevel: 95, lastReported: '45 mins ago',
    avatar: null, points: 1870, phone: '+91 93422 67890'
  },
  {
    id: 'U010', name: 'Community Bin — Devaraja', role: 'point',
    address: 'Devaraja Urs Road',
    lng: 76.6388, lat: 12.2940,
    fillLevel: 62, lastReported: '4 hrs ago',
    avatar: null, points: 760, phone: null
  }
];

// ── Collection History (enriched with fill % and photo placeholder) ──────────
const COLLECTION_HISTORY = [
  { date: 'Apr 7', status: 'completed', bins: 3, points: 100, fillLevel: 85, id: '#EC2704', time: '10:30 AM' },
  { date: 'Apr 6', status: 'completed', bins: 2, points: 100, fillLevel: 76, id: '#EC2603', time: '10:15 AM' },
  { date: 'Apr 5', status: 'completed', bins: 3, points: 100, fillLevel: 91, id: '#EC2502', time: '10:45 AM' },
  { date: 'Apr 4', status: 'missed',    bins: 0, points:   0, fillLevel: 0,  id: '#EC2401', time: '—' },
  { date: 'Apr 3', status: 'missed',    bins: 0, points:   0, fillLevel: 0,  id: '#EC2301', time: '—' },
  { date: 'Apr 2', status: 'completed', bins: 4, points: 100, fillLevel: 88, id: '#EC2201', time: '10:20 AM' },
  { date: 'Apr 1', status: 'completed', bins: 1, points: 50,  fillLevel: 72, id: '#EC2101', time: '11:00 AM' },
  { date: 'Mar 31', status: 'missed',   bins: 0, points:  0,  fillLevel: 0,  id: '#EC3101', time: '—' },
  { date: 'Mar 30', status: 'completed',bins: 2, points: 100, fillLevel: 80, id: '#EC3001', time: '10:30 AM' },
];

// ── Leaderboard (sorted correctly by points desc) ───────────────────────────
const LEADERBOARD = [
  { rank: 1, name: 'Community Bin — Nazarbad', avatar: null, points: 3200, badge: 'Eco Champion', isMe: false },
  { rank: 2, name: 'Alex_T',                   avatar: null, points: 3850, badge: 'Eco Warrior',  isMe: false },
  { rank: 3, name: 'GreenRider99',              avatar: null, points: 3420, badge: 'Route Reporter',isMe: false },
  { rank: 4, name: 'Meera Iyengar',             avatar: null, points: 1870, badge: 'Eco Star',     isMe: false },
  { rank: 5, name: 'Ayush Rai',                 avatar: null, points: 1250, badge: 'Eco Starter',  isMe: true  },
];

// ── Redeem Catalog (points cost + item) ─────────────────────────────────────
const REDEEM_CATALOG = [
  { id: 'R01', icon: '👜', name: 'Eco Tote Bag',   cost: 500,  desc: 'Reusable organic cotton tote bag.' },
  { id: 'R02', icon: '🪴', name: 'Indoor Plant',   cost: 800,  desc: 'A small succulent for your home.' },
  { id: 'R03', icon: '☕', name: 'Café Voucher',   cost: 1000, desc: '₹50 off at partner eco-cafés.' },
  { id: 'R04', icon: '🌱', name: 'Sapling Kit',    cost: 300,  desc: 'Grow your own herb garden.' },
  { id: 'R05', icon: '♻️', name: 'Recycle Bin',   cost: 1200, desc: 'Colour-coded home recycling set.' },
  { id: 'R06', icon: '💡', name: 'LED Bulb Pack',  cost: 600,  desc: 'Energy-saving LED starter pack.' },
];

// ── Mock Notifications ───────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  { id: 'N1', text: 'Your bin is scheduled for pickup Today at 10:30 AM', time: '6:00 AM', read: false, type: 'pickup' },
  { id: 'N2', text: 'You earned 100 points for your Apr 7 report! 🎉',    time: 'Yesterday', read: false, type: 'reward' },
  { id: 'N3', text: 'Leaderboard updated — you moved up 2 spots!',        time: '2 days ago', read: true,  type: 'leaderboard' },
];

// ── Current logged-in user (simulated) ──────────────────────────────────────────────
const CURRENT_USER = {
  id: 'U001', name: 'Ayush Rai', nickname: 'Ayush', role: 'home',
  address: 'Gokulam 3rd Stage, Mysuru, Karnataka',
  location: { lat: 12.3502, lng: 76.6143 },
  lng: 76.6143, lat: 12.3502,
  fillLevel: 85, points: 1250,
  phone: '+91 98450 12345',
  nextPickup: 'Today 10:30 AM',
  collectionsThisMonth: 7,
  totalRedeemed: 2,
  isActiveToday: null  // null = not yet confirmed, true/false = confirmed
};
