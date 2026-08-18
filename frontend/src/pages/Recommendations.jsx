import React, { useEffect, useState } from 'react'
import { recommendationsAPI, jobsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import SkillBadge from '../components/SkillBadge'
import { StarIcon, ArrowPathIcon, DocumentPlusIcon, BuildingOfficeIcon, MapPinIcon, BriefcaseIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [noResume, setNoResume] = useState(false)
  const navigate = useNavigate()

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setNoResume(false)
      const res = await recommendationsAPI.get()
      setRecommendations(res.data || [])
    } catch (err) {
      if (err.response?.status === 400) {
        setNoResume(true)
      } else {
        toast.error('Failed to load recommendations')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRecommendations() }, [])

  const handleSave = async (jobId, isSaved) => {
    try {
      if (isSaved) {
        await jobsAPI.unsave(jobId)
        toast.success('Job removed from saved')
      } else {
        await jobsAPI.save(jobId)
        toast.success('Job saved!')
      }
      setRecommendations(prev =>
        prev.map(r => r.job_id === jobId ? { ...r, is_saved: !isSaved } : r)
      )
    } catch {
      toast.error('Failed to update saved status')
    }
  }

  const getScoreColor = (score) => {
    if (score >= 70) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    if (score >= 40) return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-rose-100 text-rose-700 border-rose-200'
  }

  const getBarColor = (score) => {
    if (score >= 70) return 'bg-emerald-500'
    if (score >= 40) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  if (loading) return <LoadingSpinner message="AI is finding the best jobs for you..." />

  if (noResume) {
    return (
      <EmptyState
        icon={<DocumentPlusIcon className="w-16 h-16 text-slate-300 mx-auto" />}
        title="Upload your resume first"
        description="We need your resume to generate personalized job recommendations based on your skills and experience."
        actionLabel="Upload Resume"
        actionLink="/resume/upload"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <StarIcon className="w-7 h-7 text-amber-500 fill-amber-500" />
            AI Job Recommendations
          </h1>
          <p className="text-slate-500 mt-1">
            {recommendations.length > 0
              ? `${recommendations.length} jobs ranked by your compatibility score`
              : 'Based on your resume and skill profile'}
          </p>
        </div>
        <button onClick={fetchRecommendations} className="btn-secondary flex items-center gap-2 text-sm">
          <ArrowPathIcon className="w-4 h-4" /> Refresh
        </button>
      </div>

      {recommendations.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No recommendations yet"
          description="We couldn't find strong matches right now. Try uploading a more detailed resume or check back as new jobs are added."
          actionLabel="Browse All Jobs"
          actionLink="/jobs"
        />
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => {
            const score = Math.round(rec.overall_score || 0)
            const matchingSkills = rec.matching_skills || []
            const missingSkills = rec.missing_skills || []
            const suggestions = rec.suggestions || []

            return (
              <div
                key={rec.job_id || idx}
                className={`card border-l-4 ${idx === 0 ? 'border-l-amber-400' : idx === 1 ? 'border-l-slate-400' : idx === 2 ? 'border-l-orange-400' : 'border-l-slate-200'} relative`}
              >
                {/* Rank badge */}
                {idx < 3 && (
                  <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-700'}`}>
                    #{idx + 1} Match
                  </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Job Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900">{rec.job_title}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <BuildingOfficeIcon className="w-4 h-4" />{rec.job_company}
                          </span>
                          {rec.job_location && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="w-4 h-4" />{rec.job_location}
                            </span>
                          )}
                          {rec.experience_required > 0 && (
                            <span className="flex items-center gap-1">
                              <BriefcaseIcon className="w-4 h-4" />{rec.experience_required}+ yrs
                            </span>
                          )}
                          {rec.salary_range && (
                            <span className="font-medium text-emerald-600">{rec.salary_range}</span>
                          )}
                        </div>

                        {/* AI Reason */}
                        {rec.reason && (
                          <p className="mt-3 text-sm text-slate-600 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                            💡 {rec.reason}
                          </p>
                        )}

                        {/* Skills */}
                        <div className="mt-3">
                          {matchingSkills.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-emerald-700 mb-1">✓ Matching Skills</p>
                              <div className="flex flex-wrap gap-1">
                                {matchingSkills.slice(0, 6).map((s, i) => (
                                  <SkillBadge key={i} skill={s} variant="green" />
                                ))}
                                {matchingSkills.length > 6 && (
                                  <span className="text-xs text-slate-500 self-center">+{matchingSkills.length - 6} more</span>
                                )}
                              </div>
                            </div>
                          )}
                          {missingSkills.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-rose-700 mb-1">✗ Missing Skills</p>
                              <div className="flex flex-wrap gap-1">
                                {missingSkills.slice(0, 4).map((s, i) => (
                                  <SkillBadge key={i} skill={s} variant="red" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Panel */}
                  <div className="flex flex-col justify-between">
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full border-4 ${score >= 70 ? 'border-emerald-400 bg-emerald-50' : score >= 40 ? 'border-amber-400 bg-amber-50' : 'border-rose-400 bg-rose-50'}`}>
                        <span className={`text-2xl font-black ${score >= 70 ? 'text-emerald-700' : score >= 40 ? 'text-amber-700' : 'text-rose-700'}`}>
                          {score}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Match Score</p>
                    </div>

                    {/* Score breakdown */}
                    <div className="space-y-2 mt-4 text-xs">
                      {[
                        { label: 'Skills', value: rec.skill_score || 0 },
                        { label: 'Semantic', value: rec.semantic_score || 0 },
                        { label: 'Experience', value: rec.experience_score || 0 },
                        { label: 'Education', value: rec.education_score || 0 },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div className="flex justify-between text-slate-500 mb-0.5">
                            <span>{label}</span><span>{Math.round(value)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full">
                            <div className={`h-1.5 rounded-full ${getBarColor(value)}`} style={{ width: `${Math.min(100, value)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/jobs/${rec.job_id}`)}
                        className="flex-1 btn-secondary text-xs py-2"
                      >
                        View Job
                      </button>
                      <button
                        onClick={() => navigate(`/jobs/${rec.job_id}/match`)}
                        className="flex-1 btn-primary text-xs py-2"
                      >
                        Full Analysis
                      </button>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-600 mb-2">💡 Improvement Suggestions</p>
                    <ul className="space-y-1">
                      {suggestions.slice(0, 2).map((s, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-indigo-400 mt-0.5">→</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
