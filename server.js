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

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ── MongoDB Connection ────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://majen:majen@majen.f3jgom3.mongodb.net/?appName=majen';

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
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
  isOnline: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

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
      role: role || 'home'
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
    const users = await User.find({ role: { $in: ['home', 'point'] } });
    const mapped = users.map(user => ({
      id: user._id,
      name: user.name,
      role: user.role,
      address: user.address,
      lat: user.location?.lat,
      lng: user.location?.lng,
      fillLevel: user.fillLevel,
      isActiveToday: user.isActiveToday
    }));
    res.json(mapped);
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
    if (location) updates.location = location;
    
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

// GET /api/driver/location (For home users to track)
app.get('/api/driver/location', requireDb, async (req, res) => {
  try {
    const driver = await User.findOne({ role: 'driver', isOnline: true });
    if (!driver) return res.json({ available: false });
    res.json({ available: true, location: driver.location });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
    const summaries = await DriverDailySummary.find({ driverId: req.user.id })
      .sort({ date: -1 }).limit(30);
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
    const logs = await CollectionLog.find({ userId: req.user.id }).sort({ date: -1 });
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

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    demoMode: !MONGO_URI
  });
});

// Serve static files FIRST
app.use(express.static(__dirname));

// API routes above this...

// SPA fallback (IMPORTANT)
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
