import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import SkillBadge from '../components/SkillBadge'
import JobCard from '../components/JobCard'
import { ArrowLeftIcon, BuildingOfficeIcon, MapPinIcon, BriefcaseIcon, AcademicCapIcon, CurrencyDollarIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

export default function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [similarJobs, setSimilarJobs] = useState([])

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        const res = await jobsAPI.getById(id)
        setJob(res.data)
        
        // Fetch similar jobs (mock implementation)
        const simRes = await jobsAPI.getAll({ limit: 3 })
        setSimilarJobs(simRes.data.items || simRes.data || [])
      } catch (err) {
        toast.error('Job not found')
        navigate('/jobs')
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [id, navigate])

  const handleSave = async () => {
    if (!job) return
    try {
      if (job.is_saved) {
        await jobsAPI.unsave(job.id)
        toast.success('Job removed from saved')
      } else {
        await jobsAPI.save(job.id)
        toast.success('Job saved successfully')
      }
      setJob({ ...job, is_saved: !job.is_saved })
    } catch (err) {
      toast.error('Failed to update job status')
    }
  }

  if (loading) return <LoadingSpinner message="Loading job details..." />
  if (!job) return null

  const skills = Array.isArray(job.skills) ? job.skills : (typeof job.skills === 'string' ? job.skills.split(',') : [])

  return (
    <div className="max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" /> Back to jobs
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                <p className="text-lg text-slate-600 mt-1">{job.company}</p>
              </div>
              <button onClick={handleSave} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-lg">
                {job.is_saved ? <BookmarkSolidIcon className="w-6 h-6 text-indigo-600" /> : <BookmarkIcon className="w-6 h-6" />}
              </button>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg text-sm border border-slate-100">
                <MapPinIcon className="w-5 h-5 text-slate-400" />
                {job.location}
              </div>
              <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg text-sm border border-slate-100">
                <BriefcaseIcon className="w-5 h-5 text-slate-400" />
                {job.job_type || 'Full-time'}
              </div>
              <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg text-sm border border-slate-100">
                <AcademicCapIcon className="w-5 h-5 text-slate-400" />
                {job.experience_required || 'Not specified'}
              </div>
              {job.salary_range && (
                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg text-sm border border-slate-100">
                  <CurrencyDollarIcon className="w-5 h-5 text-slate-400" />
                  {job.salary_range}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <SkillBadge key={i} skill={skill.trim()} variant="gray" />
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Job Description</h2>
            <div className="prose prose-slate max-w-none whitespace-pre-wrap">
              {job.description || "No description provided."}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card sticky top-24 border-2 border-indigo-100 shadow-md">
            <h3 className="font-bold text-slate-900 mb-2">Interested in this role?</h3>
            <p className="text-sm text-slate-500 mb-6">See how well your resume matches this job description before applying.</p>
            
            <button 
              onClick={() => navigate(`/jobs/${job.id}/match`)}
              className="w-full btn-primary py-3 mb-3 flex justify-center items-center gap-2"
            >
              Match My Resume
            </button>
            <button 
              onClick={() => toast.success('Application feature coming soon!')}
              className="w-full btn-secondary py-3 flex justify-center"
            >
              Apply Directly
            </button>
          </div>

          <div className="card">
            <h3 className="font-bold text-slate-900 mb-4">Similar Jobs</h3>
            <div className="space-y-4">
              {similarJobs.filter(j => j.id !== job.id).slice(0, 3).map(simJob => (
                <div key={simJob.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <h4 className="font-medium text-slate-900 line-clamp-1">{simJob.title}</h4>
                  <p className="text-sm text-slate-500 mb-2">{simJob.company}</p>
                  <button 
                    onClick={() => navigate(`/jobs/${simJob.id}`)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    View Job →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
