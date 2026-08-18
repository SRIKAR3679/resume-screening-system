import React from 'react'
import ScoreGauge from './ScoreGauge'
import SkillBadge from './SkillBadge'
import { LightBulbIcon } from '@heroicons/react/24/outline'

export default function MatchResultCard({ matchResult }) {
  if (!matchResult) return null

  const {
    job_title,
    company,
    overall_score,
    skills_match_score = 0,
    semantic_match_score = 0,
    experience_match_score = 0,
    education_match_score = 0,
    matching_skills = [],
    missing_skills = [],
    suggestions = []
  } = matchResult

  const ProgressBar = ({ label, score }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-600">{Math.round(score)}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div 
          className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" 
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  )

  return (
    <div className="card max-w-4xl mx-auto border-t-4 border-t-indigo-600">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">{job_title}</h2>
        {company && <p className="text-lg text-slate-600">{company}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100">
          <ScoreGauge score={overall_score || 0} size={180} label="Overall Match" />
        </div>
        
        <div className="flex flex-col justify-center space-y-2">
          <ProgressBar label="Skills Match" score={skills_match_score} />
          <ProgressBar label="Semantic Match" score={semantic_match_score} />
          <ProgressBar label="Experience Match" score={experience_match_score} />
          <ProgressBar label="Education Match" score={education_match_score} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
          <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
            Matching Skills
            <span className="badge bg-emerald-200 text-emerald-800">{matching_skills.length}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {matching_skills.length > 0 ? (
              matching_skills.map((skill, i) => <SkillBadge key={i} skill={skill} variant="green" />)
            ) : (
              <p className="text-sm text-emerald-600/70 italic">No matching skills found.</p>
            )}
          </div>
        </div>

        <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
          <h3 className="font-semibold text-rose-800 mb-3 flex items-center gap-2">
            Missing Skills
            <span className="badge bg-rose-200 text-rose-800">{missing_skills.length}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {missing_skills.length > 0 ? (
              missing_skills.map((skill, i) => <SkillBadge key={i} skill={skill} variant="red" />)
            ) : (
              <p className="text-sm text-rose-600/70 italic">You have all required skills!</p>
            )}
          </div>
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
          <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
            <LightBulbIcon className="w-5 h-5" />
            Suggestions to Improve
          </h3>
          <ul className="space-y-3">
            {suggestions.map((sug, i) => (
              <li key={i} className="flex gap-3 text-amber-900 text-sm">
                <span className="font-bold text-amber-500 mt-0.5">•</span>
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
