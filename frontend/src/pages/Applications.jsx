import React, { useEffect, useState } from 'react'
import { applicationsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { BriefcaseIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true)
        const res = await applicationsAPI.getAll().catch(() => ({ data: [] }))
        
        // Mock data if empty
        const data = res.data.length > 0 ? res.data : [
          { id: 1, job_title: 'Frontend Engineer', company: 'TechCorp', status: 'Under Review', applied_date: new Date(Date.now() - 86400000 * 2).toISOString(), match_score: 92 },
          { id: 2, job_title: 'React Developer', company: 'StartupX', status: 'Applied', applied_date: new Date(Date.now() - 86400000 * 5).toISOString(), match_score: 85 },
          { id: 3, job_title: 'Full Stack Dev', company: 'GlobalSys', status: 'Rejected', applied_date: new Date(Date.now() - 86400000 * 15).toISOString(), match_score: 65 },
        ]
        
        setApplications(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchApps()
  }, [])

  const getStatusColor = (status) => {
    switch(status) {
      case 'Applied': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Under Review': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Accepted': case 'Interview': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const filteredApps = filter === 'All' ? applications : applications.filter(a => a.status === filter)

  if (loading) return <LoadingSpinner message="Loading applications..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-500 mt-1">Track the status of your job applications.</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-2 overflow-x-auto">
          {['All', 'Applied', 'Under Review', 'Interview', 'Rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-white border-b border-slate-100 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Job Title & Company</th>
                  <th className="px-6 py-4 font-medium">Applied Date</th>
                  <th className="px-6 py-4 font-medium text-center">Match Score</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.length > 0 ? filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{app.job_title}</p>
                      <p className="text-xs text-slate-500">{app.company}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(app.applied_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="badge bg-indigo-50 text-indigo-700">{app.match_score}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge border ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No applications match the selected filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12">
            <EmptyState 
              icon={<BriefcaseIcon className="w-16 h-16 text-slate-300 mx-auto" />}
              title="No applications yet"
              description="You haven't applied to any jobs yet. Start exploring jobs and apply directly!"
              actionLabel="Search Jobs"
              actionLink="/jobs"
            />
          </div>
        )}
      </div>
    </div>
  )
}
