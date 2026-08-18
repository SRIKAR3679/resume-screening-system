import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobsAPI, matchingAPI, resumeAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import MatchResultCard from '../components/MatchResultCard'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function JobMatch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState('')
  const [matchResult, setMatchResult] = useState(null)
  
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [jobRes, resRes] = await Promise.all([
          jobsAPI.getById(id),
          resumeAPI.getAll().catch(() => ({ data: [] }))
        ])
        
        setJob(jobRes.data)
        setResumes(resRes.data)
        if (resRes.data.length > 0) {
          setSelectedResume(resRes.data[0].id)
        }
      } catch (err) {
        toast.error('Failed to load data')
        navigate('/jobs')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, navigate])

  const handleAnalyze = async () => {
    if (!selectedResume) {
      toast.error('Please select a resume first')
      return
    }

    try {
      setAnalyzing(true)
      // Call analyze endpoint
      const res = await matchingAPI.analyze({ resume_id: selectedResume, job_id: id })
      
      // The API might return the result immediately or we might need to fetch it
      // Let's assume it returns it immediately for this frontend
      setMatchResult(res.data)
      toast.success('Analysis complete!')
    } catch (err) {
      toast.error('Failed to analyze match')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading..." />
  if (!job) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(`/jobs/${id}`)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" /> Back to job details
      </button>

      {!matchResult && !analyzing && (
        <div className="card p-8 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyze Match</h2>
          <p className="text-slate-600 mb-8">
            Let our AI compare your resume against <span className="font-semibold">{job.title}</span> at {job.company}.
          </p>

          {resumes.length > 0 ? (
            <div className="space-y-6">
              <div className="text-left">
                <label className="label">Select Resume to Match</label>
                <select 
                  className="input"
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.filename || `Resume from ${new Date(r.created_at).toLocaleDateString()}`}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleAnalyze} className="btn-primary w-full py-3 text-lg">
                Start AI Analysis
              </button>
            </div>
          ) : (
            <div className="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200">
              <p className="mb-3">You need to upload a resume first to see your match score.</p>
              <button onClick={() => navigate('/resume/upload')} className="btn-primary">
                Upload Resume
              </button>
            </div>
          )}
        </div>
      )}

      {analyzing && (
        <div className="card p-12 flex flex-col items-center">
          <LoadingSpinner message="AI is analyzing your resume against the job description..." />
          <div className="mt-8 text-sm text-slate-500 animate-pulse">
            Extracting skills • Semantic matching • Evaluating experience
          </div>
        </div>
      )}

      {matchResult && !analyzing && (
        <div className="space-y-6">
          <MatchResultCard matchResult={matchResult} />
          
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => toast.success('Application feature coming soon!')}
              className="btn-primary px-8 py-3 text-lg"
            >
              Apply for this Job
            </button>
            <button 
              onClick={() => navigate('/jobs')}
              className="btn-secondary px-8 py-3 text-lg"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
