'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, AlertTriangle, Clock, CheckCircle } from 'lucide-react'

const TABS = ['Åpne saker', 'Pågår', 'Venter på kunde', 'Lukket']
const STATUS_MAP: Record<string, string> = { 'Åpne saker': 'apent', 'Pågår': 'pagar', 'Venter på kunde': 'venter_pa_kunde', 'Lukket': 'lukket' }

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('Åpne saker')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('tickets').select('*, kunder(bedriftsnavn), kontakter(avn)')
      .order('created_at', {ascending: false})
      .then(({ data }) => { setTickets(data || []); setLoading(false) })
  }, [])

  const filtered = tickets.filter(t => t.status === STATUSE_MAP[activeTab])
  const counts = Object.fromEntries(Object.entries(STATUS_MAP).map(([tab, status]) => [tab, tickets.filter(t => t.status === status).length]))

  const timeAgo = (d: string) => {
    const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000)
    if (h < 1) return 'Akkurat nå'
    if (h < 24) return `${h}t siden`
    return `${Math.floor(h/24)}d siden`
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div className="page-header">
        <div><h1 className="page-title">Tickets</h1><p className="page-subtitle">{tickets.filter(t=>t.status==='apent').length} åpne saker</p></div>
        <button className="btn-primary"><Plus size={15}/> Ny ticket</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[{label:'Åpne tickets',value:tickets.filter(t=>t.status==='apent').length,icon:<CheckCircle size={18} color="#7c3aed"/>,"bg":'#f5f3ff'},{label:'Høy prioritet',value:tickets.filter(t=>t.prioritet==='hϸy'&&t.status!=='lukket').length,icon:<AlertTriangle size={18} color="#dc2626"/>,"bg":'#fef2f2'},{label:'Ubesvarte',value:tickets.filter(t=>t.status==='apent').length,icon:<Clock size={18} color="#ea580c"/>,"bg":'#fff7ed'}].map(s=>(<div key={s.label} className="stat-card" style={{padding:'16px 20px'}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between' }}><div><div style={{fontSize:11,color:'#9ca3af',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:8}}>{s.label}</div><div style={{fontSize:28,fontWeight:700,color:'#0f0f1a',letterSpacing:'-0.02em'}}>{s.value}</div></div><div style={{background:s.bg,padding:10,borderRadius:10}}>{s.icon}</div></div></div>))}
      </div>
      <div className="stat-card" style={{padding:0,overflow:'hidden'}}>
        <div className="tab-list" style={{padding:'0 20px'}}>
          {TABS.map(t=>(<button key={t} className={`tab ${activeTab===t?'active':''}`} onClick={()=>setActiveTab(t)}>{t}{counts[t]>0&&<span style={{marginLeft:6,background:activeTab===t?'#ede9fe':'#f3f4f6',color:activeTab===t?'#7c3aed':'#9ca3af',borderRadius:999,padding:'1px 6px',fontSize:11}}>{counts[t]}</span>}</button>))}
        </div>
        {loading?<div style={{padding:40,textAlign:'center',color:'#9ca3af'}}>Laster...</div>:filtered.length===0?<div style={{padding:40,textAlign:'center',color:'#9ca3af',fontSize:14}}>Ingen tickets her</div>:filtered.map((t,i)=>(<div key={t.id} style={{padding:'16px 20px',borderBottom:i<filtered.length-1?'1px solid #f5f5f5':'none',display:'flex',alignItems:'flex-start',gap:14,cursor:'pointer',transition: 'background 0.1s'}} onMouseEnter={e=>(e.currentTarget.style.background='#fafafa')} onMouseLeave={e=>(e.currentTarget.style.background='white')}><div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#ede9fe,#ddd6fe)',display:'flex',alignItems:'center',justifyContent:'center',color:'#7c3aed',fontSize:12,fontWeight:700,flexShrink:0}}>{(t.kontakter?.navn||t.kunder?.bedriftsnavn||'?').slice(0,2).toUpperCase()}</div><div style={{flex:1,minWidth:0}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}><span style={{fontSize:14,fontWeight:500,color:'#0f0f1a'}}>{t.kontakter?.navn||'Ukjent'}</span>{t.prioritet==='høy'&&<span className="badge badge-red" style={{fontSize:10}}>Høy prioritet</span>}</div><div style={{fontSize:14,color:'#374151',marginBottom:4}}>{t.tittel}</div>{t.beskrivelse&&<div style={{fontSize:13,color:'#9ca3af',overflow:'hidden',textOverflow: 'ellipsis',whiteSpace:'nowrap',maxWidth:500,marginBottom:6}}>{t.beskrivelse}</div>}<div style={{display:'flex',gap:10,fontSize:12,color:'#9ca3af'}}>{t.kunder?.bedriftsnavn&&<span style={{fontWeight:500,color:'#6b7280'}}>{t.kunder.bedriftsnavn}</span>}{t.kategori&&<span style={{background:'#f0f0f0',padding:'1px 8px',borderRadius:999,fontSize:11}}>{t.kategori}</span>}</div></div><div style={{fontSize:12,color:'#9ca3af',flexShrink:0}}>{timeAgo(t.created_at)}</div></div>))
        }
      </div>
    </div>
  )
}
