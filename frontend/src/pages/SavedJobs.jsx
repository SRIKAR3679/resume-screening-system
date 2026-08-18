import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsAPI } from '../services/api'
import JobCard from '../components/JobCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { BookmarkSlashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function SavedJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchSavedJobs()
  }, [])

  const fetchSavedJobs = async () => {
    try {
      setLoading(true)
      const res = await jobsAPI.getSaved()
      // Map API response to JobCard expected format
      // the endpoint might return an array of user_jobs, where user_job.job contains the job data
      const mappedJobs = res.data.map(item => ({
        ...(item.job || item),
        is_saved: true,
        saved_at: item.created_at || Date.now()
      }))
      setJobs(mappedJobs)
    } catch (err) {
      toast.error('Failed to load saved jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (job) => {
    try {
      await jobsAPI.unsave(job.id)
      setJobs(jobs.filter(j => j.id !== job.id))
      toast.success('Job removed from saved list')
    } catch (err) {
      toast.error('Failed to remove job')
    }
  }

  if (loading) return <LoadingSpinner message="Loading your saved jobs..." />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
        <p className="text-slate-500 mt-1">Keep track of the opportunities you are interested in.</p>
      </div>

      {jobs.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <div key={job.id} className="relative group">
              <JobCard 
                job={job}
                onSave={handleUnsave}
                onViewDetails={() => navigate(`/jobs/${job.id}`)}
                onApply={() => toast.success('Application feature coming soon!')}
              />
              <div className="absolute top-4 left-4 right-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-medium text-slate-500 bg-white/90 backdrop-blur-sm px-2 py-1 rounded">
                  Saved {new Date(job.saved_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={<BookmarkSlashIcon className="w-16 h-16 text-slate-300 mx-auto" />}
          title="No saved jobs"
          description="You haven't saved any jobs yet. Browse the job board and click the bookmark icon to save jobs for later."
          actionLabel="Browse Jobs"
          actionLink="/jobs"
        />
      )}
    </div>
  )
}
