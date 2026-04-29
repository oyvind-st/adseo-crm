'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Globe, MapPin, Plus } from 'lucide-react'

const TABS = ['Oversikt', 'Tickets', 'Tjenester', 'Aktivitet']

export default function KundeDetailPage() {
  const { id } = useParams()
  const [kunde, setKunde] = useState<any>(null)
  const [kontakter, setKontakter] = useState<any[]>([])
  const [tjenester, setTjenester] = useState<any[]>([])
  const [oppgaver, setOppgaver] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [aktivitet, setAktivitet] = useState<any[]>([])
  const [leveranser, setLeveranser] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('Oversikt')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('kunder').select('*').eq('id', id).single(),
      supabase.from('kontakter').select('*').eq('kunde_id', id),
      supabase.from('tjenester').select('*').eq('kunde_id', id),
      supabase.from('oppgaver').select('*').eq('kunde_id', id).neq('status','fullfort').order('frist'),
      supabase.from('tickets').select('*').eq('kunde_id', id).neq('status','lukket').order('created_at',{ascending:false}),
      supabase.from('aktivitetslogg').select('*').eq('kunde_id', id).order('created_at',{ascending:false}),
      supabase.from('leveranser').select('*, leveranse_oppgaver(id,fullfort)').eq('kunde_id', id).neq('status','ferdig'),
    ]).then(([{data:k},{data:kon},{data:tj},{data:opp},{data:ti},{data:akt},{data:lev}]) => {
      setKunde(k); setKontakter(kon||[]); setTjenester(tj||[]); setOppgaver(opp||[])
      setTickets(ti||[]); setAktivitet(akt||[]); setLeveranser(lev||[])
      setLoading(false)
    })
  }, [id])

  if (loading) return <div style={{ padding:32, color:'#9ca3af' }}>Laster...</div>
  if (!kunde) return <div style={{ padding:32 }}>Kunde ikke funnet</div>

  const scoreColor = (s: number) => s >= 80 ? '#16a34a' : s >= 60 ? '#ca8a04' : '#dc2626'
  const getProgress = (l: any) => {
    const t = l.leveranse_oppgaver || []
    return t.length ? Math.round(t.filter((x:any)=>x.fullfort).length/t.length*100) : 0
  }

  return (
    <div style={{ padding: 32 }}>
      <Link href="/kunder" style={{ display:'flex',alignItems:'center',gap:6,color:'#6b7280',textDecoration:'none',fontSize:14,marginBottom:20 }}>
        <ArrowLeft size={14}/> Tilbake til kunder
      </Link>

      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24 }}>
        <div style={{ display:'flex',alignItems:'center',gap:16 }}>
          <div style={{ width:56,height:56,borderRadius:12,background:'#ede9fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:'#7c3aed' }}>
            {kunde.bedriftsnavn.slice(0,2).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize:22,fontWeight:700,color:'#1a1a2e' }}>{kunde.bedriftsnavn}</h1>
            <div style={{ fontSize:13,color:'#9ca3af',display:'flex',gap:16,marginTop:4 }}>
              {kunde.nettside && <span style={{display:'flex',alignItems:'center',gap:4}}><Globe size={12}/>{kunde.nettside}</span>}
              {kunde.sted && <span style={{display:'flex',alignItems:'center',gap:4}}><MapPin size={12}/>{kunde.sted}</span>}
              {kunde.kunde_siden && <span>Kunde siden {new Date(kunde.kunde_siden).toLocaleDateString('no-NO',{month:'long',year:'numeric'})}</span>}
            </div>
          </div>
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ width:48,height:48,borderRadius:'50%',border:`3px solid ${scoreColor(kunde.helse_score)}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:scoreColor(kunde.helse_score) }}>
            {kunde.helse_score}
          </div>
          <button className="btn-secondary">Rediger</button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24 }}>
        {[
          {label:'MRR',value:`${(kunde.mrr/1000).toFixed(0)}k kr`},
          {label:'Åpne oppgaver',value:oppgaver.length},
          {label:'Åpne tickets',value:tickets.length},
          {label:'Tjenester',value:tjenester.length},
        ].map(s=>(
          <div key={s.label} className="stat-card" style={{padding:'16px 20px'}}>
            <div style={{fontSize:12,color:'#6b7280'}}>{s.label}</div>
            <div style={{fontSize:24,fontWeight:700,marginTop:4}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 280px',gap:24 }}>
        <div>
          <div className="stat-card" style={{padding:0,overflow:'hidden'}}>
            <div className="tab-list" style={{padding:'0 20px'}}>
              {TABS.map(t=><button key={t} className={`tab ${activeTab===t?'active':''}`} onClick={()=>setActiveTab(t)}>{t}</button>)}
            </div>

            {activeTab==='Oversikt' && (
              <div style={{padding:20}}>
                {/* Leveranser */}
                {leveranser.length > 0 && (
                  <div style={{marginBottom:24}}>
                    <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>Aktive leveranser</div>
                    {leveranser.map(l=>(
                      <div key={l.id} style={{background:'#f9fafb',borderRadius:10,padding:14,marginBottom:10}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                          <div>
                            <span style={{fontWeight:500,fontSize:14}}>{l.tittel}</span>
                            {l.type && <span style={{marginLeft:8,fontSize:12,color:'#9ca3af'}}>{l.type}</span>}
                          </div>
                          <span className={`badge ${l.status==='pagar'?'badge-blue':l.status==='ferdig'?'badge-green':'badge-gray'}`}>
                            {l.status==='pagar'?'Pågår':l.status==='ferdig'?'Ferdig':l.status==='ikke_startet'?'Ikke startet':'Venter'}
                          </span>
                        </div>
                        <div style={{fontSize:12,color:'#9ca3af',marginBottom:8}}>
                          {l.frist && `Frist: ${new Date(l.frist).toLocaleDateString('no-NO',{day:'numeric',month:'long',year:'numeric'})}`}
                          {l.leveranse_oppgaver?.length > 0 && ` · ${l.leveranse_oppgaver.filter((x:any)=>x.fullfort).length} av ${l.leveranse_oppgaver.length} oppgaver`}
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{width:`${getProgress(l)}%`}}/></div>
                        <div style={{fontSize:11,color:'#9ca3af',textAlign:'right',marginTop:2}}>{getProgress(l)}%</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Oppgaver */}
                <div style={{marginBottom:24}}>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>Oppgaver ({oppgaver.length} åpne)</div>
                  {oppgaver.length===0 ? <div style={{color:'#9ca3af',fontSize:13}}>Ingen åpne oppgaver</div> :
                    oppgaver.map(o=>(
                      <div key={o.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:500}}>{o.tittel}</div>
                          {o.frist && <div style={{fontSize:12,color:'#9ca3af'}}>Frist: {new Date(o.frist).toLocaleDateString('no-NO',{day:'numeric',month:'short'})}</div>}
                        </div>
                        <span className={`badge ${o.prioritet==='høy'?'badge-red':o.prioritet==='medium'?'badge-yellow':'badge-gray'}`}>{o.prioritet}</span>
                      </div>
                    ))
                  }
                </div>

                {/* Hurtiglogg */}
                <div style={{background:'#f0f9ff',borderRadius:10,padding:14}}>
                  <div style={{fontSize:13,fontWeight:600,color:'#2563eb',marginBottom:8}}>Hurtiglogg</div>
                  <div style={{fontSize:13,color:'#6b7280'}}>Loggfør kundekontakt raskt</div>
                  <button className="btn-primary" style={{marginTop:10,fontSize:12,padding:'6px 12px'}}><Plus size={12}/> Legg til aktivitet</button>
                </div>
              </div>
            )}

            {activeTab==='Tickets' && (
              <div>
                {tickets.length===0 ? <div style={{padding:32,textAlign:'center',color:'#9ca3af'}}>Ingen åpne tickets</div> :
                  tickets.map(t=>(
                    <div key={t.id} style={{padding:'14px 20px',borderBottom:'1px solid #f3f4f6'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                        <div>
                          <div style={{fontWeight:500,fontSize:14,marginBottom:4}}>{t.tittel}</div>
                          {t.beskrivelse && <div style={{fontSize:13,color:'#9ca3af'}}>{t.beskrivelse}</div>}
                        </div>
                        <span className={`badge ${t.prioritet==='høy'?'badge-red':'badge-gray'}`}>{t.prioritet}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {activeTab==='Tjenester' && (
              <div style={{padding:20}}>
                {tjenester.map(t=>(
                  <div key={t.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #f3f4f6'}}>
                    <div>
                      <div style={{fontWeight:500,fontSize:14}}>{t.navn}</div>
                      <div style={{fontSize:12,color:'#9ca3af'}}>{(t.pris_per_mnd/1000).toFixed(0)}k kr/mnd</div>
                    </div>
                    <span className={`badge ${t.status==='active'?'badge-green':t.status==='onboarding'?'badge-yellow':'badge-gray'}`}>
                      {t.status==='active'?'Aktiv':t.status==='onboarding'?'Onboarding':'Pausert'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab==='Aktivitet' && (
              <div style={{padding:20}}>
                {aktivitet.length===0 ? <div style={{color:'#9ca3af',fontSize:13}}>Ingen aktivitet registrert</div> :
                  aktivitet.map(a=>(
                    <div key={a.id} style={{display:'flex',gap:12,marginBottom:16}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:'#ede9fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>
                        {a.type==='mote'?'📅':a.type==='epost'?'📧':'📝'}
                      </div>
                      <div>
                        <div style={{fontWeight:500,fontSize:13}}>{a.tittel}</div>
                        {a.beskrivelse && <div style={{fontSize:12,color:'#9ca3af',marginTop:2}}>{a.beskrivelse}</div>}
                        <div style={{fontSize:11,color:'#d1d5db',marginTop:4}}>{new Date(a.created_at).toLocaleDateString('no-NO',{day:'numeric',month:'short',year:'numeric'})}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {/* Kontakter */}
          <div className="stat-card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:600}}>Kontaktpersoner</div>
              <button style={{background:'none',border:'none',cursor:'pointer',color:'#7c3aed'}}><Plus size={16}/></button>
            </div>
            {kontakter.map(k=>(
              <div key={k.id} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{fontWeight:500,fontSize:13}}>{k.navn}</div>
                  {k.er_primaer && <span className="badge badge-purple" style={{fontSize:10}}>Primær</span>}
                </div>
                <div style={{fontSize:12,color:'#9ca3af'}}>{k.tittel}</div>
                {k.epost && <div style={{fontSize:12,color:'#2563eb',display:'flex',alignItems:'center',gap:4,marginTop:4}}><Mail size={11}/>{k.epost}</div>}
                {k.telefon && <div style={{fontSize:12,color:'#6b7280',display:'flex',alignItems:'center',gap:4}}><Phone size={11}/>{k.telefon}</div>}
              </div>
            ))}
          </div>

          {/* Tjenester summary */}
          <div className="stat-card">
            <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>Tjenester</div>
            {tjenester.map(t=>(
              <div key={t.id} style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{t.navn}</div>
                  <div style={{fontSize:12,color:'#9ca3af'}}>{(t.pris_per_mnd/1000).toFixed(0)}k kr/mnd</div>
                </div>
                <span className={`badge ${t.status==='active'?'badge-green':'badge-yellow'}`} style={{fontSize:10,alignSelf:'center'}}>
                  {t.status==='active'?'Aktiv':'Onboarding'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
