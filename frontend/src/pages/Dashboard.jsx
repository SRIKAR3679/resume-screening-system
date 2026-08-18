import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { resumeAPI, recommendationsAPI, jobsAPI, matchingAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import SkillBadge from '../components/SkillBadge'
import { DocumentTextIcon, ChartBarIcon, StarIcon, BookmarkIcon, ArrowRightIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4']

const CATEGORY_KEYWORDS = {
  Programming: ['python', 'javascript', 'java', 'c++', 'typescript', 'go', 'rust', 'ruby', 'php', 'swift'],
  Database:    ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'nosql'],
  ML_AI:       ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp', 'ai', 'sklearn', 'pandas', 'numpy'],
  Cloud:       ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'devops', 'terraform', 'ci/cd'],
  Web:         ['react', 'vue', 'angular', 'html', 'css', 'node', 'express', 'fastapi', 'django', 'flask'],
  Other:       []
}

function categorizeSkills(skills) {
  const counts = { Programming: 0, Database: 0, ML_AI: 0, Cloud: 0, Web: 0, Other: 0 }
  skills.forEach(skill => {
    const s = skill.toLowerCase()
    let matched = false
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (cat === 'Other') continue
      if (keywords.some(kw => s.includes(kw))) {
        counts[cat]++
        matched = true
        break
      }
    }
    if (!matched) counts.Other++
  })
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [latestResume, setLatestResume] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [savedCount, setSavedCount] = useState(0)
  const [matchHistory, setMatchHistory] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [resumeRes, recsRes, savedRes, matchRes] = await Promise.all([
          resumeAPI.getAll().catch(() => ({ data: [] })),
          recommendationsAPI.get().catch(() => ({ data: [] })),
          jobsAPI.getSaved().catch(() => ({ data: [] })),
          matchingAPI.getHistory().catch(() => ({ data: [] })),
        ])
        setLatestResume(resumeRes.data?.[0] || null)
        setRecommendations(Array.isArray(recsRes.data) ? recsRes.data.slice(0, 5) : [])
        setSavedCount(Array.isArray(savedRes.data) ? savedRes.data.length : 0)
        setMatchHistory(Array.isArray(matchRes.data) ? matchRes.data.slice(0, 3) : [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />

  const skills = latestResume?.skills || []
  const resumeScore = Math.round(latestResume?.resume_score || 0)
  const skillCategories = categorizeSkills(skills)

  const barData = recommendations
    .filter(r => r.job_title && r.overall_score)
    .map(r => ({
      name: r.job_title?.split(' ').slice(0, 2).join(' ') || 'Job',
      match: Math.round(r.overall_score || 0)
    }))

  const statCards = [
    { name: 'Resume Score', value: latestResume ? `${resumeScore}%` : '—', icon: TrophyIcon, color: 'text-indigo-600', bg: 'bg-indigo-100', link: '/resume/analysis' },
    { name: 'Skills Detected', value: skills.length || '—', icon: ChartBarIcon, color: 'text-emerald-600', bg: 'bg-emerald-100', link: '/resume/analysis' },
    { name: 'Recommendations', value: recommendations.length || '—', icon: StarIcon, color: 'text-amber-600', bg: 'bg-amber-100', link: '/recommendations' },
    { name: 'Saved Jobs', value: savedCount, icon: BookmarkIcon, color: 'text-rose-600', bg: 'bg-rose-100', link: '/saved-jobs' },
  ]

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-rose-600 bg-rose-50 border-rose-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's your AI-powered job search overview.</p>
        </div>
        {!latestResume && (
          <Link to="/resume/upload" className="btn-primary flex items-center gap-2">
            Upload Resume
          </Link>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Link to={stat.link} key={i} className="card flex items-center p-5 hover:shadow-md transition-shadow cursor-pointer">
            <div className={`p-3 rounded-lg ${stat.bg} mr-4 shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Resume Card */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">My Latest Resume</h3>
              {latestResume && (
                <Link to="/resume/analysis" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                  View Analysis <ArrowRightIcon className="w-3 h-3" />
                </Link>
              )}
            </div>
            {latestResume ? (
              <div className="flex items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                <DocumentTextIcon className="w-10 h-10 text-indigo-500 mr-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{latestResume.filename}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Uploaded {new Date(latestResume.upload_date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className={`ml-3 text-sm font-bold px-2 py-1 rounded-full border ${getScoreColor(resumeScore)}`}>
                  {resumeScore}%
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <DocumentTextIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-3 text-sm">No resume uploaded yet.</p>
                <Link to="/resume/upload" className="btn-primary text-sm px-4 py-2">Upload Now</Link>
              </div>
            )}
          </div>

          {/* Skills from Resume */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800">Detected Skills</h3>
              <span className="text-xs text-slate-400">{skills.length} total</span>
            </div>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 18).map((skill, i) => (
                  <SkillBadge key={i} skill={skill} variant="blue" />
                ))}
                {skills.length > 18 && (
                  <span className="text-xs text-slate-500 self-center">+{skills.length - 18} more</span>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">
                Upload a resume to see your detected skills.
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skill Distribution Chart */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Skill Distribution</h3>
            {skillCategories.length > 0 ? (
              <>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={skillCategories} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                        {skillCategories.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {skillCategories.map((cat, i) => (
                    <div key={i} className="flex items-center text-xs text-slate-600">
                      <div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {cat.name} ({cat.value})
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-52 flex items-center justify-center text-sm text-slate-400">
                Upload a resume to see your skill breakdown.
              </div>
            )}
          </div>

          {/* Recent Match History */}
          {matchHistory.length > 0 && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800">Recent Analyses</h3>
                <Link to="/jobs" className="text-xs text-indigo-600 hover:underline">Browse jobs</Link>
              </div>
              <div className="space-y-3">
                {matchHistory.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {m.job?.title || `Job #${m.job_id}`}
                      </p>
                      <p className="text-xs text-slate-500">{m.job?.company || ''}</p>
                    </div>
                    <div className={`ml-3 text-xs font-bold px-2 py-1 rounded-full border shrink-0 ${getScoreColor(Math.round(m.overall_score || 0))}`}>
                      {Math.round(m.overall_score || 0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Bar Chart */}
      {barData.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800">Top Recommendations — Match Score</h3>
            <Link to="/recommendations" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              View All <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  formatter={(v) => [`${v}%`, 'Match Score']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="match" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CTA if no resume */}
      {!latestResume && (
        <div className="card bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100 text-center py-10">
          <h3 className="text-lg font-bold text-indigo-900 mb-2">Get Started in 3 Simple Steps</h3>
          <p className="text-indigo-700 text-sm mb-6">Upload your resume → Get AI match scores → Apply to your best-fit jobs</p>
          <Link to="/resume/upload" className="btn-primary px-8 py-3 text-base">
            Upload My Resume Now →
          </Link>
        </div>
      )}
    </div>
  )
}
