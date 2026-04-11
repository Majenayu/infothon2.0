const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

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

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const m = await MockUser.find({});
  console.log("MockUser count:", m.length);
  process.exit(0);
}
check();
