import React from 'react'

export default function SkillBadge({ skill, variant = 'default' }) {
  const styles = {
    default: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    blue: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-rose-50 text-rose-700 border-rose-100',
    gray: 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const classes = styles[variant] || styles.default

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${classes}`}>
      {skill}
    </span>
  )
}
