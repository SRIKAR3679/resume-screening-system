import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { resumeAPI } from '../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ResumeUpload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [resumes, setResumes] = useState([])
  const [fetchingResumes, setFetchingResumes] = useState(true)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const res = await resumeAPI.getAll()
      setResumes(res.data)
    } catch (err) {
      console.error('Failed to fetch resumes', err)
    } finally {
      setFetchingResumes(false)
    }
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(selected.type)) {
        toast.error('Only PDF and DOCX files are supported')
        return
      }
      setFile(selected)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(dropped.type)) {
        toast.error('Only PDF and DOCX files are supported')
        return
      }
      setFile(dropped)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    setUploadProgress(10) // Mock progress

    // Simulate progress for UI
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90))
    }, 500)

    try {
      await resumeAPI.upload(formData)
      clearInterval(progressInterval)
      setUploadProgress(100)
      toast.success('Resume analyzed successfully!')
      navigate('/resume/analysis')
    } catch (err) {
      clearInterval(progressInterval)
      setUploadProgress(0)
      toast.error(err.response?.data?.detail || 'Failed to upload and analyze resume')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await resumeAPI.delete(id)
        toast.success('Resume deleted')
        fetchResumes()
      } catch (err) {
        toast.error('Failed to delete resume')
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Resume</h1>
        <p className="text-slate-500 mt-1">Upload your latest resume to get AI-powered analysis and matches.</p>
      </div>

      <div className="card">
        {!loading ? (
          <>
            <div 
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${file ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <DocumentIcon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{file.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                  >
                    <XMarkIcon className="w-4 h-4" /> Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center cursor-pointer">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                    <CloudArrowUpIcon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Click to upload or drag and drop</h3>
                  <p className="text-sm text-slate-500">PDF or DOCX up to 10MB</p>
                </div>
              )}
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept=".pdf,.docx" 
                onChange={handleFileChange}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                className="btn-primary px-8" 
                disabled={!file}
                onClick={handleUpload}
              >
                Analyze Resume
              </button>
            </div>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center">
            <LoadingSpinner message="AI is analyzing your resume..." />
            <div className="w-64 bg-slate-200 rounded-full h-2 mt-6 overflow-hidden">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-4">Previous Resumes</h3>
        {fetchingResumes ? (
          <div className="py-4"><LoadingSpinner message="" /></div>
        ) : resumes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Filename</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-center">Score</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resumes.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                      <DocumentIcon className="w-4 h-4 text-slate-400" />
                      {r.filename || 'resume.pdf'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge bg-indigo-50 text-indigo-700">{r.score || 85}</span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link to="/resume/analysis" className="text-indigo-600 hover:text-indigo-900 p-1 inline-block" title="View Analysis">
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(r.id)} className="text-rose-600 hover:text-rose-900 p-1" title="Delete">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-sm py-4 text-center">No previous resumes found.</p>
        )}
      </div>
    </div>
  )
}
