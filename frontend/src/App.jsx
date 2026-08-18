import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

// Public Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

// Protected Pages
import Dashboard from './pages/Dashboard'
import ResumeUpload from './pages/ResumeUpload'
import ResumeAnalysis from './pages/ResumeAnalysis'
import JobSearch from './pages/JobSearch'
import JobDetails from './pages/JobDetails'
import JobMatch from './pages/JobMatch'
import Recommendations from './pages/Recommendations'
import SavedJobs from './pages/SavedJobs'
import Applications from './pages/Applications'
import Profile from './pages/Profile'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import JobManagement from './pages/admin/JobManagement'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/resume/upload" element={<ProtectedRoute><Layout><ResumeUpload /></Layout></ProtectedRoute>} />
        <Route path="/resume/analysis" element={<ProtectedRoute><Layout><ResumeAnalysis /></Layout></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Layout><JobSearch /></Layout></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<ProtectedRoute><Layout><JobDetails /></Layout></ProtectedRoute>} />
        <Route path="/jobs/:id/match" element={<ProtectedRoute><Layout><JobMatch /></Layout></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><Layout><Recommendations /></Layout></ProtectedRoute>} />
        <Route path="/saved-jobs" element={<ProtectedRoute><Layout><SavedJobs /></Layout></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><Layout><Applications /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />
        <Route path="/admin/jobs" element={<AdminRoute><Layout><JobManagement /></Layout></AdminRoute>} />
      </Routes>
    </AuthProvider>
  )
}

export default App
