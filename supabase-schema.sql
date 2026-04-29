-- =============================================
-- ADSEO CRM - Database Schema
-- Kjør denne i Supabase SQL Editor
-- =============================================

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  navn text,
  epost text,
  telefon text,
  rolle text default 'selger',
  avatar_initials text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Kunder
create table if not exists kunder (
  id uuid primary key default gen_random_uuid(),
  bedriftsnavn text not null,
  juridisk_navn text,
  org_nummer text,
  nettside text,
  sted text default 'Oslo, Norge',
  mrr numeric default 0,
  kunde_siden date default now(),
  kundeansvarlig_id uuid references profiles(id),
  helse_score integer default 75,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Kontakter
create table if not exists kontakter (
  id uuid primary key default gen_random_uuid(),
  kunde_id uuid references kunder(id) on delete cascade,
  navn text not null,
  tittel text,
  epost text,
  telefon text,
  er_primaer boolean default false,
  created_at timestamptz default now()
);

-- Tjenester
create table if not exists tjenester (
  id uuid primary key default gen_random_uuid(),
  kunde_id uuid references kunder(id) on delete cascade,
  navn text not null,
  status text default 'active',
  pris_per_mnd numeric default 0,
  ansvarlig_id uuid references profiles(id),
  created_at timestamptz default now()
);

-- Oppgaver
create table if not exists oppgaver (
  id uuid primary key default gen_random_uuid(),
  tittel text not null,
  beskrivelse text,
  prioritet text default 'medium',
  status text default 'ikke_startet',
  frist timestamptz,
  kunde_id uuid references kunder(id) on delete set null,
  assignee_id uuid references profiles(id),
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tickets
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  tittel text not null,
  beskrivelse text,
  prioritet text default 'medium',
  status text default 'apent',
  kategori text,
  kunde_id uuid references kunder(id) on delete set null,
  kontakt_id uuid references kontakter(id) on delete set null,
  assignee_id uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leveranser
create table if not exists leveranser (
  id uuid primary key default gen_random_uuid(),
  tittel text not null,
  type text,
  status text default 'ikke_startet',
  frist date,
  kunde_id uuid references kunder(id) on delete set null,
  ansvarlig_id uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Leveranse-oppgaver
create table if not exists leveranse_oppgaver (
  id uuid primary key default gen_random_uuid(),
  leveranse_id uuid references leveranser(id) on delete cascade,
  tittel text not null,
  fullfort boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Leads / Pipeline
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  bedriftsnavn text not null,
  kontaktperson text,
  stilling text,
  telefon text,
  epost text,
  stage text default 'ny_lead',
  verdi numeric default 0,
  sannsynlighet integer default 20,
  neste_steg text,
  neste_steg_dato date,
  assignee_id uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Aktivitetslogg
create table if not exists aktivitetslogg (
  id uuid primary key default gen_random_uuid(),
  kunde_id uuid references kunder(id) on delete cascade,
  type text default 'notat',
  tittel text not null,
  beskrivelse text,
  utfort_av uuid references profiles(id),
  created_at timestamptz default now()
);

-- =============================================
-- DEMO DATA
-- =============================================

-- Demo profiles (kjøres etter at brukere er opprettet via Auth)
-- insert into profiles (id, navn, epost, rolle) values (auth.uid(), 'Ola Nordmann', 'ola@adseo.no', 'administrator');

-- Demo kunder
insert into kunder (bedriftsnavn, juridisk_navn, org_nummer, nettside, sted, mrr, helse_score, kunde_siden) values
  ('Nordic Tech AS', 'Nordic Tech Solutions AS', '123456789', 'www.nordictech.no', 'Oslo, Norge', 45000, 85, '2024-03-15'),
  ('Green Energy Norway', 'Green Energy Norway AS', '987654321', 'www.greenenergy.no', 'Bergen, Norge', 22000, 92, '2024-01-20'),
  ('Retail Solutions', 'Retail Solutions AS', '456789123', 'www.retailsolutions.no', 'Trondheim, Norge', 18000, 45, '2024-02-10'),
  ('E-commerce Pro AS', 'E-commerce Pro AS', '321654987', 'www.ecommercepro.no', 'Oslo, Norge', 35000, 78, '2023-11-05'),
  ('Media Group AS', 'Media Group AS', '654321789', 'www.mediagroup.no', 'Stavanger, Norge', 28000, 65, '2023-09-12')
on conflict do nothing;

-- Demo kontakter
insert into kontakter (kunde_id, navn, tittel, epost, telefon, er_primaer)
select k.id, 'Maria Hansen', 'Markedssjef', 'maria@nordictech.no', '+47 123 45 678', true
from kunder k where k.bedriftsnavn = 'Nordic Tech AS' limit 1;

insert into kontakter (kunde_id, navn, tittel, epost, telefon, er_primaer)
select k.id, 'Erik Larsen', 'CEO', 'erik@nordictech.no', '+47 987 65 432', false
from kunder k where k.bedriftsnavn = 'Nordic Tech AS' limit 1;

insert into kontakter (kunde_id, navn, tittel, epost, telefon, er_primaer)
select k.id, 'Kari Olsen', 'Daglig leder', 'kari@greenenergy.no', '+47 456 78 901', true
from kunder k where k.bedriftsnavn = 'Green Energy Norway' limit 1;

insert into kontakter (kunde_id, navn, tittel, epost, telefon, er_primaer)
select k.id, 'Per Andersen', 'Markedsansvarlig', 'per@retailsolutions.no', '+47 234 56 789', true
from kunder k where k.bedriftsnavn = 'Retail Solutions' limit 1;

-- Demo tjenester
insert into tjenester (kunde_id, navn, status, pris_per_mnd)
select k.id, 'SEO', 'active', 25000 from kunder k where k.bedriftsnavn = 'Nordic Tech AS' limit 1;
insert into tjenester (kunde_id, navn, status, pris_per_mnd)
select k.id, 'Google Ads', 'onboarding', 20000 from kunder k where k.bedriftsnavn = 'Nordic Tech AS' limit 1;
insert into tjenester (kunde_id, navn, status, pris_per_mnd)
select k.id, 'SEO', 'active', 12000 from kunder k where k.bedriftsnavn = 'Green Energy Norway' limit 1;
insert into tjenester (kunde_id, navn, status, pris_per_mnd)
select k.id, 'Google Ads', 'active', 10000 from kunder k where k.bedriftsnavn = 'Green Energy Norway" limit 1;
insert into tjenester (kunde_id, navn, status, pris_per_mnd)
select k.id, 'Meta Ads', 'active', 8000 from kunder k where k.bedriftsnavn = 'Retail Solutions' limit 1;

-- Demo leads
insert into leads (bedriftsnavn, kontaktperson, stilling, telefon, stage, verdi, sannsynlighet, neste_steg) values
  ('Growth Company AS', 'Martin Berg', 'CMO', '+47 111 22 333', 'ny_lead', 50000, 20, 'Første kontakt'),
  ('Local Services AS', 'Tom Olsen', 'Daglig leder', '+47 222 33 444', 'kvalifisering', 60000, 40, 'Kvalifiseringssamtale'),
  ('Innovation Hub', 'Lise Strand', 'Markedssjef', '+47 333 44 555', 'mote_booket', 95000, 50, 'Behovskartlegging'),
  ('Digital Solutions AS', 'Anders Johnsen', 'CEO', '+47 444 55 666', 'tilbud_sendt', 180000, 70, 'Oppfølging etter tilbud'),
  ('Forhandling AS', 'Nina Hansen', 'E-handel sjef', '+47 555 66 777', 'forhandling', 240000, 80, 'Kontraktforhandling'),
  ('TechCorp AS', 'Hans Pettersen', 'CTO', '+47 666 77 888', 'vunnet', 320000, 100, 'Onboarding starter')
on conflict do nothing;
