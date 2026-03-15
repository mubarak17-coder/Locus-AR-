import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const TrackersContext = createContext(null)

export function TrackersProvider({ children }) {
  const [trackers, setTrackers] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetchTrackers()

    const channel = supabase
      .channel('trackers-global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trackers' }, () => {
        fetchTrackers()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchTrackers() {
    const { data } = await supabase
      .from('trackers')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setTrackers(data)
    setLoading(false)
  }

  return (
    <TrackersContext.Provider value={{ trackers, loading }}>
      {children}
    </TrackersContext.Provider>
  )
}

export function useTrackers() {
  return useContext(TrackersContext)
}
