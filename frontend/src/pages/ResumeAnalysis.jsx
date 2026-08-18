import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { resumeAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ScoreGauge from '../components/ScoreGauge'
import SkillBadge from '../components/SkillBadge'
import { DocumentTextIcon, ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

export default function ResumeAnalysis() {
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchResume = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await resumeAPI.getAll()
      if (res.data && res.data.length > 0) {
        // Get most recently uploaded resume
        const sorted = [...res.data].sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date))
        setResume(sorted[0])
      } else {
        setResume(null)
      }
    } catch (err) {
      setError('Failed to load resume data.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResume() }, [])

  if (loading) return <LoadingSpinner message="Loading your resume analysis..." />

  if (!resume) {
    return (
      <EmptyState
        icon="📄"
        title="No Resume Found"
        description="Upload your resume (PDF or DOCX) to get a detailed AI analysis of your skills, experience, and recommendations."
        actionLabel="Upload Resume"
        actionLink="/resume/upload"
      />
    )
  }

  // Parse real data from API
  const skills   = Array.isArray(resume.skills) ? resume.skills : []
  const score    = resume.resume_score || resume.score || 0

  let education = []
  try { education = JSON.parse(resume.education || '[]') } catch { education = [] }
  if (!Array.isArray(education)) education = []

  let keywords = []
  try { keywords = JSON.parse(resume.keywords || '[]') } catch { keywords = [] }

  let projects = []
  try { projects = JSON.parse(resume.projects || '[]') } catch { projects = [] }

  let certifications = []
  try { certifications = JSON.parse(resume.certifications || '[]') } catch { certifications = [] }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <DocumentTextIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Resume Analysis</h1>
            <p className="text-sm text-slate-500">{resume.filename || 'Uploaded Resume'}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {resume._parsed_by === 'groq' && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
              ✨ Groq AI
            </span>
          )}
          <button onClick={fetchResume} className="btn-secondary flex items-center gap-2 text-sm py-1.5">
            <ArrowPathIcon className="w-4 h-4" /> Refresh
          </button>
          <Link to="/resume/upload" className="btn-primary text-sm py-1.5">
            Upload New
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
          <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Profile + Score */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card md:col-span-2">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Candidate Profile</h2>
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Full Name</p>
              <p className="font-medium text-slate-900">{resume.name || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Email</p>
              <p className="font-medium text-slate-900">{resume.email || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Phone</p>
              <p className="font-medium text-slate-900">{resume.phone || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Experience</p>
              <p className="font-medium text-slate-900">
                {resume.experience_years != null ? `${resume.experience_years} Years` : '—'}
              </p>
            </div>
          </div>

          {/* Education */}
          {education.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">Education</h3>
              <ul className="space-y-2">
                {education.map((edu, i) => (
                  <li key={i} className="text-slate-700 text-sm">
                    {typeof edu === 'string' ? edu : `${edu.degree || ''} ${edu.institution ? '— ' + edu.institution : ''}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary (Groq AI generated) */}
          {resume.summary && (
            <div className="bg-indigo-50 rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold text-indigo-700 mb-1">✨ AI Summary</p>
              <p className="text-sm text-indigo-900">{resume.summary}</p>
            </div>
          )}
        </div>

        {/* Score */}
        <div className="card flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Resume Score</h2>
          <ScoreGauge score={score} size={180} />
          <p className="text-sm text-slate-500 mt-4 px-4">
            Based on completeness, skills match, and industry standards.
          </p>
          {score === 0 && (
            <p className="text-xs text-amber-600 mt-2">Upload a resume with more detail to improve your score.</p>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="card">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          Extracted Skills
          <span className="badge bg-indigo-100 text-indigo-800">{skills.length}</span>
        </h2>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <SkillBadge key={i} skill={typeof skill === 'string' ? skill : skill.name} variant="blue" />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No skills detected. Try uploading a more detailed resume.</p>
        )}
      </div>

      {/* Projects + Certifications */}
      {(projects.length > 0 || certifications.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {projects.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-slate-900 mb-3">Projects</h3>
              <ul className="space-y-2">
                {projects.map((p, i) => (
                  <li key={i} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-indigo-400 mt-0.5">▸</span>
                    <span>{typeof p === 'string' ? p : p.name || JSON.stringify(p)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {certifications.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-slate-900 mb-3">Certifications</h3>
              <ul className="space-y-2">
                {certifications.map((c, i) => (
                  <li key={i} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span>{typeof c === 'string' ? c : JSON.stringify(c)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-3">Industry Keywords Detected</h3>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <SkillBadge key={i} skill={kw} variant="gray" />
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white text-center">
        <h3 className="text-lg font-bold mb-2">Ready to find matching jobs?</h3>
        <p className="text-indigo-100 text-sm mb-4">See which jobs match your extracted skills and experience.</p>
        <Link to="/recommendations" className="bg-white text-indigo-700 font-semibold px-6 py-2 rounded-lg hover:bg-indigo-50 transition">
          View Job Recommendations →
        </Link>
      </div>
    </div>
  )
}
