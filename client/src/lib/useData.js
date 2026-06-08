import { useEffect, useState } from 'react'

// Generic data hook: tries the loader (usually an API call) and falls back
// to demo data if the backend isn't running yet. Keeps the UI usable offline.
export function useData(loader, fallback) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usingDemo, setUsingDemo] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    Promise.resolve()
      .then(loader)
      .then((res) => {
        if (alive) {
          setData(res)
          setUsingDemo(false)
        }
      })
      .catch(() => {
        if (alive) {
          setData(fallback)
          setUsingDemo(true)
        }
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, loading, usingDemo }
}
