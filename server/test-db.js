const mongoose = require('mongoose');
require('dotenv').config();

const testConn = async () => {
    try {
        console.log('Testing connection to:', process.env.MONGO_URI.split('@')[1]); // Log host only for privacy
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connection Successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

testConn();
