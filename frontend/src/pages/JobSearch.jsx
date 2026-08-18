import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsAPI } from '../services/api'
import JobCard from '../components/JobCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { MagnifyingGlassIcon, MapPinIcon, AdjustmentsHorizontalIcon, FaceFrownIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function JobSearch() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [experience, setExperience] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalJobs, setTotalJobs] = useState(0)

  const navigate = useNavigate()

  const fetchJobs = useCallback(async (isSearch = false) => {
    try {
      setLoading(true)
      const params = {
        page: isSearch ? 1 : page,
        limit: 12,
        ...(search && { search }),
        ...(location && { location }),
        ...(experience && { experience })
      }
      const res = await jobsAPI.getAll(params)
      setJobs(res.data.items || res.data || [])
      setTotalPages(res.data.pages || 1)
      setTotalJobs(res.data.total || (Array.isArray(res.data) ? res.data.length : 0))
      if (isSearch) setPage(1)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }, [search, location, experience, page])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [search, location, experience, fetchJobs])

  useEffect(() => {
    fetchJobs()
  }, [page]) // Only fetch when page changes directly

  const handleSave = async (job) => {
    try {
      if (job.is_saved) {
        await jobsAPI.unsave(job.id)
        toast.success('Job removed from saved')
      } else {
        await jobsAPI.save(job.id)
        toast.success('Job saved successfully')
      }
      setJobs(jobs.map(j => j.id === job.id ? { ...j, is_saved: !j.is_saved } : j))
    } catch (err) {
      toast.error('Failed to update job status')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Job Search</h1>
        <p className="text-slate-500 mt-1">Find your next role from thousands of opportunities.</p>
      </div>

      <div className="card p-4">
        <div className="grid md:grid-cols-12 gap-4">
          <div className="md:col-span-5 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="md:col-span-4 relative">
            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="City, state, or remote"
              className="input pl-10"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="md:col-span-3 relative">
            <AdjustmentsHorizontalIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              className="input pl-10 appearance-none bg-white"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="">Any Experience</option>
              <option value="entry">0-2 years (Entry)</option>
              <option value="mid">3-5 years (Mid)</option>
              <option value="senior">5+ years (Senior)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-slate-600">
        <span>Showing {jobs.length} of {totalJobs} jobs</span>
        <div className="flex items-center gap-2">
          <span>Sort by:</span>
          <select className="border-none bg-transparent font-medium text-slate-900 focus:ring-0 cursor-pointer">
            <option>Latest</option>
            <option>Best Match</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card h-48 animate-pulse bg-slate-100 border-none"></div>
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job =>(
              job?.id ? (
                <JobCard
                  key={job.id}
                  job={job}
                  matchScore={job.match_score}
                  onSave={handleSave}
                  onViewDetails={() => navigate(`/jobs/${job.id}`)}
                />
              ) : null
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="btn-secondary px-3 py-1 text-sm"
              >
                Previous
              </button>
              <span className="px-4 py-1 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg">
                Page {page} of {totalPages}
              </span>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary px-3 py-1 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState 
          icon={<FaceFrownIcon className="w-16 h-16 text-slate-300 mx-auto" />}
          title="No jobs found"
          description="We couldn't find any jobs matching your current filters. Try broadening your search criteria."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('')
            setLocation('')
            setExperience('')
          }}
        />
      )}
    </div>
  )
}
