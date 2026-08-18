import React, { useState, useEffect } from 'react'
import { jobsAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Dialog } from '@headlessui/react'
import toast from 'react-hot-toast'

export default function JobManagement() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [search, setSearch] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', description: '', 
    experience_required: '', education_required: '', 
    salary_range: '', job_type: 'Full-time', skills: ''
  })

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const res = await jobsAPI.getAll({ limit: 100 })
      setJobs(res.data.items || res.data || [])
    } catch (err) {
      toast.error('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const openModal = (job = null) => {
    if (job) {
      setEditingJob(job)
      setFormData({
        ...job,
        skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || ''
      })
    } else {
      setEditingJob(null)
      setFormData({
        title: '', company: '', location: '', description: '', 
        experience_required: '', education_required: '', 
        salary_range: '', job_type: 'Full-time', skills: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Convert skills string to array/string format expected by backend
    const payload = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    }
    
    try {
      if (editingJob) {
        await jobsAPI.update(editingJob.id, payload)
        toast.success('Job updated successfully')
      } else {
        await jobsAPI.create(payload)
        toast.success('Job created successfully')
      }
      setIsModalOpen(false)
      fetchJobs()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'An error occurred')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobsAPI.delete(id)
        toast.success('Job deleted')
        setJobs(jobs.filter(j => j.id !== id))
      } catch (err) {
        toast.error('Failed to delete job')
      }
    }
  }

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) || 
    j.company.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Management</h1>
          <p className="text-slate-500 mt-1">Add, edit, or remove job postings.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Add New Job
        </button>
      </div>

      <div className="card p-0 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <input 
            type="text" 
            placeholder="Search jobs..." 
            className="input max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {loading ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-white border-b border-slate-100 uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Title & Company</th>
                  <th className="px-6 py-3 font-medium">Location</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Skills</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.length > 0 ? filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{job.title}</p>
                      <p className="text-xs text-slate-500">{job.company}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{job.location}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="badge bg-slate-100 text-slate-700">{job.job_type || 'Full-time'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge bg-indigo-50 text-indigo-700">
                        {Array.isArray(job.skills) ? job.skills.length : (job.skills ? job.skills.split(',').length : 0)} skills
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openModal(job)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="Edit">
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(job.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded" title="Delete">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No jobs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <Dialog.Title className="text-lg font-bold text-slate-900">
                {editingJob ? 'Edit Job' : 'Create New Job'}
              </Dialog.Title>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="jobForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Job Title *</label>
                    <input required type="text" className="input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Company *</label>
                    <input required type="text" className="input" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Location *</label>
                    <input required type="text" className="input" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Job Type</label>
                    <select className="input" value={formData.job_type} onChange={e => setFormData({...formData, job_type: e.target.value})}>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Remote</option>
                      <option>Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Experience Required</label>
                    <input type="text" className="input" placeholder="e.g. 3-5 years" value={formData.experience_required} onChange={e => setFormData({...formData, experience_required: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Salary Range</label>
                    <input type="text" className="input" placeholder="e.g. $80k - $120k" value={formData.salary_range} onChange={e => setFormData({...formData, salary_range: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="label">Skills Required (comma separated) *</label>
                  <input required type="text" className="input" placeholder="React, Node.js, Python" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} />
                </div>

                <div>
                  <label className="label">Description *</label>
                  <textarea required className="input min-h-[150px]" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" form="jobForm" className="btn-primary">
                {editingJob ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}
