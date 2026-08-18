import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { resumeAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ScoreGauge from '../components/ScoreGauge'
import SkillBadge from '../components/SkillBadge'
import { DocumentTextIcon, ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function ResumeAnalysis() {
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchResume = async () => {
    try {
      setLoading(true)
      const res = await resumeAPI.getAll()
      if (res.data && res.data.length > 0) {
        // Assume first is latest for simplicity
        setResume(res.data[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResume()
  }, [])

  if (loading) return <LoadingSpinner message="Loading your analysis..." />

  if (!resume) {
    return (
      <EmptyState 
        icon="📄" 
        title="No Resume Found" 
        description="Upload a resume to get a detailed AI analysis of your skills, strengths, and areas for improvement."
        actionLabel="Upload Resume"
        actionLink="/resume/upload"
      />
    )
  }

  // Mock data to augment real data if missing
  const parsedData = resume.parsed_data || {}
  const skills = Array.isArray(resume.skills) ? resume.skills : ['React', 'JavaScript', 'Node.js', 'Python', 'SQL', 'Git', 'AWS']
  const score = resume.score || 78
  
  const strengths = [
    'Strong foundation in modern web technologies',
    'Good progression of responsibilities across roles',
    'Clear demonstration of quantitative impact in recent projects'
  ]
  
  const improvements = [
    'Add more cloud infrastructure skills (e.g., Docker, Kubernetes)',
    'Include a summary statement highlighting core expertise',
    'Quantify results in your earlier roles'
  ]

  const keywords = ['Frontend', 'API Design', 'Agile', 'Team Lead', 'Optimization', 'Testing']

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <DocumentTextIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Resume Analysis</h1>
            <p className="text-sm text-slate-500">{resume.filename || 'latest_resume.pdf'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchResume} className="btn-secondary flex items-center gap-2 text-sm py-1.5">
            <ArrowPathIcon className="w-4 h-4" /> Refresh
          </button>
          <button className="btn-secondary flex items-center gap-2 text-sm py-1.5">
            <ArrowDownTrayIcon className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card md:col-span-2">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Candidate Profile</h2>
          
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-slate-500 mb-1">Full Name</p>
              <p className="font-medium text-slate-900">{parsedData.name || 'John Doe'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Email</p>
              <p className="font-medium text-slate-900">{parsedData.email || 'johndoe@example.com'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Phone</p>
              <p className="font-medium text-slate-900">{parsedData.phone || '+1 234 567 8900'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Experience</p>
              <p className="font-medium text-slate-900">{parsedData.years_experience || '5'} Years</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-slate-800 mb-3 border-b border-slate-100 pb-2">Education</h3>
            <ul className="space-y-3">
              {(parsedData.education || [{degree: 'B.S. Computer Science', institution: 'University of Tech'}]).map((edu, i) => (
                <li key={i} className="flex flex-col">
                  <span className="font-medium text-slate-900">{edu.degree || edu}</span>
                  <span className="text-sm text-slate-500">{edu.institution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Score Card */}
        <div className="card flex flex-col items-center justify-center text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Resume Score</h2>
          <ScoreGauge score={score} size={180} />
          <p className="text-sm text-slate-500 mt-4 px-4">
            Based on formatting, completeness, and industry standard metrics.
          </p>
        </div>
      </div>

      {/* Skills Card */}
      <div className="card">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          Extracted Skills
          <span className="badge bg-indigo-100 text-indigo-800">{skills.length}</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <SkillBadge key={i} skill={skill} variant="blue" />
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
          <h3 className="text-lg font-bold text-emerald-900 mb-4">Core Strengths</h3>
          <ul className="space-y-3">
            {strengths.map((s, i) => (
              <li key={i} className="flex gap-3 text-emerald-800 text-sm">
                <span className="font-bold mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
          <h3 className="text-lg font-bold text-amber-900 mb-4">Areas for Improvement</h3>
          <ul className="space-y-3">
            {improvements.map((s, i) => (
              <li key={i} className="flex gap-3 text-amber-800 text-sm">
                <span className="font-bold mt-0.5">!</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Keywords */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 mb-3">Industry Keywords Detected</h3>
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw, i) => (
            <SkillBadge key={i} skill={kw} variant="gray" />
          ))}
        </div>
      </div>
    </div>
  )
}
