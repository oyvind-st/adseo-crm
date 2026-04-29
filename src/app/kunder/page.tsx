'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Plus } from 'lucide-react'
import Link from 'next/link'

export default function KunderPage() {
  const [kunder, setKunder] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('kunder')
      .select('*, kontakter(id, navn, tittel, epost, er_primaer)')
      .order('bedriftsnavn')
      .then(({ data }) => { setKunder(data || []); setLoading(false) })
  }, [])

  const filtered = kunder.filter(k => k.bedriftsnavn.toLowerCase().includes(search.toLowerCase()))
  const scoreColor = (s: number) => s >= 80 ? '#16a34a' : s >= 60 ? '#d97706' : '#dc2626'
  const scoreBg = (s: number) => s >= 80 ? '#f0fdf4' : s >= 60 ? '#fffbeb' : '#fef2f2'

  return (
    <div style={{ padding: '28px 32px' }}>
      <div className="page-header">
        <div><h1 className="page-title">Kunder</h1><p className="page-subtitle">{kunder.length} aktive kunder</p></div>
        <button className="btn-primary"><Plus size={15}/> Ny kunde</button>
      </div>
      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5f5' }}>
          <div style={{ position: 'relative', maxWidth: 360 }}>
            <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Søk etter kunde..."
              style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fafafa' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1.5fr 100px 70px', padding: '10px 20px', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
          <span>Bedrift</span><span>Kontakt</span><span>Sted</span><span style={{textAlign:'right'}}>MRR</span><span style={{textAlign:'center'}}>Helse</span>
        </div>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Laster kunder...</div> :
          filtered.map((k, i) => {
            const primaer = k.kontakter?.find((c: any) => c.er_primaer) || k.kontakter?.[0]
            return (
              <Link key={k.id} href={`/kunder/${k.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 1.5fr 100px 70px', padding: '15px 20px', borderBottom: i < filtered.length-1 ? '1px solid #f5f5f5' : 'none', alignItems: 'center', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e=>(e.currentTarget.style.background='#fafafa')}
                onMouseLeave={e=>(e.currentTarget.style.background='white')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#7c3aed', flexShrink: 0 }}>{ko.bedriftsnavn.slice(0,2).toUpperCase()}</div>
                  <span style={{ fontWeight: 500, fontSize: 14, color: '#0f0f1a' }}>{k.bedriftsnavn}</span>
                </div>
                <div style={{ fontSize: 13, color: '#374151' }}>
                  {primaer ? (<div><div style={{fontWeight:500}}>{primaer.navn}</div><div style={{fontSize:11,color:'#9ca3af'}}>{primaer.tittel}</div></div>) : <span style={{color:'#d1d5db'}}>–</span>}
                </div>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{k.sted || '–'}</span>
                <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'right', color: '#0f0f1a' }}>{(k.mrr/1000).toFixed(0)}k kr</span>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2.5px solid ${scoreColor(k.helse_score)}`, background: scoreBg(k.helse_score), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: scoreColor(k.helse_score) }}>{k.helse_score}</div>
                </div>
              </Link>
            )
          })
        }
      </div>
    </div>
  )
}
