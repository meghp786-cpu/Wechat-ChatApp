const admin = require('firebase-admin');
const serviceAccount = require('../nexus3d-chat-firebase-adminsdk-fbsvc-ec476bbf2d.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

module.exports = admin;
