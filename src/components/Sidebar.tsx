'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CheckSquare, Ticket, Package, Users,
  TrendingUp, Settings, Zap
} from 'lucide-react'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/oppgaver', label: 'Oppgaver', icon: CheckSquare },
  { href: '/tickets', label: 'Tickets', icon: Ticket },
  { href: '/leveranser', label: 'Leveranser', icon: Package },
  { href: '/kunder', label: 'Kunder', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: TrendingUp },
  { href: '/innstillinger', label: 'Innstillinger', icon: Settings },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const avatarColors = ['#7c3aed', '#2563eb', '#16a34a', '#dc2626', '#ea580c']

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="sidebar">
      {/* Logo */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Adseo CRM</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Kundeoppfølging & Salg</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar" style={{ background: '#7c3aed', fontSize: 11 }}>ØA</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e' }}>Øyvind</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Partner</div>
          </div>
        </div>
      </div>
    </div>
  )
}
