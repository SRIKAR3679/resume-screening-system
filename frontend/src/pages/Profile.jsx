import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { resumeAPI } from '../services/api'
import { UserCircleIcon, DocumentIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Profile() {
  const { user } = useAuth()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchResumes = async () => {
    try {
      const res = await resumeAPI.getAll()
      setResumes(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  const handleDeleteResume = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await resumeAPI.delete(id)
        toast.success('Resume deleted')
        fetchResumes()
      } catch (err) {
        toast.error('Failed to delete resume')
      }
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Profile Settings</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="card flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold mb-4 shadow-inner">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-slate-500 mb-3">{user?.email}</p>
            <span className="badge bg-indigo-50 text-indigo-700 capitalize border border-indigo-100 px-3 py-1">
              {user?.role || 'Candidate'}
            </span>
            <div className="mt-6 w-full pt-6 border-t border-slate-100 text-sm text-slate-500">
              Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
            </div>
          </div>

          {/* Activity Summary */}
          <div className="card p-0 overflow-hidden">
            <h3 className="font-semibold text-slate-900 p-4 border-b border-slate-100 bg-slate-50">Activity Summary</h3>
            <div className="divide-y divide-slate-100">
              <div className="flex justify-between p-4">
                <span className="text-slate-600">Applications</span>
                <span className="font-semibold text-slate-900">0</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-slate-600">Saved Jobs</span>
                <span className="font-semibold text-slate-900">0</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-slate-600">Resumes Uploaded</span>
                <span className="font-semibold text-slate-900">{resumes.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Account Settings Form */}
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-indigo-500" />
              Account Information
            </h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Profile updated!'); }}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" className="input" defaultValue={user?.name} />
                </div>
                <div>
                  <label className="label">Email Address (Read-only)</label>
                  <input type="email" className="input bg-slate-50 text-slate-500" defaultValue={user?.email} readOnly disabled />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="btn-primary">Update Profile</button>
              </div>
            </form>
          </div>

          {/* Resumes */}
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <DocumentIcon className="w-5 h-5 text-indigo-500" />
              My Resumes
            </h3>
            
            {resumes.length > 0 ? (
              <div className="space-y-3">
                {resumes.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <DocumentIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{r.filename || 'resume.pdf'}</p>
                        <p className="text-xs text-slate-500">Uploaded {new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:block text-right mr-4">
                        <p className="text-xs text-slate-500">AI Score</p>
                        <p className="font-bold text-indigo-600">{r.score || 85}</p>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="View Analysis">
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteResume(r.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Delete">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                <p className="text-slate-500 mb-4">You haven't uploaded any resumes yet.</p>
                <a href="/resume/upload" className="btn-secondary">Upload Resume</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
