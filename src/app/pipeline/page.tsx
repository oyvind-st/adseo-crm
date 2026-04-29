'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus } from 'lucide-react'

const STACESS = [
  { key: 'ny_lead', label: 'Ny lead', color: '#6b7280' },
  { key: 'kvalifisering', label: 'Kvalifisering', color: '#7c3aed' },
  { key: 'mote_booket', label: 'Møte booket', color: '#2563eb' },
  { key: 'tilbud_sendt', label: 'Tilbud sendt', color: '#ca8a04' },
  { key: 'forhandling', label: 'Forhandling', color: '#ea580c' },
  { key: 'vunnet', label: 'Vunnet', color: '#16a34a' },
]

export default function PipelinePage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('leads').select('*').neq('stage','tapt').order('created_at').then(({ data }) => {
      setLeads(data || [])
      setLoading(false)
    })
  }, [])

  const totalVerdi = leads.reduce((s, l) => s + (l.verdi || 0), 0)
  const vektetVerdi = leads.reduce((s, l) => s + (l.verdi * l.sannsynlighet / 100 || 0), 0)
  const formatKr = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M kr` : `${(n/1000).toFixed(0)}k kr`

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>Leads &amp; Pipeline</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>{leads.filter(l=>l.stage!=='vunnet').length} aktive leads</p>
        </div>
        <button className="btn-primary"><Plus size={16}/> Ny lead</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Aktive leads</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{leads.filter(l=>l.stage!=='vunnet').length}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Total pipeline-verdi</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{formatKr(totalVerdi)}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Vektet verdi</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{formatKr(vektetVerdi)}</div>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>Laster pipeline...</div> : (
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16 }}>
          {STACESS.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage.key)
            const stageVerdi = stageLeads.reduce((s, l) => s + (l.verdi || 0), 0)
            return (
              <div key={stage.key} className="kanban-col">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{stage.label}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{stageLeads.length} leads{stageVerdi>0?` · ${formatKr(stageVerdi)}`:''}</div>
                  </div>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color }}/>
                </div>
                {stageLeads.map(lead => (
                  <div key={lead.id} className="kanban-card">
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{lead.bedriftsnavn}</div>
                    {lead.kontaktperson && <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{lead.kontaktperson}{lead.stilling ? ` · ${lead.stilling}` : ''}</div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{formatKr(lead.verdi)}</span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{lead.sannsynlighet}%</span>
                    </div>
                    {lead.neste_steg && (
                      <div style={{ background: '#f9fafb', borderRadius: 6, padding: '6px 8px', fontSize: 11, color: '#6b7280' }}>
                        <span style={{ fontWeight: 500 }}>Neste: </span>{lead.neste_steg}
                      </div>
                    )}
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#d1d5db', fontSize: 12, padding: '20px 0' }}>Ingen leads</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
