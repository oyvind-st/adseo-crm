'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Clock, AlertCircle, CheckCircle, ListTodo } from 'lucide-react'

const TABS = ['Alle', 'Ikke startet', 'Pågår', 'Fullført', 'Forfalt']

export default function OppgaverPage() {
  const [oppgaver, setOppgaver] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('Alle')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('oppgaver').select('*, kunder(bedriftsnavn)').order('frist').then(({ data }) => {
      setOppgaver(data || [])
      setLoading(false)
    })
  }, [])

  const now = new Date()
  const isOverdue = (o: any) => o.frist && new Date(o.frist) < now && o.status !== 'fullfort'

  const filtered = oppgaver.filter(o => {
    if (activeTab === 'Alle') return true
    if (activeTab === 'Forfalt') return isOverdue(o)
    if (activeTab === 'Ikke startet') return o.status === 'ikke_startet' && !isOverdue(o)
    if (activeTab === 'Pågår') return o.status === 'pagar'
    if (activeTab === 'Fullført') return o.status === 'fullfort'
    return true
  })

  const counts: Record<string, number> = {
    'Alle': oppgaver.length,
    'Ikke startet': oppgaver.filter(o => o.status === 'ikke_startet' && !isOverdue(o)).length,
    'Pågår': oppgaver.filter(o => o.status === 'pagar').length,
    'Fullført': oppgaver.filter(o => o.status === 'fullfort').length,
    'Forfalt': oppgaver.filter(isOverdue).length,
  }

  const toggleStatus = async (o: any) => {
    const newStatus = o.status === 'fullfort' ? 'ikke_startet' : 'fullfort'
    await supabase.from('oppgaver').update({ status: newStatus }).eq('id', o.id)
    setOppgaver(prev => prev.map(x => x.id === o.id ? { ...x, status: newStatus } : x))
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Oppgaver</h1>
          <p className="page-subtitle">{oppgaver.filter(o => o.status !== 'fullfort').length} åpne oppgaver</p>
        </div>
        <button className="btn-primary"><Plus size={15}/> Ny oppgave</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Mine oppgaver', value: oppgaver.filter(o=>o.status!=='fullfort').length, icon: <ListTodo size={18} color="#7c3aed"/>, bg: '#f5f3ff' },
          { label: 'Pågår',�alue: oppgaver.filter(o=>o.status==='pagar').length, icon: <Clock size={18} color="#2563eb"/>, bg: '#eff6ff' },
          { label: 'Forfalt', value: oppgaver.filter(isOverdue).length, icon: <AlertCircle size={18} color="#dc2626"/>, bg: '#fef2f2' },
          { label: 'Fullført', value: oppgaver.filter(o=>o.status==='fullfort').length, icon: <CheckCircle size={18} color="#16a34a"/>, bg: '#f0fdf4' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#0f0f1a', letterSpacing: '-0.02em' }}>{s.value}</div>
              </div>
              <div style={{ background: s.bg, padding: 10, borderRadius: 10 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tab-list" style={{ padding: '0 20px' }}>
          {TABS.map(t => (
            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t}
              {counts[t] > 0 && (
                <span style={{ marginLeft: 6, background: activeTab===t?'#ede9fe':'#f3f4f6', color: activeTab===t?'#7c3aed':'#9ca3af', borderRadius: 999, padding: '1px 6px', fontSize: 11 }}>{counts[t]}</span>
              )}
            </button>
          ))}
        </div>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Laster oppgaver...</div> :
          filtered.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Ingen oppgaver her</div> :
          filtered.map((o, i) => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < filtered.length-1 ? '1px solid #f5f5f5' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input type="checkbox" checked={o.status === 'fullfort'} onChange={() => toggleStatus(o)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#7c3aed', flexShrink: 0 }}/>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, textDecoration: o.status === 'fullfort' ? 'line-through' : 'none', color: o.status === 'fullfort' ? '#9ca3af' : '#0f0f1a' }}>{o.tittel}</span>
                    {isOverdue(o) && <span className="badge badge-red" style={{ fontSize: 10 }}>Forfalt</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', gap: 10 }}>
                    {o.kunder?.bedriftsnavn && <span>{o.kunder.bedriftsnavn}</span>}
                    {o.frist && <span>Frist {new Date(o.frist).toLocaleDateString('no-NO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                  </div>
                </div>
              </div>
              <span className={`badge ${o.prioritet === 'høy' ? 'badge-red' : o.prioritet === 'medium' ? 'badge-yellow' : 'badge-gray'}`}>{o.prioritet}</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}
