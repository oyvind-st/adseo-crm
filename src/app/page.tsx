'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, DollarSign, CheckSquare, Ticket, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [stats, setStats] = useState({ kunder: 0, mrr: 0, oppgaver: 0, tickets: 0 })
  const [oppgaver, setOppgaver] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ count: kunderCount }, { data: kunderMrr }, { count: oppgaverCount }, { count: ticketsCount }, { data: dagensOppgaver }] = await Promise.all([
        supabase.from('kunder').select('*', { count: 'exact', head: true }),
        supabase.from('kunder').select('mrr'),
        supabase.from('oppgaver').select('*', { count: 'exact', head: true }).neq('status', 'fullfort'),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'apent'),
        supabase.from('oppgaver').select('*, kunder(bedriftsnavn)').neq('status', 'fullfort').order('frist').limit(6)
      ])
      const totalMrr = kunderMrr?.reduce((sum: number, k: any) => sum + (k.mrr || 0), 0) || 0
      setStats({ kunder: kunderCount || 0, mrr: totalMrr, oppgaver: oppgaverCount || 0, tickets: ticketsCount || 0 })
      setOppgaver(dagensOppgaver || [])
      setLoading(false)
    }
    load()
  }, [])

  const formatKr = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M kr` : `${(n/1000).toFixed(0)}k kr`
  const isOverdue = (frist: string) => new Date(frist) < new Date()

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>Dashboard</h1>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Oversikt over dine oppgaver og kunder</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Aktive Kunder', value: stats.kunder, icon: <Users size={20} color="#7c3aed"/>, bg: '#ede9fe' },
          { label: 'Total MRR', value: formatKr(stats.mrr), icon: <DollarSign size={20} color="#16a34a"/>, bg: '#dcfce7' },
          { label: 'Åpne Oppgaver', value: stats.oppgaver, icon: <CheckSquare size={20} color="#2563eb"/>, bg: '#dbeafe' },
          { label: 'Åpne Tickets', value: stats.tickets, icon: <Ticket size={20} color="#ea580c"/>, bg: '#ffedd5' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1a2e' }}>{loading ? '–' : s.value}</div>
              </div>
              <div style={{ background: s.bg, padding: 10, borderRadius: 10 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Oppgaver</h2>
          <Link href="/oppgaver" style={{ fontSize: 13, color: '#7c3aed', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            Se alle <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? <div style={{ color: '#9ca3af', fontSize: 14, padding: '20px 0' }}>Laster...</div> :
          oppgaver.length === 0 ? <div style={{ color: '#9ca3af', fontSize: 14 }}>Ingen oppgaver 🎉</div> :
          oppgaver.map(o => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{o.tittel}</span>
                  {o.frist && isOverdue(o.frist) && <span className="badge badge-red" style={{ fontSize: 10 }}>Forfalt</span>}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', gap: 12 }}>
                  {o.kunder?.bedriftsnavn && <span>{o.kunder.bedriftsnavn}</span>}
                  {o.frist && <span>{new Date(o.frist).toLocaleDateString('no-NO', { day: 'numeric', month: 'short' })}</span>}
                </div>
              </div>
              <span className={`badge ${o.prioritet === 'høy' ? 'badge-red' : o.prioritet === 'medium' ? 'badge-yellow' : 'badge-gray'}`}>
                {o.prioritet}
              </span>
            </div>
          ))
        }
      </div>
    </div>
  )
}
