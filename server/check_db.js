const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chatApp');
        console.log("Connected to DB");
        const users = await User.find({ username: { $exists: false } });
        console.log(`Found ${users.length} users without usernames`);
        if (users.length > 0) {
            console.log("User names without usernames:", users.map(u => u.name));
        }
        process.exit(0);
    } catch (error) {
        console.error("Error checking users:", error);
        process.exit(1);
    }
};

checkUsers();
