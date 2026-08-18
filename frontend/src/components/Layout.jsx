import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Squares2X2Icon, 
  ArrowUpTrayIcon, 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  StarIcon,
  BookmarkIcon,
  BriefcaseIcon,
  UserIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { SparklesIcon } from '@heroicons/react/24/solid'

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Squares2X2Icon },
    { name: 'Resume Upload', path: '/resume/upload', icon: ArrowUpTrayIcon },
    { name: 'Resume Analysis', path: '/resume/analysis', icon: DocumentTextIcon },
    { name: 'Job Search', path: '/jobs', icon: MagnifyingGlassIcon },
    { name: 'Recommendations', path: '/recommendations', icon: StarIcon },
    { name: 'Saved Jobs', path: '/saved-jobs', icon: BookmarkIcon },
    { name: 'Applications', path: '/applications', icon: BriefcaseIcon },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ]

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin', icon: ShieldCheckIcon },
    { name: 'Job Management', path: '/admin/jobs', icon: Cog6ToothIcon },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
    return (
      <Link
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
      >
        <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
        {item.name}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-200">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">ResumeAI</span>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {navLinks.map(item => <NavItem key={item.name} item={item} />)}
          
          {isAdmin && (
            <>
              <div className="pt-4 pb-2 px-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</p>
              </div>
              {adminLinks.map(item => <NavItem key={item.name} item={item} />)}
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(true)}>
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-slate-800 capitalize">
              {location.pathname.split('/').filter(Boolean).pop()?.replace('-', ' ') || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-700">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
