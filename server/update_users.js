const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const updateUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chatApp');
        console.log("Connected to DB");
        const users = await User.find({ username: { $exists: false } });
        console.log(`Updating ${users.length} users`);
        for (let u of users) {
            u.username = u.name.toLowerCase().replace(/\s/g, '') + Math.floor(100 + Math.random() * 900);
            await u.save();
            console.log(`Updated ${u.name} with username @${u.username}`);
        }
        console.log("All users updated successfully");
        process.exit(0);
    } catch (error) {
        console.error("Error updating users:", error);
        process.exit(1);
    }
};

updateUsers();
