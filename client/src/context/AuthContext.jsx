import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { signInWithGoogle, auth } from '../firebase';
import { signOut } from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setUser(userInfo);
        }
        setLoading(false);
    }, []);

    // Existing email/password login (unchanged)
    const login = async (email, password) => {
        const { data } = await axios.post('/api/users/login', { email, password });
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        return data;
    };

    // Existing signup (unchanged)
    const signup = async (userData) => {
        const { data } = await axios.post('/api/users/signup', userData);
        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        return data;
    };

    // NEW: Google Sign-In via Firebase
    const loginWithGoogle = async () => {
        const result = await signInWithGoogle();
        const idToken = await result.user.getIdToken();

        const { data } = await axios.post(
            '/api/users/firebase-login',
            { idToken },
            { withCredentials: true }
        );

        localStorage.setItem('userInfo', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const logout = async () => {
        await axios.post('/api/users/logout');
        // Also sign out from Firebase if this was a Google login
        try { await signOut(auth); } catch (_) { }
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, signup, loginWithGoogle, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
