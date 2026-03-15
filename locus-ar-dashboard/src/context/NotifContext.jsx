import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const NotifContext = createContext(null)

export function NotifProvider({ children }) {
  const [notifs, setNotifs] = useState([])

  const unreadCount = notifs.filter(n => !n.read).length

  useEffect(() => {
    fetchNotifs()

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifs()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchNotifs() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setNotifs(data)
  }

  async function markRead(id) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  }

  async function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    await supabase.from('notifications').update({ read: true }).eq('read', false)
  }

  async function remove(id) {
    setNotifs(prev => prev.filter(n => n.id !== id))
    await supabase.from('notifications').delete().eq('id', id)
  }

  async function clearAll() {
    setNotifs([])
    await supabase.from('notifications').delete().neq('id', 0)
  }

  async function addNotif(notif) {
    const { data } = await supabase
      .from('notifications')
      .insert({ ...notif, read: false, time: 'Just now' })
      .select()
      .single()
    if (data) setNotifs(prev => [data, ...prev])
  }

  return (
    <NotifContext.Provider value={{ notifs, unreadCount, markRead, markAllRead, remove, clearAll, addNotif }}>
      {children}
    </NotifContext.Provider>
  )
}

export function useNotif() {
  return useContext(NotifContext)
}
