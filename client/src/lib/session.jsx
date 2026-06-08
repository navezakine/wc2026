import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api.js'
import { demoGroups, demoMembers } from '../data/demo.js'

// Holds the active group + "who am I" member, persisted to localStorage.
// Falls back to demo group/members if the API is unreachable.
const SessionContext = createContext(null)
export const useSession = () => useContext(SessionContext)

export function SessionProvider({ children }) {
  const [groups, setGroups] = useState([])
  const [members, setMembers] = useState([])
  const [groupId, setGroupId] = useState(() => localStorage.getItem('wc_group') || null)
  const [memberId, setMemberId] = useState(() => localStorage.getItem('wc_member') || null)
  const [loading, setLoading] = useState(true)
  const [usingDemo, setUsingDemo] = useState(false)

  // Load groups once
  useEffect(() => {
    let alive = true
    api
      .getGroups()
      .then((gs) => {
        if (!alive) return
        const list = gs?.length ? gs : demoGroups
        setUsingDemo(!gs?.length)
        setGroups(list)
        setGroupId((prev) => (list.find((g) => g.id === prev) ? prev : list[0]?.id) || null)
      })
      .catch(() => {
        if (!alive) return
        setUsingDemo(true)
        setGroups(demoGroups)
        setGroupId(demoGroups[0].id)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  // Load members whenever the active group changes
  useEffect(() => {
    if (!groupId) return
    localStorage.setItem('wc_group', groupId)
    let alive = true
    const loader = usingDemo ? Promise.resolve(demoMembers) : api.getMembers(groupId)
    Promise.resolve(loader)
      .then((ms) => {
        if (!alive) return
        const list = ms?.length ? ms : demoMembers
        setMembers(list)
        setMemberId((prev) => (list.find((m) => m.id === prev) ? prev : list[0]?.id) || null)
      })
      .catch(() => {
        if (!alive) return
        setMembers(demoMembers)
        setMemberId(demoMembers[0].id)
      })
    return () => {
      alive = false
    }
  }, [groupId, usingDemo])

  useEffect(() => {
    if (memberId) localStorage.setItem('wc_member', memberId)
  }, [memberId])

  const value = {
    groups,
    members,
    loading,
    usingDemo,
    groupId,
    memberId,
    currentGroup: groups.find((g) => g.id === groupId) || null,
    currentMember: members.find((m) => m.id === memberId) || null,
    setGroupId,
    setMemberId,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
