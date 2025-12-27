import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'

const API_BASE ='http://localhost:4000'

function useApi() {
  const client = useMemo(() => axios.create({ baseURL: API_BASE }), [])
  return client
}

const Icon = {
  Bell: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.857 17.082A23.848 23.848 0 0112 17.25c-1.01 0-2.006-.067-2.982-.197m5.839 0A23.856 23.856 0 0019.5 15m-2.643 2.082l.262.545A2.25 2.25 0 0115.057 21H8.943a2.25 2.25 0 01-2.062-3.373l.262-.545m0 0A23.85 23.85 0 014.5 15m0 0a6.75 6.75 0 0113.5 0M8.25 21a3.75 3.75 0 007.5 0"/>
    </svg>
  ),
  Home: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10.5L12 3l9 7.5V21a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 21v-10.5z"/>
    </svg>
  ),
  Music: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l10-2v13"/>
      <circle cx="7" cy="19" r="2"/>
      <circle cx="17" cy="17" r="2"/>
    </svg>
  ),
  Heart: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21s-7-4.35-9-8.25C1.5 9 3.75 6 7.5 6A5.6 5.6 0 0112 8a5.6 5.6 0 014.5-2c3.75 0 6 3 4.5 6.75C19 16.65 12 21 12 21z"/>
    </svg>
  ),
  User: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 3c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"/>
    </svg>
  ),
  Search: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="11" cy="11" r="7"/>
      <path d="M20 20l-3-3"/>
    </svg>
  )
}

function TopBar({ user }) {
  return (
    <div className="flex items-center justify-between px-5 pt-6">
      <div className="flex items-center gap-3">
        <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover"/>
        <div className="leading-tight">
          <p className="text-sm text-white/90 font-medium">{user.name}</p>
          <p className="text-[11px] text-violet-300">{user.membershipType} Member</p>
        </div>
        <div className="px-8 mt-1">
          <p className="text-xl font-semibold leading-tight">Listen The{` `}
        </p>
        </div>
      </div>
      <div className="p-2 rounded-full glass text-white/80 hover:text-white hover:shadow-glow transition">
        <Icon.Bell className="w-6 h-6"/>
      </div>
    </div>
  )
}

function SearchBar({ value, onChange, onSearch }) {
  return (
    <div className="px-5 mt-5">
      <div className="flex items-center gap-3 glass rounded-xl px-4 py-3 text-white/80">
        <Icon.Search className="w-5 h-5"/>
        <input value={value} onChange={e=>onChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSearch()} placeholder="Search Music" className="flex-1 bg-transparent outline-none placeholder:text-white/40"/>
      </div>
    </div>
  )
}

export default function App() {
  const api = useApi()
  const [recent, setRecent] = useState([])
  const [recommended, setRecommended] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (query) {
      const searchTimeout = setTimeout(() => {
        handleSearch();
      }, 300); // 300ms debounce
      return () => clearTimeout(searchTimeout);
    } else {

    }
  }, [query]);

  useEffect(() => {
    async function load() {
      const [r1, r2] = await Promise.all([
        api.get('/api/songs/recent'),
        api.get('/api/songs/recommended'),
      ])
      setRecent(r1.data)
      setRecommended(r2.data)
    }
    load().catch(console.error)
  }, [api])

  async function handleSearch() {
    if (!query) {

      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get(`/api/songs/search?q=${query}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error('Failed to search songs', error);
      setToast('Search failed');
      setTimeout(() => setToast(''), 2000);
    }
  }

  async function handlePlay(song) {
    setCurrentSong(song);
    try {
      await api.post(`/api/songs/${song._id}/play`);
      // Refresh recently played
      const res = await api.get('/api/songs/recent');
      setRecent(res.data);
    } catch (error) {
      console.error('Failed to update play count', error);
    }
  }

  async function handleOrder(song) {
    try {
      const res = await api.post('/api/songs/order', { userId: user._id, songId: song._id })
      if (res.status === 201) {
        setToast(`Queued: ${song.title}`)
        setQuery('');
        setIsSearching(false);
        setTimeout(() => setToast(''), 2000)
      }
    } catch (e) {
      setToast('Order failed')
      setTimeout(() => setToast(''), 2000)
    }
  }

  { /* Render the main app layout */ }
  return (
    <div className="pb-28">
      <TopBar user={user} />
      <div className="px-5 mt-4">
        {/* <p className="text-2xl font-semibold leading-tight">Listen The{` `}
          <span className="block">Latest Musics</span>
        </p> */}
      </div>
      <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} />
      
      {isSearching || query ? (
        <SearchResults songs={searchResults} onPlay={handlePlay} onOrder={handleOrder} />
      ) : (
        <>
          <RecentlyPlayed songs={recent} onPlay={handlePlay} />
          <RecommendedList songs={recommended} onOrder={handleOrder} onPlay={handlePlay} />
        </>
      )}

      <Player song={currentSong} />
      <BottomNav />

      {toast && (
        <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} className="fixed left-1/2 -translate-x-1/2 bottom-24 px-4 py-2 rounded-lg bg-[#6b5cff]/30 text-violet-200 backdrop-blur">
          {toast}
        </motion.div>
      )}
    </div>
  )
}


