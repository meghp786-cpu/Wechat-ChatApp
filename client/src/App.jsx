import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Scene from './components/Scene'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ChatPage from './pages/ChatPage'
import BroadcastDashboard from './pages/BroadcastDashboard'

import { Toaster } from 'react-hot-toast'

function App() {
    return (
        <div className="relative min-h-screen">
            <Toaster position="top-right" reverseOrder={false} />
            <Scene />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <ChatPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/chat/:chatId"
                    element={
                        <ProtectedRoute>
                            <ChatPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/broadcast"
                    element={
                        <ProtectedRoute>
                            <BroadcastDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<LoginPage />} />
            </Routes>
        </div>
    )
}

export default App
