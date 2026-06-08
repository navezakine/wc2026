import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api.js'

const SessionContext = createContext(null)
export const useSession = () => useContext(SessionContext)

function readStorage() {
  const memberId = localStorage.getItem('wc_member') || sessionStorage.getItem('wc_member')
  const groupId = localStorage.getItem('wc_group') || sessionStorage.getItem('wc_group')
  const raw = localStorage.getItem('wc_memberships') || sessionStorage.getItem('wc_memberships')
  let memberships = []
  try { memberships = raw ? JSON.parse(raw) : [] } catch {}
  // Backward-compat: synthesize from old keys for existing single-group users
  if (!memberships.length && memberId && groupId) {
    memberships = [{ memberId, groupId }]
  }
  return { memberId, groupId, memberships }
}

function clearStorage() {
  ;['wc_member', 'wc_group', 'wc_memberships'].forEach((k) => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  })
}

// Detect which store holds the active session; falls back to preference
function detectStore(remember = true) {
  if (localStorage.getItem('wc_member')) return localStorage
  if (sessionStorage.getItem('wc_member')) return sessionStorage
  return remember ? localStorage : sessionStorage
}

export function SessionProvider({ children }) {
  const saved = readStorage()
  const [groups, setGroups] = useState([])
  const [members, setMembers] = useState([])
  const [groupId, setGroupId] = useState(saved.groupId)
  const [memberId, setMemberId] = useState(saved.memberId)
  const [memberships, setMemberships] = useState(saved.memberships)
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
    return () => { alive = false }
  }, [memberId])

  // Load members whenever group changes
  useEffect(() => {
    if (!groupId) return
    let alive = true
    api
      .getMembers(groupId)
      .then((ms) => alive && setMembers(ms || []))
      .catch(() => alive && setMembers([]))
    return () => { alive = false }
  }, [groupId])

  // Keep legacy single-account login (used by pages that haven't been updated yet)
  const login = (memberData, remember = true) => {
    const storage = detectStore(remember)
    const updated = [
      ...memberships.filter((m) => m.memberId !== memberData.id),
      { memberId: memberData.id, groupId: memberData.group_id },
    ]
    storage.setItem('wc_memberships', JSON.stringify(updated))
    storage.setItem('wc_member', memberData.id)
    storage.setItem('wc_group', memberData.group_id)
    setMemberships(updated)
    setMemberId(memberData.id)
    setGroupId(memberData.group_id)
  }

  // Store ALL accounts returned by the login endpoint; set selected as active
  const loginAll = (accounts, selected, remember = true) => {
    const storage = remember ? localStorage : sessionStorage
    const incoming = accounts.map((a) => ({ memberId: a.id, groupId: a.group_id }))
    const existing = memberships.filter((m) => !incoming.find((n) => n.memberId === m.memberId))
    const merged = [...existing, ...incoming]
    storage.setItem('wc_memberships', JSON.stringify(merged))
    storage.setItem('wc_member', selected.id)
    storage.setItem('wc_group', selected.group_id)
    setMemberships(merged)
    setMemberId(selected.id)
    setGroupId(selected.group_id)
  }

  // Append a new membership (e.g. after joining a second group) and make it active
  const addMembership = ({ memberId: newMemberId, groupId: newGroupId }, remember = true) => {
    const store = detectStore(remember)
    const updated = [
      ...memberships.filter((m) => m.memberId !== newMemberId),
      { memberId: newMemberId, groupId: newGroupId },
    ]
    store.setItem('wc_memberships', JSON.stringify(updated))
    store.setItem('wc_member', newMemberId)
    store.setItem('wc_group', newGroupId)
    setMemberships(updated)
    setMemberId(newMemberId)
    setGroupId(newGroupId)
  }

  // Switch the active group without touching the memberships list
  const switchMembership = (targetMemberId) => {
    const entry = memberships.find((m) => m.memberId === targetMemberId)
    if (!entry) return
    const store = detectStore()
    store.setItem('wc_member', entry.memberId)
    store.setItem('wc_group', entry.groupId)
    setMemberId(entry.memberId)
    setGroupId(entry.groupId)
  }

  const logout = () => {
    clearStorage()
    setMemberId(null)
    setGroupId(null)
    setGroups([])
    setMembers([])
    setMemberships([])
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
    allMemberships: memberships.map((m) => ({
      ...m,
      groupName: groups.find((g) => g.id === m.groupId)?.name || '',
      isActive: m.memberId === memberId,
    })),
    setGroupId,
    setMemberId,
    login,
    loginAll,
    addMembership,
    switchMembership,
    logout,
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
