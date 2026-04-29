'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Plus, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default function KunderPage() {
  const [kunder, setKunder] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('kunder').select('*').order('bedriftsnavn').then(({ data }) => {
      setKunder(data || [])
      setLoading(false)
    })
  }, [])

  const filtered = kunder.filter(k => k.bedriftsnavn.toLowerCase().includes(search.toLowerCase()))
  const scoreColor = (s: number) => s >= 80 ? '#16a34a' : s >= 60 ? '#ca8a04' : '#dc2626'

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>Kunder</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>{kunder.length} aktive kunder</p>
        </div>
        <button className="btn-primary"><Plus size={16}/> Ny kunde</button>
      </div>
      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Søk etter kunde..."
              style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 60px', padding: '10px 20px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f3f4f6' }}>
          <span>Bedrift</span><span>Kontakt</span><span>Kontaktinfo</span><span style={{textAlign:'right'}}>MRR</span><span style={{textAlign:'center'}}>Helse</span>
        </div>
        {loading ? <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>Laster kunder...</div> :
          filtered.map(k => (
            <Link key={k.id} href={`/kunder/${k.id}`} style={{ textDecoration: 'none', display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 60px', padding: '16px 20px', borderBottom: '1px solid #f3f4f6', alignItems: 'center', cursor: 'pointer', color: 'inherit' }}
              onMouseEnter={e=>(e.currentTarget.style.background='#fafafa')}
              onMouseLeave={e=>(e.currentTarget.style.background='white')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#7c3aed' }}>
                  {k.bedriftsnavn.slice(0,2).toUpperCase()}
                </div>
                <span style={{ fontWeight: 500, fontSize: 14 }}>{k.bedriftsnavn}</span>
              </div>
              <span style={{ fontSize: 13, color: '#374151' }}>–</span>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{k.sted || '–'}</span>
              <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'right' }}>{(k.mrr/1000).toFixed(0)}k kr</span>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${scoreColor(k.helse_score)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: scoreColor(k.helse_score) }}>
                  {k.helse_score}
                </div>
              </div>
            </Link>
          ))
        }
      </div>
    </div>
  )
}
