const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Simple User schema for setup
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio');
    console.log('✅ Connected to MongoDB');

    // Delete existing admin user if exists
    await User.deleteMany({ role: 'admin' });
    console.log('🗑️ Removed existing admin users');

    // Create admin user
    const adminUser = new User({
      username: 'Suyash Mishra',
      email: 'suyashmishraa983@gmail.com',
      password: 'MummyPapa895745@1',
      role: 'admin'
    });

    await adminUser.save();
    
    console.log('🎉 Admin user created successfully!');
    console.log('📋 Admin Credentials:');
    console.log('   Username: Suyash Mishra');
    console.log('   Email: suyashmishraa983@gmail.com');
    console.log('   Password: MummyPapa895745@1');
    console.log('');
    console.log('🔐 You can now login at: http://localhost:3001/login');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    await mongoose.disconnect();
  }
}

createAdminUser();
