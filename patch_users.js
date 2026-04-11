const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['home', 'point', 'driver'], default: 'home' },
  area: { type: String, default: 'unassigned' }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function patch() {
  await mongoose.connect(process.env.MONGO_URI);
  const r = await User.updateMany({ role: { $ne: 'driver' }, area: 'unassigned' }, { $set: { area: 'gokulam_north' } });
  console.log("Updated users:", r.modifiedCount);
  process.exit(0);
}
patch();
