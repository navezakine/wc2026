import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export function usePush(memberId) {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  )
  const [subscribed, setSubscribed] = useState(false)

  // Check if already subscribed on mount
  useEffect(() => {
    if (!memberId || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => setSubscribed(!!sub)),
    )
  }, [memberId])

  async function subscribe() {
    if (!memberId || !VAPID_PUBLIC_KEY || !('serviceWorker' in navigator)) return
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      const { endpoint, keys } = sub.toJSON()
      await api.subscribePush({ memberId, endpoint, p256dh: keys.p256dh, auth: keys.auth })
      setSubscribed(true)
      setPermission('granted')
    } catch {
      setPermission(Notification.permission)
    }
  }

  async function unsubscribe() {
    if (!('serviceWorker' in navigator)) return
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await api.unsubscribePush({ endpoint: sub.endpoint })
      await sub.unsubscribe()
    }
    setSubscribed(false)
  }

  const supported =
    typeof Notification !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    !!VAPID_PUBLIC_KEY

  return { supported, permission, subscribed, subscribe, unsubscribe }
}
