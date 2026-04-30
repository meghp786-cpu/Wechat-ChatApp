const onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("Connected to socket.io");

        socket.on("setup", (userData) => {
            socket.join(userData._id);
            onlineUsers.set(userData._id, socket.id);
            io.emit("user_presence", { userId: userData._id, status: "online" });
            socket.emit("connected");
        });

        socket.on("join chat", (room) => {
            socket.join(room);
            console.log("User Joined Room: " + room);
        });

        socket.on("get_online_users", () => {
            socket.emit("online_users_list", Array.from(onlineUsers.keys()));
        });

        socket.on("typing", (room) => socket.in(room).emit("typing"));
        socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

        socket.on("disappearing_messages_toggle", ({ chatId, enabled }) => {
            socket.to(chatId).emit("toggle_disappearing_messages", { chatId, enabled });
        });

        socket.on("new message", (newMessage) => {

            var chat = newMessage.chat;
            if (!chat.users) return console.log("chat.users not defined");

            chat.users.forEach((user) => {
                socket.in(user._id).emit("message recieved", newMessage);
            });
        });

        socket.on("message_update", (updatedMessage) => {
            var chat = updatedMessage.chat;
            if (!chat || !chat.users) return;
            chat.users.forEach((user) => {
                const targetId = user._id ? user._id.toString() : user.toString();
                socket.in(targetId).emit("message_updated", updatedMessage);
            });
        });

        socket.on("message_delete", (deletedMessage) => {
            var chat = deletedMessage.chat;
            if (!chat || !chat.users) return;
            chat.users.forEach((user) => {
                const targetId = user._id ? user._id.toString() : user.toString();
                socket.in(targetId).emit("message_deleted", deletedMessage);
            });
        });

        socket.on("disconnect", () => {
            let disconnectedUser;
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    disconnectedUser = userId;
                    onlineUsers.delete(userId);
                    break;
                }
            }
            if (disconnectedUser) {
                console.log("USER DISCONNECTED:", disconnectedUser);
                io.emit("user_presence", { userId: disconnectedUser, status: "offline" });
            }
        });
    });
};

module.exports = socketHandler;
module.exports.onlineUsers = onlineUsers;

