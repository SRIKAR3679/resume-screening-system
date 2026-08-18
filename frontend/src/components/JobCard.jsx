import React from 'react'
import { BuildingOfficeIcon, MapPinIcon, BriefcaseIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'
import SkillBadge from './SkillBadge'

export default function JobCard({ job, matchScore, onSave, onApply, onViewDetails }) {
  const skills = Array.isArray(job.skills) ? job.skills : (typeof job.skills === 'string' ? job.skills.split(',') : [])
  const displaySkills = skills.slice(0, 4)
  const remainingSkills = skills.length - 4

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50'
    if (score >= 40) return 'text-amber-600 bg-amber-50'
    return 'text-rose-600 bg-rose-50'
  }

  const getProgressColor = (score) => {
    if (score >= 70) return 'bg-emerald-500'
    if (score >= 40) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-1" title={job.title}>{job.title}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <BuildingOfficeIcon className="w-4 h-4" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <BriefcaseIcon className="w-4 h-4" />
              <span>{job.experience_required}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onSave?.(job); }}
          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
        >
          {job.is_saved ? <BookmarkSolidIcon className="w-6 h-6 text-indigo-600" /> : <BookmarkIcon className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap gap-2 mb-4">
          {displaySkills.map((skill, idx) => (
            <SkillBadge key={idx} skill={skill.trim()} variant="gray" />
          ))}
          {remainingSkills > 0 && (
            <SkillBadge skill={`+${remainingSkills} more`} variant="gray" />
          )}
        </div>
      </div>

      {matchScore !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-500">Match Score</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getScoreColor(matchScore)}`}>
              {matchScore}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getProgressColor(matchScore)}`} 
              style={{ width: `${Math.max(0, Math.min(100, matchScore))}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100">
        <button 
          onClick={() => onViewDetails?.(job)}
          className="flex-1 btn-secondary text-sm py-1.5"
        >
          Details
        </button>
        {onApply && (
          <button 
            onClick={() => onApply?.(job)}
            className="flex-1 btn-primary text-sm py-1.5"
          >
            Apply
          </button>
        )}
      </div>
    </div>
  )
}
