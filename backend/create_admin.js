const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio");

async function createAdmin() {
  try {
    // Delete existing admin if exists to update with new credentials
    await User.deleteOne({ $or: [{ username: "admin" }, { email: "suyashmishraa983@gmail.com" }] });
    
    const admin = new User({
      username: "Suyash Mishra",
      email: "suyashmishraa983@gmail.com",
      password: "MummyPapa895745@1",
      role: "admin",
      fullName: "Suyash Mishra"
    });

    await admin.save();
    console.log("Admin user created successfully!");
    console.log("Username: Suyash Mishra");
    console.log("Email: suyashmishraa983@gmail.com");
    console.log("Password: MummyPapa895745@1");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createAdmin();
