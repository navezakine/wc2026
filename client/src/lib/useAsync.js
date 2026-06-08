import { useEffect, useState } from 'react'

// Runs an async function and re-runs when `deps` change.
// On error, falls back to `fallback` (so the UI stays usable offline).
export function useAsync(fn, deps = [], { fallback = null } = {}) {
  const [data, setData] = useState(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    Promise.resolve()
      .then(fn)
      .then((d) => alive && setData(d))
      .catch((e) => {
        if (!alive) return
        setError(e)
        if (fallback != null) setData(fallback)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
