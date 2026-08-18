import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

export function useApi(apiFunc) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunc(...args)
      setData(result.data)
      return result.data
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'An error occurred'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFunc])

  return { data, loading, error, execute }
}
