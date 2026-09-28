import React from 'react';

export default function HealthGauge({ score = 86, size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine stroke color based on score
  let strokeColor = '#22c55e'; // Green
  if (score < 60) strokeColor = '#ef4444'; // Red
  else if (score < 80) strokeColor = '#f59e0b'; // Amber

  return (
    <div className="relative inline-flex items-center justify-center select-none">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Centered Score Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold text-white tracking-tight leading-none">{score}</span>
        <span className="text-[11px] text-slate-400 font-semibold mt-0.5">/100</span>
      </div>
    </div>
  );
}
