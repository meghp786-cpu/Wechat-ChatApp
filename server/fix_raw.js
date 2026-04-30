const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const updateRaw = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chatApp');
        console.log("Connected to DB");
        const users = await mongoose.connection.db.collection('users').find({ username: { $exists: false } }).toArray();
        console.log(`Found ${users.length} raw users needing update`);
        for (let u of users) {
            const username = u.name.toLowerCase().replace(/\s/g, '') + Math.floor(100 + Math.random() * 900);
            await mongoose.connection.db.collection('users').updateOne(
                { _id: u._id },
                { $set: { username: username } }
            );
            console.log(`Updated ${u.name} -> @${username}`);
        }
        console.log("Raw update complete");
        process.exit(0);
    } catch (error) {
        console.error("Raw update failed:", error);
        process.exit(1);
    }
};

updateRaw();
