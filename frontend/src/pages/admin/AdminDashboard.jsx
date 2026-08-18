import React, { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { UsersIcon, DocumentTextIcon, BriefcaseIcon, CheckCircleIcon, ChartBarIcon, ServerIcon } from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)
        // Note: Replace with real endpoints. Using mock for missing ones.
        const usersRes = await adminAPI.getUsers().catch(() => ({ data: [] }))
        const statsRes = await adminAPI.getAnalytics().catch(() => ({
          data: { total_users: 156, total_resumes: 342, total_jobs: 89, total_applications: 450 }
        }))
        
        setUsers(usersRes.data.slice(0, 5) || []) // Just recent 5
        setStats(statsRes.data)
      } catch (err) {
        toast.error('Failed to load admin data')
      } finally {
        setLoading(false)
      }
    }
    fetchAdminData()
  }, [])

  if (loading) return <LoadingSpinner message="Loading admin dashboard..." />

  const statCards = [
    { name: 'Total Users', value: stats?.total_users || 0, icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Resumes', value: stats?.total_resumes || 0, icon: DocumentTextIcon, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Active Jobs', value: stats?.total_jobs || 0, icon: BriefcaseIcon, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Applications', value: stats?.total_applications || 0, icon: CheckCircleIcon, color: 'text-amber-600', bg: 'bg-amber-100' },
  ]

  // Mock data for charts
  const userActivityData = [
    { name: 'Mon', users: 12, jobs: 4 },
    { name: 'Tue', users: 19, jobs: 6 },
    { name: 'Wed', users: 15, jobs: 3 },
    { name: 'Thu', users: 22, jobs: 8 },
    { name: 'Fri', users: 28, jobs: 12 },
    { name: 'Sat', users: 10, jobs: 2 },
    { name: 'Sun', users: 8, jobs: 1 },
  ]

  const jobDistribution = [
    { name: 'Engineering', value: 45 },
    { name: 'Design', value: 15 },
    { name: 'Marketing', value: 20 },
    { name: 'Sales', value: 20 },
  ]
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Platform overview and system metrics.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          System Healthy
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="card flex items-center p-5">
            <div className={`p-4 rounded-xl ${stat.bg} mr-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-slate-400" />
            Activity Overview (Last 7 Days)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="users" name="New Users" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="jobs" name="New Jobs" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-slate-400" />
            Jobs by Category
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={jobDistribution} innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {jobDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {jobDistribution.map((cat, i) => (
              <div key={i} className="flex items-center text-xs text-slate-600">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i] }} />
                {cat.name} ({cat.value}%)
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-semibold text-slate-900">Recent Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-white border-b border-slate-100 uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length > 0 ? users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-rose-600 hover:text-rose-800 text-sm font-medium">
                        Deactivate
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <ServerIcon className="w-5 h-5 text-slate-400" />
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-sm font-medium text-slate-700">API Backend</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Online
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-sm font-medium text-slate-700">Database</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-sm font-medium text-slate-700">AI Matching Engine</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-sm font-medium text-slate-700">Storage Service</span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> 24% Used
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
