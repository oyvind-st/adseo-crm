'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, DollarSign, CheckSquare, Ticket, ArrowRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [stats, setStats] = useState({ kunder: 0, mrr: 0, oppgaver: 0, tickets: 0, pipeline: 0 })
  const [oppgaver, setOppgaver] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: kunderCount },
        { data: kunderMrr },
        { count: oppgaverCount },
        { count: ticketsCount },
        { data: leads },
        { data: dagensOppgaver }
      ] = await Promise.all([
        supabase.from('kunder').select('*', { count: 'exact', head: true }),
        supabase.from('kunder').select('mrr'),
        supabase.from('oppgaver').select('*', { count: 'exact', head: true }).neq('status', 'fullfort'),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'apent'),
        supabase.from('leads').select('verdi, sannsynlighet').neq('stage', 'tapt'),
        supabase.from('oppgaver').select('*, kunder(bedriftsnavn)').neq('status', 'fullfort').order('frist').limit(6)
      ])
      const totalMrr = kunderMrr?.reduce((s, k) => s + (k.mrr || 0), 0) || 0
      const totalPipeline = leads?.reduce((s, l) => s + (l.verdi || 0), 0) || 0
      setStats({ kunder: kunderCount || 0, mrr: totalMrr, oppgaver: oppgaverCount || 0, tickets: ticketsCount || 0, pipeline: totalPipeline })
      setOppgaver(dagensOppgaver || [])
      setLoading(false)
    }
    load()
  }, [])

  const formatKr = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M kr` : `${(n/1000).toFixed(0)}k kr`
  const isOverdue = (frist: string) => new Date(frist) < new Date()

  const statCards = [
    { label: 'Aktive Kunder', value: stats.kunder, icon: <Users size={18} color="#7c3aed"/>, iconBg: '#ede9fe', change: '+3 denne måneden' },
    { label: 'Total MRR', value: formatKr(stats.mrr), icon: <DollarSign size={18} color="#16a34a"/>, iconBg: '#dcfce7', change: null },
    { label: 'Pipeline', value: formatKr(stats.pipeline), icon: <TrendingUp size={18} color="#2563eb"/>, iconBg: '#dbeafe', change: null },
    { label: 'Åpne Tickets', value: stats.tickets, icon: <Ticket size={18} color="#ea580c"/>, iconBg: '#ffedd5', change: null },
  ]

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Oversikt over dine oppgaver og kunder</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#0f0f1a', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {loading ? <span style={{ color: '#e5e7eb' }}>–</span> : s.value}
                </div>
                {s.change && !loading && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>{s.change}</div>}
              </div>
              <div style={{ background: s.iconBg, padding: 10, borderRadius: 10, flexShrink: 0 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f5f5f5' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#0f0f1a' }}>Mine oppgaver</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{stats.oppgaver} åpne </div>
          </div>
          <Link href="/oppgaver" style={{ fontSize: 13, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontWeight: 500 }}>Se alle <ArrowRight size={14} /></Link>
        </div>
        {loading ? <div style={{ padding: 32, color: '#9ca3af', textAlign: 'center', fontSize: 14 }}>Laster...</div> :
          oppgaver.length === 0 ? <div style={{ padding: 32, color: '#9ca3af', textAlign: 'center', fontSize: 14 }}>Ingen åpne oppgaver 🎉</div> :
          oppgaver.map((o, i) => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: i < oppgaver.length-1 ? '1px solid #f5f5f5' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: o.prioritet === 'høy' ? '#ef4444' : o.prioritet === 'medium' ? '#f59e0b' : '#9ca3af', flexShrink: 0 }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#0f0f1a' }}>{o.tittel}</span>
                    {o.frist && isOverdue(o.frist) && <span className="badge badge-red" style={{ fontSize: 10 }}>Forfalt</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', gap: 8 }}>
                    {o.kunder?.bedriftsnavn && <span>{o.kunder.bedriftsnavn}</span>}
                    {o.frist && <span>Frist {new Date(o.frist).toLocaleDateString('no-NO', { day: 'numeric', month: 'short' })}</span>}
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
