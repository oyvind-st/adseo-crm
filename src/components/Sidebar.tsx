'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, Ticket, Package, Users, TrendingUp, Settings, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/oppgaver', label: 'Oppgaver', icon: CheckSquare },
  { href: '/tickets', label: 'Tickets', icon: Ticket },
  { href: '/leveranser', label: 'Leveranser', icon: Package },
  { href: '/kunder', label: 'Kunder', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: TrendingUp, hasBadge: true },
  { href: '/innstillinger', label: 'Innstillinger', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [pipelineVerdi, setPipelineVerdi] = useState<number | null>(null)
  const [openTickets, setOpenTickets] = useState(0)

  useEffect(() => {
    supabase.from('leads').select('verdi').neq('stage', 'tapt').neq('stage', 'vunnet').then(({ data }) => {
      if (data) setPipelineVerdi(data.reduce((s, l) => s + (l.verdi || 0), 0))
    })
    supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'apent').then(({ count }) => {
      setOpenTickets(count || 0)
    })
  }, [])

  const formatKr = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M kr` : `${(n/1000).toFixed(0)}k kr`

  return (
    <div className="sidebar">
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}>
            <Zap size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.01em' }}>Adseo CRM</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>Kundeoppfølging & Salg</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
        {nav.map(({ href, label, icon: Icon, hasBadge }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          const badge = hasBadge && pipelineVerdi !== null ? formatKr(pipelineVerdi) : null
          const ticketCount = label === 'Tickets' && openTickets > 0 ? openTickets : null
          return (
            <Link key={href} href={href}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', margin: '1px 8px', borderRadius: 8, background: active ? '#ede9fe' : 'transparent', color: active ? '#7c3aed' : '#6b7280', fontWeight: active ? 500 : 400, fontSize: 13.5, transition: 'all 0.1s' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = active ? '#7c3aed' : '#374151' }}
              onMouseLeave={e => { e.currentTarget.style.background = active ? '#ede9fe' : 'transparent'; e.currentTarget.style.color = active ? '#7c3aed' : '#6b7280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Icon size={16} />
                <span>{label}</span>
              </div>
              {badge && <span style={{ fontSize: 11, color: active ? '#7c3aed' : '#9ca3af', fontWeight: 500 }}>{badge}</span>}
              {ticketCount && <span style={{ fontSize: 10, background: '#ef4444', color: 'white', borderRadius: 999, padding: '1px 6px', fontWeight: 600 }}>{ticketCount}</span>}
            </Link>
          )
        })}
      </nav>
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>ØA</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>Øyvind</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Partner</div>
          </div>
        </div>
      </div>
    </div>
  )
}
