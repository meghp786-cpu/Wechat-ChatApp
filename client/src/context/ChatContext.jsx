import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

const ENDPOINT = "http://localhost:5000";
let socket;

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [selectedChat, setSelectedChat] = useState();
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [orbColor, setOrbColor] = useState(['#44A194', '#537D96', '#EC8F8D', '#44A194', '#537D96']);
    const [communities, setCommunities] = useState([]);
    const [isHighSpeed, setIsHighSpeed] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [mutedChats, setMutedChats] = useState([]);
    const [isDissolving, setIsDissolving] = useState(false);


    useEffect(() => {
        if (user) {
            socket = io(ENDPOINT);
            socket.emit("setup", user);
            socket.on("connected", () => setSocketConnected(true));
            socket.on("typing", () => setIsTyping(true));
            socket.on("stop typing", () => setIsTyping(false));

            socket.on("user_presence", ({ userId, status }) => {
                setOnlineUsers(prev => {
                    if (status === "online") {
                        return prev.includes(userId) ? prev : [...prev, userId];
                    } else {
                        return prev.filter(id => id !== userId);
                    }
                });
            });

            socket.on("online_users_list", (users) => {
                setOnlineUsers(users);
            });

            // Request initial online users list
            socket.emit("get_online_users");

            socket.on("new chat created", (newChat) => {
                setChats(prev => {
                    if (prev.find(c => c._id === newChat._id)) return prev;
                    return [newChat, ...prev];
                });
            });

            socket.on("community created", (newCommunityChat) => {
                setChats(prev => [newCommunityChat, ...prev]);
                setSelectedChat(newCommunityChat);
            });

            socket.on("kicked from community", (communityId) => {
                setChats(prev => prev.filter(c => c.community !== communityId));
                if (selectedChat?.community === communityId) {
                    setSelectedChat(null);
                    setOrbColor(['#44A194', '#537D96', '#EC8F8D', '#44A194', '#537D96']);
                }
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [user]);

    const toggleMute = (chatId) => {
        setMutedChats(prev =>
            prev.includes(chatId) ? prev.filter(id => id !== chatId) : [...prev, chatId]
        );
    };

    const handleDetach = () => {
        setIsDissolving(true);
        if (socket) {
            socket.emit("disconnect_user", user._id);
            socket.disconnect();
        }
        setTimeout(() => {
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }, 1500); // Wait for dissolve animation
    };

    return (
        <ChatContext.Provider value={{
            socket,
            selectedChat,
            setSelectedChat,
            chats,
            setChats,
            messages,
            setMessages,
            socketConnected,
            typing,
            setTyping,
            isTyping,
            setIsTyping,
            orbColor,
            setOrbColor,
            communities,
            setCommunities,
            isHighSpeed,
            setIsHighSpeed,
            onlineUsers,
            mutedChats,
            toggleMute,
            isDissolving,
            handleDetach
        }}>

            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);

