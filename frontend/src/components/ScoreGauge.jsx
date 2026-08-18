import React from 'react'

export default function ScoreGauge({ score, size = 150, label }) {
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * Math.PI
  const offset = circumference - (score / 100) * circumference

  const getColor = (s) => {
    if (s >= 71) return '#10B981' // emerald-500
    if (s >= 41) return '#F59E0B' // amber-500
    return '#EF4444' // rose-500
  }

  return (
    <div className="flex flex-col items-center justify-center" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size / 2 + 10 }}>
        <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
          {/* Background Arc */}
          <path
            d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
            fill="none"
            stroke="#E2E8F0" // slate-200
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Foreground Arc */}
          <path
            d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
            fill="none"
            stroke={getColor(score)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-4xl font-bold text-slate-800" style={{ color: getColor(score) }}>
            {Math.round(score)}
          </span>
          <span className="text-sm font-medium text-slate-500 -mt-1">%</span>
        </div>
      </div>
      {label && <span className="mt-2 text-sm font-medium text-slate-600">{label}</span>}
    </div>
  )
}
