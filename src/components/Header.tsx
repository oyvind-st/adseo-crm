'use client'
import { Search, Bell, Moon } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [query, setQuery] = useState('')

  return (
    <div style={{
      position: 'fixed', top: 0, left: 220, right: 0, height: 56,
      background: 'white', borderBottom: '1px solid #f0f0f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', zIndex: 30, boxShadow: '0 1px 0 #f0f0f0'
    }}>
      <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
        <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Søk kunder, kontakter, tickets..."
          style={{ width: '100%', padding: '8px 12px 8px 36px', background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', color: '#374151' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
          <Moon size={18} />
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#6b7280', display: 'flex', alignItems: 'center', position: 'relative' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
          <Bell size={18} />
          <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
        </button>
      </div>
    </div>
  )
}
