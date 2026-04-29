import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Kunde = {
  id: string
  bedriftsnavn: string
  juridisk_navn?: string
  org_nummer?: string
  nettside?: string
  sted?: string
  mrr: number
  kunde_siden?: string
  kundeansvarlig_id?: string
  helse_score: number
  created_at: string
}

export type Kontakt = {
  id: string
  kunde_id: string
  navn: string
  tittel?: string
  epost?: string
  telefon?: string
  er_primaer: boolean
}

export type Tjeneste = {
  id: string
  kunde_id: string
  navn: string
  status: string
  pris_per_mnd: number
}

export type Oppgave = {
  id: string
  tittel: string
  beskrivelse?: string
  prioritet: 'lav' | 'medium' | 'høy'
  status: 'ikke_startet' | 'pagar' | 'fullfort'
  frist?: string
  kunde_id?: string
  assignee_id?: string
  kunder?: { bedriftsnavn: string }
  created_at: string
}

export type Ticket = {
  id: string
  tittel: string
  beskrivelse?: string
  prioritet: 'lav' | 'medium' | 'høy'
  status: 'apent' | 'pagar' | 'venter_pa_kunde' | 'lukket'
  kategori?: string
  kunde_id?: string
  kunder?: { bedriftsnavn: string }
  kontakter?: { navn: string }
  created_at: string
}

export type Leveranse = {
  id: string
  tittel: string
  type?: string
  status: 'ikke_startet' | 'pagar' | 'venter_pa_kunde' | 'ferdig'
  frist?: string
  kunde_id?: string
  kunder?: { bedriftsnavn: string }
  leveranse_oppgaver?: LeveranseOppgave[]
  created_at: string
}

export type LeveranseOppgave = {
  id: string
  leveranse_id: string
  tittel: string
  fullfort: boolean
  sort_order: number
}

export type Lead = {
  id: string
  bedriftsnavn: string
  kontaktperson?: string
  stilling?: string
  telefon?: string
  epost?: string
  stage: 'ny_lead' | 'kvalifisering' | 'mote_booket' | 'tilbud_sendt' | 'forhandling' | 'vunnet' | 'tapt'
  verdi: number
  sannsynlighet: number
  neste_steg?: string
  neste_steg_dato?: string
  created_at: string
}

export type Aktivitet = {
  id: string
  kunde_id: string
  type: string
  tittel: string
  beskrivelse?: string
  created_at: string
}
