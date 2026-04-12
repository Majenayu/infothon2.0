// ============================================================
//  EcoRoute — Express Server
//  - Serves the PWA from /public
//  - MongoDB via Mongoose for user storage
//  - JWT for stateless auth
//
//  🔧 SETUP:
//    1.  npm install  (installs all dependencies)
//    2.  Create a .env file (see .env.example)
//    3.  npm start
// ============================================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── AI Integration ──────────────────────────────────────────
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const WASTE_ANALYSIS_SYSTEM_PROMPT = `You are the EcoScan AI Waste Assistant. Your goal is to accurately categorize waste and provide disposal instructions.
Analyze the provided text or image and return a JSON response with:
{
  "category": "Recyclable" | "Organic" | "Hazardous" | "Landfill",
  "item": "Name of the item",
  "confidence": "Low" | "Medium" | "High",
  "instructions": "Step-by-step disposal guide",
  "eco_tip": "A short, encouraging sustainability tip",
  "language": "Detected language (English, Hindi, or Kannada)"
}
Be concise and helpful. If multiple items are present, focus on the most prominent one.`;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── MongoDB Connection ────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://majen:majen@majen.f3jgom3.mongodb.net/?appName=majen';

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB connected');
      seedMocks();
    })
    .catch(err => console.error('❌ MongoDB error:', err.message));
} else {
  console.warn('⚠️  MONGO_URI not set — running without database (demo mode).');
  console.warn('   Create a .env file with: MONGO_URI=mongodb+srv://...');
}

// ── Mongoose Schema ───────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nickname: { type: String },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String },
  role: { type: String, enum: ['home', 'point', 'driver'], default: 'home' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  area: { type: String, default: 'unassigned' }, // User's assigned geographic zone
  location: {
    lat: { type: Number, default: 12.3375 },
    lng: { type: Number, default: 76.6394 }
  },
  points: { type: Number, default: 0 },
  collectionsThisMonth: { type: Number, default: 0 },
  totalRedeemed: { type: Number, default: 0 },
  isActiveToday: { type: Boolean, default: null },
  nextPickup: { type: String, default: 'TBD' },
  fillLevel: { type: Number, default: 85 },
  fcmToken: { type: String, default: null },
  // Driver-specific
  empId: { type: String, sparse: true },
  pin: { type: String },   // store hashed in production
  isOnline: { type: Boolean, default: false },
  assignedAreas: { type: [String], default: [] }, // Array of zones this driver manages
  isReserve: { type: Boolean, default: false }    // If true, this is the master fallback driver
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const overloadRequestSchema = new mongoose.Schema({
  area: { type: String, required: true },
  requestedBy: { type: String, required: true }, // driver userId
  status: { type: String, enum: ['pending', 'accepted', 'assigned_to_reserve'], default: 'pending' },
  acceptedBy: { type: String, default: null }, // driver userId who picked it up
  expiresAt: { type: Date, required: true }
}, { timestamps: true });
const OverloadRequest = mongoose.models.OverloadRequest || mongoose.model('OverloadRequest', overloadRequestSchema);

const tripSchema = new mongoose.Schema({
  driverId: { type: String },
  waypoints: { type: Array },
  duration: { type: Number },
  geometry: { type: Object }, // GeoJSON route
  status: { type: String, enum: ['started', 'active', 'completed'], default: 'started' }
}, { timestamps: true });
const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);

const systemStateSchema = new mongoose.Schema({
  isBlocked: { type: Boolean, default: false },
  blockedBy: { type: String, default: null }
}, { timestamps: true });
const SystemState = mongoose.models.SystemState || mongoose.model('SystemState', systemStateSchema);

const collectionLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['collected', 'missed'], required: true },
  points: { type: Number, default: 0 }
}, { timestamps: true });
const CollectionLog = mongoose.models.CollectionLog || mongoose.model('CollectionLog', collectionLogSchema);

const publicNotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  role: { type: String, default: 'home' },
  type: { type: String, default: 'morning_alert' },
  timestamp: { type: Date, default: Date.now }
}, { expires: 86400 }); // Expire logs after 24 hrs
const PublicNotification = mongoose.models.PublicNotification || mongoose.model('PublicNotification', publicNotificationSchema);

// Driver daily summary — tracks what the driver verified/collected each day
const driverDailySummarySchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  date:     { type: String, required: true }, // YYYY-MM-DD
  housePickups:           { type: Number, default: 0 },
  communityVerifications: { type: Number, default: 0 },
  pointsDistributed:      { type: Number, default: 0 },
  verifiedBins: [{
    userId:    String,
    userName:  String,
    hasDust:   Boolean,
    timestamp: Date
  }]
}, { timestamps: true });
const DriverDailySummary = mongoose.models.DriverDailySummary
  || mongoose.model('DriverDailySummary', driverDailySummarySchema);

// Mock User Schema (For demo purposes)
const mockUserSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['home', 'point'], default: 'home' },
  address: { type: String, default: '' },
  area: { type: String, default: 'unassigned' },
  lng: { type: Number, required: true },
  lat: { type: Number, required: true },
  fillLevel: { type: Number, default: 50 },
  lastReported: { type: String, default: 'Just now' },
  points: { type: Number, default: 0 }
}, { timestamps: true });
const MockUser = mongoose.models.MockUser || mongoose.model('MockUser', mockUserSchema);

// Seeding logic for Mock Users and History
async function seedMocks() {
  await MockUser.deleteMany({}); // Wipe clean to enforce new areas
  
  console.log('🌱 Seeding Gokulam geometric mock users...');
  const initialMocks = [
    { id: 'U001', name: 'Rahul Sharma', role: 'home', address: 'Vijayanagar 1st Stage, Mysore', area: 'gokulam_north', lng: 76.6082, lat: 12.3258, fillLevel: 95, lastReported: '2 hrs ago', points: 1250 },
    { id: 'U002', name: 'Priya Nair', role: 'home', address: 'Kuvempunagar, Mysore', area: 'gokulam_north', lng: 76.6231, lat: 12.3441, fillLevel: 88, lastReported: '5 hrs ago', points: 870 },
    { id: 'U003', name: 'Bin — Saraswathipuram', role: 'point', address: 'Saraswathipuram Main Road', area: 'gokulam_north', lng: 76.6358, lat: 12.3312, fillLevel: 92, lastReported: '1 hr ago', points: 2100 },
    { id: 'U004', name: 'Deepak Hegde', role: 'home', address: 'Jayalakshmipuram, Mysore', area: 'gokulam_north', lng: 76.6501, lat: 12.3189, fillLevel: 82, lastReported: '3 hrs ago', points: 540 },
    { id: 'U011', name: 'Mock House 1', role: 'home', address: 'Mysuru North', area: 'gokulam_north', lng: 76.6110, lat: 12.3550, fillLevel: 92, lastReported: '1 hr ago', points: 100 },
    { id: 'U012', name: 'Mock House 2', role: 'home', address: 'Mysuru Central', area: 'gokulam_north', lng: 76.6180, lat: 12.3520, fillLevel: 85, lastReported: '3 hrs ago', points: 50 },
    { id: 'U005', name: 'Bin — Gokulam', role: 'point', address: 'Gokulam 3rd Stage', area: 'gokulam_north', lng: 76.6143, lat: 12.3502, fillLevel: 33, lastReported: '8 hrs ago', points: 1680 },
    { id: 'U006', name: 'Anitha Reddy', role: 'home', address: 'Rajivnagar, Mysuru', area: 'gokulam_north', lng: 76.6620, lat: 12.3390, fillLevel: 73, lastReported: '2 hrs ago', points: 990 },
    { id: 'U007', name: 'Bin — Nazarbad', role: 'point', address: 'Nazarbad Mohalla', area: 'gokulam_north', lng: 76.6432, lat: 12.3088, fillLevel: 88, lastReported: '30 mins ago', points: 3200 },
    { id: 'U008', name: 'Suresh Kumar', role: 'home', address: 'Hebbal 2nd Stage, Mysuru', area: 'gokulam_north', lng: 76.6195, lat: 12.2980, fillLevel: 95, lastReported: '6 hrs ago', points: 430 },
    { id: 'U009', name: 'Meera Iyengar', role: 'home', address: 'Lashkar Mohalla, Mysuru', area: 'gokulam_north', lng: 76.6553, lat: 12.3055, fillLevel: 91, lastReported: '45 mins ago', points: 1870 },
    { id: 'U010', name: 'Bin — Devaraja', role: 'point', address: 'Devaraja Urs Road', area: 'gokulam_north', lng: 76.6388, lat: 12.2940, fillLevel: 62, lastReported: '4 hrs ago', points: 760 }
  ];
  await MockUser.insertMany(initialMocks);
  
  // Seed the 6 Mock Drivers
  console.log('🌱 Truncating and seeding 6 specialized zone drivers...');
  const salt = await bcrypt.genSalt(10);
  const fakeHash = await bcrypt.hash('password123', salt);
  
  const drivers = [
    { empId: 'D001', pin: '1234', name: 'Driver Gokulam North', role: 'driver', assignedAreas: ['gokulam_north'] },
    { empId: 'D002', pin: '1234', name: 'Driver Gokulam South', role: 'driver', assignedAreas: ['gokulam_south'] },
    { empId: 'D003', pin: '1234', name: 'Driver Gokulam East', role: 'driver', assignedAreas: ['gokulam_east'] },
    { empId: 'D004', pin: '1234', name: 'Driver Gokulam West', role: 'driver', assignedAreas: ['gokulam_west'] },
    { empId: 'D005', pin: '1234', name: 'Driver Jayalakshmipuram', role: 'driver', assignedAreas: ['jayalakshmipuram'] },
    { empId: 'D006', pin: '1234', name: 'RESERVE Emergency Driver', role: 'driver', assignedAreas: [], isReserve: true }
  ];
  
  for (const d of drivers) {
    await User.findOneAndUpdate(
      { empId: d.empId },
      { $set: { ...d, passwordHash: fakeHash } },
      { upsert: true, new: true }
    );
  }


  // Seed User Collection History (Real users & Mocks)
  const logCount = await CollectionLog.countDocuments();
  if (logCount === 0) {
    console.log('🌱 Seeding sample collection logs for last 14 days...');
    const sampleLogs = [];
    const allUsers = await User.find({ role: 'home' });
    
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      
      allUsers.forEach((u, idx) => {
        // 80% collection rate
        if ((idx + i) % 5 !== 0) {
          sampleLogs.push({
            userId: u._id,
            date: dStr,
            status: (idx + i) % 7 === 0 ? 'missed' : 'collected',
            points: (idx + i) % 7 === 0 ? 0 : 50
          });
        }
      });
    }
    if (sampleLogs.length > 0) await CollectionLog.insertMany(sampleLogs);
  }

  // Seed Driver Daily Summaries
  const summaryCount = await DriverDailySummary.countDocuments();
  if (summaryCount === 0) {
    const drivers = await User.find({ role: 'driver' });
    if (drivers.length > 0) {
      console.log('🌱 Seeding sample driver summaries for last 14 days...');
      const sampleSummaries = [];
      
      for (let i = 1; i <= 14; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        
        drivers.forEach(dr => {
          sampleSummaries.push({
            driverId: dr._id,
            date: dStr,
            housePickups: Math.floor(Math.random() * 20) + 15,
            communityVerifications: Math.floor(Math.random() * 6) + 3,
            pointsDistributed: Math.floor(Math.random() * 1200) + 600,
            verifiedBins: []
          });
        });
      }
      await DriverDailySummary.insertMany(sampleSummaries);
    }
  }
}

// Driver issue reports
const driverReportSchema = new mongoose.Schema({
  driverId:    { type: String, required: true },
  type:        { type: String, enum: ['bin_issue','road_issue','user_complaint','other'], default: 'other' },
  description: { type: String, required: true },
  location:    { lat: Number, lng: Number },
  resolved:    { type: Boolean, default: false }
}, { timestamps: true });
const DriverReport = mongoose.models.DriverReport || mongoose.model('DriverReport', driverReportSchema);


// ── JWT helpers ───────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'ecoroute_dev_secret_change_in_production';

function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// ── Auth middleware ───────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    req.user = verifyToken(header.split(' ')[1]);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// ── Sanitize user for response (strip password hash) ────────
function safeUser(doc) {
  const u = doc.toObject ? doc.toObject() : { ...doc };
  delete u.passwordHash;
  delete u.pin;
  delete u.__v;
  return u;
}

// ── DB-not-configured guard ───────────────────────────────────
function requireDb(req, res, next) {
  if (!MONGO_URI) {
    return res.status(503).json({
      message: 'Database not configured. Add MONGO_URI to your .env file.',
      demoMode: true
    });
  }
  next();
}

// ════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════════════════════════

// POST /api/auth/register  — Home / Point users
app.post('/api/auth/register', requireDb, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    if (!['home', 'point'].includes(role)) {
      return res.status(400).json({ message: 'Role must be "home" or "point".' });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered. Please sign in.' });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      nickname: name.split(' ')[0],
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'home',
      area: 'gokulam_north' // Hardcoded for demo/hackathon to show up on map
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user: safeUser(user) });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login  — Home / Point users
app.post('/api/auth/login', requireDb, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), role: { $in: ['home', 'point'] } });
    if (!user) return res.status(401).json({ message: 'No account found with that email.' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: 'Incorrect password.' });

    const token = signToken(user._id);
    res.json({ token, user: safeUser(user) });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/driver-login  — Driver / Admin
app.post('/api/auth/driver-login', requireDb, async (req, res) => {
  try {
    const { empId, pin } = req.body;

    if (!empId || !pin) {
      return res.status(400).json({ message: 'Employee ID and PIN are required.' });
    }

    const driver = await User.findOne({ empId: empId.toUpperCase(), role: 'driver' });
    if (!driver) return res.status(401).json({ message: 'Employee ID not found.' });

    // PIN check — use bcrypt.compare if you store hashed PINs
    const pinMatch = driver.pin === String(pin);
    if (!pinMatch) return res.status(401).json({ message: 'Incorrect PIN.' });

    const token = signToken(driver._id);
    res.json({ token, user: safeUser(driver) });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════
//  USER ROUTES
// ════════════════════════════════════════════════════════════

// GET /api/users/me
app.get('/api/users/me', requireAuth, requireDb, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(safeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me
app.put('/api/users/me', requireAuth, requireDb, async (req, res) => {
  try {
    const allowed = ['name', 'nickname', 'phone', 'address', 'location', 'isActiveToday', 'fcmToken', 'points', 'collectionsThisMonth'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(safeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bins/:id/fill — Update fill level of a community bin (Point User action)
app.patch('/api/bins/:id/fill', requireAuth, requireDb, async (req, res) => {
  try {
    const { fillLevel } = req.body;
    const bin = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'point' },
      { fillLevel },
      { new: true }
    );
    if (!bin) return res.status(404).json({ message: 'Community bin not found.' });
    
    // Award 10 points to the point user who did the update
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 10 } });

    res.json({ success: true, fillLevel: bin.fillLevel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/active
app.get('/api/users/active', requireDb, async (req, res) => {
  try {
    // 1. Fetch real users (Universal filter for drivers in demo)
    let query = { role: { $in: ['home', 'point'] } };
    const realUsers = await User.find(query);
    const mappedReal = realUsers.map(user => ({
      id: user._id,
      name: user.name,
      role: (user.role || 'home').toLowerCase(),
      area: user.area,
      address: user.address,
      lat: (user.location?.lat || user.lat || 12.3375) + (Math.random() - 0.5) * 0.0003,
      lng: (user.location?.lng || user.lng || 76.6394) + (Math.random() - 0.5) * 0.0003,
      fillLevel: user.fillLevel,
      isActiveToday: user.isActiveToday,
      isMock: false
    }));

    // 3. Fetch mock users (Relaxed filter for drivers in demo)
    let mockQuery = {};
    const mocks = await MockUser.find(mockQuery);
    const mappedMocks = mocks.map(m => ({
      id: m.id,
      name: m.name,
      role: (m.role || 'home').toLowerCase(),
      isHouse: (m.role || 'home').toLowerCase() === 'home',
      area: m.area,
      address: m.address,
      lat: (Number(m.lat) || 12.3375) + (Math.random() - 0.5) * 0.0003,
      lng: (Number(m.lng) || 76.6394) + (Math.random() - 0.5) * 0.0003,
      fillLevel: m.fillLevel || Math.floor(Math.random() * 40) + 60,
      isActiveToday: null,
      isMock: true
    }));

    // Merge and deduplicate by name
    const combined = [...mappedReal];
    mappedMocks.forEach(m => {
      if (!combined.some(u => u.name === m.name)) combined.push(m);
    });

    res.json(combined);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/trips
app.post('/api/trips', requireAuth, requireDb, async (req, res) => {
  try {
    const trip = await Trip.create({
      driverId: req.user.id,
      waypoints: req.body.waypoints || [],
      duration: req.body.duration || 0,
      geometry: req.body.geometry || null,
      status: 'active'
    });
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/trips/active — Get current active trip for the online driver
app.get('/api/trips/active', requireDb, async (req, res) => {
  try {
    const driver = await User.findOne({ role: 'driver', isOnline: true });
    if (!driver) return res.json({ available: false });
    
    // Find most recent active trip for this driver
    const trip = await Trip.findOne({ driverId: driver._id, status: 'active' }).sort({ createdAt: -1 });
    if (!trip) return res.json({ available: false });
    
    res.json({ available: true, trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/trips/:id/complete — Mark a trip as finished
app.patch('/api/trips/:id/complete', requireAuth, requireDb, async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, driverId: req.user.id },
      { status: 'completed' },
      { new: true }
    );
    if (!trip) return res.status(404).json({ message: 'Trip not found or unauthorized.' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════
//  NEW ROUTES: DRIVER TRACKING & BLOCK SYSTEM
// ════════════════════════════════════════════════════════════

// GET /api/driver/block-status
app.get('/api/driver/block-status', requireDb, async (req, res) => {
  try {
    let state = await SystemState.findOne();
    if (!state) state = await SystemState.create({ isBlocked: false });
    res.json(state);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/driver/block
app.post('/api/driver/block', requireAuth, requireDb, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'driver') return res.status(403).json({ message: 'Only drivers can block updates.' });
    
    let state = await SystemState.findOne();
    if (!state) state = new SystemState();
    state.isBlocked = true;
    state.blockedBy = user._id;
    await state.save();
    
    res.json(state);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/driver/unblock
app.post('/api/driver/unblock', requireAuth, requireDb, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'driver') return res.status(403).json({ message: 'Only drivers can unblock updates.' });
    
    let state = await SystemState.findOne();
    if (state) {
      state.isBlocked = false;
      state.blockedBy = null;
      await state.save();
    }
    res.json({ isBlocked: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/driver/online
app.post('/api/driver/online', requireAuth, requireDb, async (req, res) => {
  try {
    const { isOnline, location } = req.body;
    const updates = { isOnline };
    
    // If going offline, remove the location from DB to protect privacy
    if (isOnline === false) {
      updates.location = { lat: 0, lng: 0 };
    } else if (location) {
      updates.location = location;
    }
    
    const user = await User.findOneAndUpdate(
      { _id: req.user.id, role: 'driver' },
      updates,
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'Driver not found.' });
    res.json({ isOnline: user.isOnline, location: user.location });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/driver/location (Users find active driver)
app.get('/api/driver/location', requireAuth, requireDb, async (req, res) => {
  try {
    // Find any online driver with valid location
    const driver = await User.findOne({ 
      role: 'driver', 
      isOnline: true,
      'location.lat': { $ne: 0 }
    });
    
    if (!driver) return res.json({ available: false });
    res.json({ available: true, location: driver.location, driverName: driver.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════
//  OVERLOAD & COLLABORATION
// ════════════════════════════════════════════════════════════
app.post('/api/driver/overload', requireAuth, requireDb, async (req, res) => {
  try {
    const driver = await User.findById(req.user.id);
    if (!driver || driver.role !== 'driver') return res.status(403).json({ message: 'Drivers only' });
    if (!driver.assignedAreas || driver.assignedAreas.length === 0) return res.status(400).json({ message: 'No areas assigned' });

    // Mark the first area as overloaded
    const areaToOverload = driver.assignedAreas[0];
    
    // Auto-assign to Reserve Driver directly
    const reserve = await User.findOne({ isReserve: true });
    if (!reserve) return res.status(404).json({ message: 'Driver 2 (Reserve) not available' });

    if (!reserve.assignedAreas.includes(areaToOverload)) {
      reserve.assignedAreas.push(areaToOverload);
    }
    reserve.isOnline = true; // Auto-activate their tracking
    await reserve.save();

    // Relieve the overwhelmed driver
    driver.assignedAreas = driver.assignedAreas.filter(a => a !== areaToOverload);
    await driver.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Route automatically assigned to Driver 2. Their location is now tracking.', 
      area: areaToOverload 
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ════════════════════════════════════════════════════════════
//  NEW ROUTES: DRIVER BIN VERIFICATION, NOTIFICATIONS, REPORTS
// ════════════════════════════════════════════════════════════

// POST /api/driver/verify-bin — Driver confirms dust at a collection point
app.post('/api/driver/verify-bin', requireAuth, requireDb, async (req, res) => {
  try {
    const { userId, userName, hasDust } = req.body;
    const driver = await User.findById(req.user.id);
    if (!driver || driver.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can verify bins.' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Update driver daily summary
    await DriverDailySummary.findOneAndUpdate(
      { driverId: req.user.id, date: today },
      {
        $push: { verifiedBins: { userId, userName, hasDust, timestamp: new Date() } },
        $inc:  { housePickups: 1, pointsDistributed: hasDust ? 10 : 0 }
      },
      { new: true, upsert: true }
    );

    // Award 10 points to the user if dust was confirmed
    // Wrapped separately so an invalid userId doesn't fail the whole request
    if (hasDust && userId) {
      try {
        await User.findByIdAndUpdate(userId, { $inc: { points: 10 } });
        await CollectionLog.findOneAndUpdate(
          { userId, date: today },
          { status: 'collected', points: 10 },
          { new: true, upsert: true }
        );
      } catch (userErr) {
        console.warn('Could not update user points (invalid userId?):', userErr.message);
      }
    }

    res.json({ success: true, hasDust, pointsAwarded: hasDust ? 10 : 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/driver/trigger-notification — Manual 6AM-style push trigger
app.post('/api/driver/trigger-notification', requireAuth, requireDb, async (req, res) => {
  try {
    const driver = await User.findById(req.user.id);
    if (!driver || driver.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can trigger notifications.' });
    }

    // Fetch home users to notify (Fixed: Variable was undefined)
    const homeUsers = await User.find({ role: 'home' });

    // Save to broadcast collection so all Home users see it
    await PublicNotification.create({
      title: '📢 Morning Pickup Alert',
      body: `Driver ${driver.name} has started the route. Confirm your bin pickup today!`,
      role: 'home',
      type: 'morning_alert'
    });

    res.json({
      success: true,
      count: homeUsers.length,
      users: homeUsers
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/notifications/latest — Fetch active alerts for current role
app.get('/api/notifications/latest', requireAuth, requireDb, async (req, res) => {
  try {
    const alerts = await PublicNotification.find({ role: req.user.role })
      .sort({ timestamp: -1 })
      .limit(5);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Admin: Mock Data Persistence ──────────────────────────────────
app.get('/api/admin/mocks', requireDb, async (req, res) => {
  try {
    const mocks = await MockUser.find().sort({ createdAt: -1 });
    res.json(mocks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/admin/mocks', requireDb, async (req, res) => {
  try {
    const mock = new MockUser({
      ...req.body,
      id: req.body.id || `U${Math.floor(Math.random() * 9000) + 1000}`
    });
    await mock.save();
    res.status(201).json(mock);
  } catch (err) { 
    console.error('Mock Save Error:', err);
    res.status(400).json({ message: err.message }); 
  }
});

app.patch('/api/admin/mocks/:id', requireDb, async (req, res) => {
  try {
    const mock = await MockUser.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!mock) return res.status(404).json({ message: 'Mock not found' });
    res.json(mock);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

app.delete('/api/admin/mocks/:id', requireDb, async (req, res) => {
  try {
    await MockUser.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Mock deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/driver/daily-summary — Fetch today's driver summary
app.get('/api/driver/daily-summary', requireAuth, requireDb, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const summary = await DriverDailySummary.findOne({ driverId: req.user.id, date: today });
    res.json(summary || {
      housePickups: 0, communityVerifications: 0,
      pointsDistributed: 0, verifiedBins: []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/driver/history — Last 30 days of DriverDailySummary for this driver
app.get('/api/driver/history', requireAuth, requireDb, async (req, res) => {
  try {
    const driver = await User.findById(req.user.id);
    if (!driver || driver.role !== 'driver') return res.status(403).json({ message: 'Drivers only.' });
    
    let summaries = await DriverDailySummary.find({ driverId: req.user.id })
      .sort({ date: -1 }).limit(30);

    // JIT Seeding if missing history
    if (summaries.length < 14) {
      console.log(`🌱 Filling historical gaps for driver ${driver.name}...`);
      for (let i = 1; i <= 14; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        await DriverDailySummary.findOneAndUpdate(
          { driverId: req.user.id, date: dateStr },
          {
            $setOnInsert: {
              housePickups: Math.floor(Math.random() * 20) + 30,
              communityVerifications: Math.floor(Math.random() * 5) + 2,
              pointsDistributed: Math.floor(Math.random() * 500) + 300,
              verifiedBins: []
            }
          },
          { upsert: true }
        );
      }
      
      // Re-fetch to include the newly generated gaps
      summaries = await DriverDailySummary.find({ driverId: req.user.id })
        .sort({ date: -1 }).limit(30);
    }

    res.json(summaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/driver/report — Save a driver issue report
app.post('/api/driver/report', requireAuth, requireDb, async (req, res) => {
  try {
    const { type, description, location } = req.body;
    if (!description) return res.status(400).json({ message: 'Description is required.' });
    const report = await DriverReport.create({ driverId: req.user.id, type: type || 'other', description, location });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════
//  NEW ROUTES: PICKUP CONFIRMATION & HISTORY
// ════════════════════════════════════════════════════════════

// POST /api/users/confirm-pickup
app.post('/api/users/confirm-pickup', requireAuth, requireDb, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    // Check block status
    const state = await SystemState.findOne();
    if (state && state.isBlocked) {
      return res.status(403).json({ blocked: true, message: "You're late! The driver has already set their route." });
    }
    
    const updates = { isActiveToday: true };
    if (lat && lng) updates.location = { lat, lng };
    
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json(safeUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/collection-log
app.get('/api/users/collection-log', requireAuth, requireDb, async (req, res) => {
  try {
    let logs = await CollectionLog.find({ userId: req.user.id }).sort({ date: -1 });

    // JIT Seeding if missing history
    if (logs.length < 14) {
      console.log(`🌱 Filling historical gaps for user ${req.user.id}...`);
      for (let i = 1; i <= 14; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        await CollectionLog.findOneAndUpdate(
          { userId: req.user.id, date: dateStr },
          {
            $setOnInsert: {
              status: Math.random() > 0.15 ? 'collected' : 'missed',
              points: 10
            }
          },
          { upsert: true }
        );
      }
      
      // Re-fetch to include the newly generated gaps
      logs = await CollectionLog.find({ userId: req.user.id }).sort({ date: -1 });
    }

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/collection-log
app.post('/api/users/collection-log', requireAuth, requireDb, async (req, res) => {
  try {
    const { date, status, points } = req.body;
    
    // UPSERT log entry by date & user
    const log = await CollectionLog.findOneAndUpdate(
      { userId: req.user.id, date },
      { status, points },
      { new: true, upsert: true }
    );
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/config — Securely provide public config to frontend
app.get('/api/config', (req, res) => {
  res.json({
    MAPBOX_TOKEN: process.env.MAPBOX_TOKEN || ''
  });
});

// ════════════════════════════════════════════════════════════
//  AI ASSISTANT ROUTES
// ════════════════════════════════════════════════════════════

app.post('/api/ai/chat', requireAuth, async (req, res) => {
  try {
    const { message, image, language } = req.body;
    let responseText = "";

    const userPrompt = `Language: ${language || 'English'}\nUser Query: ${message || 'What is this?'}`;

    // 1. Try Gemini primary
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const parts = [WASTE_ANALYSIS_SYSTEM_PROMPT + "\n" + userPrompt];
      
      if (image && image.includes('base64,')) {
        const base64Data = image.split('base64,')[1];
        let mimeType = "image/jpeg";
        const metaStr = image.split(';')[0];
        if (metaStr.startsWith('data:')) {
            mimeType = metaStr.replace('data:', '');
        }
        parts.push({
          inlineData: { mimeType: mimeType, data: base64Data }
        });
      }

      const result = await model.generateContent(parts);
      responseText = result.response.text();
    } catch (geminiError) {
      console.warn("Gemini Error, falling back to Groq:", geminiError.message);
      
      // 2. Try Groq fallback
      if (groq) {
        const groqModel = image ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";
        const messages = [
          { role: "system", content: WASTE_ANALYSIS_SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ];

        if (image && image.includes('base64,')) {
           // Groq vision payload...
           messages[1].content = [
             { type: "text", text: userPrompt },
             { type: "image_url", image_url: { url: image } }
           ];
        }

        const chatCompletion = await groq.chat.completions.create({
          messages,
          model: groqModel,
          response_format: { type: "json_object" }
        });
        responseText = chatCompletion.choices[0].message.content;
      } else {
        throw new Error("Gemini failed and Groq not configured.");
      }
    }

    // Clean up response if it has markdown blocks
    const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const resultJson = JSON.parse(cleanedJson);

    // Optional: Award points
    if (resultJson.category && req.user) {
       await User.findByIdAndUpdate(req.user.id, { $inc: { points: 10 } });
    }

    res.json(resultJson);

  } catch (err) {
    console.error("AI Chat Error:", err);
    res.status(500).json({ error: "Could not process waste analysis. " + err.message });
  }
});

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    demoMode: !MONGO_URI
  });
});


// ── Static & SPA Fallback (MUST BE LAST) ──────────────────────
const publicPath = path.resolve(__dirname);
app.use(express.static(publicPath));
console.log(`📡 Serving static files from: ${publicPath}`);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Daily Preference Auto-Reset (at 11:00 AM) ──────────────────
// This runs a check every minute to see if it's 11:00 AM
setInterval(async () => {
  try {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    
    // Check if it's exactly 11:00 AM IST
    if (timeStr === '11:00') {
      console.log('🕒 11:00 AM: Auto-resetting daily user preferences...');
      await User.updateMany({ role: { $in: ['home', 'point'] } }, { isActiveToday: null });
    }
  } catch (err) {
    console.error('Preference auto-reset error:', err.message);
  }
}, 60000); // once per minute

// POST /api/driver/reset-all-preferences — Admin Manual Reset
app.post('/api/driver/reset-all-preferences', requireAuth, requireDb, async (req, res) => {
  try {
    const driver = await User.findById(req.user.id);
    if (!driver || driver.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers/admins can perform a global reset.' });
    }

    const result = await User.updateMany(
      { role: { $in: ['home', 'point'] } },
      { isActiveToday: null }
    );

    res.json({ success: true, message: 'All daily preferences have been reset.', modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  const interfaces = require('os').networkInterfaces();
  const lan = Object.values(interfaces).flat()
    .find(i => i.family === 'IPv4' && !i.internal)?.address || 'your-ip';

  console.log(`\n🚛 EcoRoute server running`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${lan}:${PORT}`);
  console.log(`   DB:      ${MONGO_URI ? 'MongoDB connected' : '⚠️  Demo mode (no DB)'}\n`);
});
