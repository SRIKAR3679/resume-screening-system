import React from 'react'
import { Link } from 'react-router-dom'

export default function EmptyState({ icon, title, description, actionLabel, onAction, actionLink }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200 border-dashed">
      <div className="text-5xl mb-4 opacity-80">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-md mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
      
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
