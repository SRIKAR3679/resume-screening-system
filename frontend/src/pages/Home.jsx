import React from 'react'
import { Link } from 'react-router-dom'
import { SparklesIcon, DocumentTextIcon, ChartBarIcon, BriefcaseIcon, BoltIcon, StarIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">ResumeAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium">Log in</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block xl:inline">AI-Powered Resume Screening &</span>{' '}
                <span className="block text-indigo-600 xl:inline">Career Matching</span>
              </h1>
              <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Upload your resume, get instant skill analysis, match with perfect jobs, and receive personalized career recommendations powered by AI.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex gap-4">
                <Link to="/register" className="btn-primary px-8 py-3 text-lg">Get Started Free</Link>
                <Link to="/login" className="btn-secondary px-8 py-3 text-lg">View Demo</Link>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-2xl shadow-xl lg:max-w-md overflow-hidden bg-white border border-slate-200">
                <div className="p-8">
                  <div className="w-1/3 h-4 bg-slate-200 rounded mb-4" />
                  <div className="w-full h-2 bg-slate-100 rounded mb-2" />
                  <div className="w-5/6 h-2 bg-slate-100 rounded mb-8" />
                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">React</span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">Node.js</span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">Python</span>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 font-bold">95%</span>
                      </div>
                      <span className="text-sm font-medium text-slate-500">Match Score</span>
                    </div>
                    <div className="w-24 h-8 bg-indigo-600 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-indigo-500">
            <div>
              <p className="text-3xl font-extrabold">10k+</p>
              <p className="mt-1 font-medium text-indigo-100">Jobs Posted</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">500+</p>
              <p className="mt-1 font-medium text-indigo-100">Skills Tracked</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">AI</p>
              <p className="mt-1 font-medium text-indigo-100">Powered Matching</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold">&lt; 1s</p>
              <p className="mt-1 font-medium text-indigo-100">Real-time Analysis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to land your dream job
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Smart Resume Parsing', icon: DocumentTextIcon, desc: 'Instantly extract text, skills, education, and experience from your PDF or DOCX.' },
              { title: 'AI Skill Extraction', icon: BoltIcon, desc: 'Natural language processing identifies your core competencies and domain expertise.' },
              { title: 'Job Matching Score', icon: ChartBarIcon, desc: 'Get a precise 0-100 score indicating how well your profile fits a specific job.' },
              { title: 'Missing Skills Gap', icon: SparklesIcon, desc: 'Identify exactly which required skills are missing from your resume to improve chances.' },
              { title: 'Job Recommendations', icon: StarIcon, desc: 'Receive tailored job suggestions based on your unique skill profile.' },
              { title: 'Career Insights', icon: BriefcaseIcon, desc: 'Track your applications and visualize your strengths in the interactive dashboard.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-100 z-0" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white border-4 border-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600 mb-6 shadow-sm">1</div>
              <h3 className="text-xl font-bold mb-2">Upload Resume</h3>
              <p className="text-slate-500">Securely upload your resume in PDF or DOCX format.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white border-4 border-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-indigo-600 mb-6 shadow-sm">2</div>
              <h3 className="text-xl font-bold mb-2">AI Analyzes</h3>
              <p className="text-slate-500">Our engine extracts skills and builds your profile in seconds.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-indigo-600 border-4 border-indigo-200 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-6 shadow-md">3</div>
              <h3 className="text-xl font-bold mb-2">Get Matched</h3>
              <p className="text-slate-500">Discover jobs that fit your exact skillset and apply instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <SparklesIcon className="w-6 h-6 text-indigo-400" />
            <span className="text-xl font-bold text-white">ResumeAI</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
