import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api.js'

const SessionContext = createContext(null)
export const useSession = () => useContext(SessionContext)

function readStorage() {
  const memberId = localStorage.getItem('wc_member') || sessionStorage.getItem('wc_member')
  const groupId = localStorage.getItem('wc_group') || sessionStorage.getItem('wc_group')
  return { memberId, groupId }
}

function clearStorage() {
  ;['wc_member', 'wc_group'].forEach((k) => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  })
}

export function SessionProvider({ children }) {
  const saved = readStorage()
  const [groups, setGroups] = useState([])
  const [members, setMembers] = useState([])
  const [groupId, setGroupId] = useState(saved.groupId)
  const [memberId, setMemberId] = useState(saved.memberId)
  const [loading, setLoading] = useState(!!saved.memberId)

  // Load groups whenever memberId is set (covers both initial load and after login)
  useEffect(() => {
    if (!memberId) {
      setLoading(false)
      return
    }
    setLoading(true)
    let alive = true
    api
      .getGroups()
      .then((gs) => {
        if (!alive) return
        setGroups(gs || [])
        setGroupId((prev) => (gs?.find((g) => g.id === prev) ? prev : gs?.[0]?.id) || null)
      })
      .catch(() => alive && setGroups([]))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [memberId])

  // Load members whenever group changes
  useEffect(() => {
    if (!groupId) return
    let alive = true
    api
      .getMembers(groupId)
      .then((ms) => alive && setMembers(ms || []))
      .catch(() => alive && setMembers([]))
    return () => {
      alive = false
    }
  }, [groupId])

  const login = (memberData, remember = true) => {
    const storage = remember ? localStorage : sessionStorage
    storage.setItem('wc_member', memberData.id)
    storage.setItem('wc_group', memberData.group_id)
    setMemberId(memberData.id)
    setGroupId(memberData.group_id)
  }

  const logout = () => {
    clearStorage()
    setMemberId(null)
    setGroupId(null)
    setGroups([])
    setMembers([])
    setLoading(false)
  }

  const value = {
    groups,
    members,
    loading,
    usingDemo: false,
    groupId,
    memberId,
    isLoggedIn: !!memberId,
    currentGroup: groups.find((g) => g.id === groupId) || null,
    currentMember: members.find((m) => m.id === memberId) || null,
    setGroupId,
    setMemberId,
    login,
    logout,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
