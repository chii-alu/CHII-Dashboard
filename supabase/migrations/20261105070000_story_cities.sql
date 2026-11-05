-- =====================================================================
-- Impact Stories: City of Residence on the map (5 November 2026)
-- The STORY DATABASE now has a 'City of Residence' column. To put a
-- marker on the map, every city needs its coordinates:
--   cities            one row per city: name, country, latitude, longitude
--                     (no personal data). Seeded below with the cities on
--                     the sheet today; the sync adds new ones by itself.
--   impact_stories    + city_of_residence (as written) and city_id
--   v_story_markers   one row per city with stories: coordinates and how
--                     many stories (by pillar and type), for map markers.
--                     Signed-in users only, like the stories themselves.
-- Safe to run again.
-- =====================================================================

create table if not exists cities (
  id          int generated always as identity primary key,
  name        text not null,
  country_id  smallint not null references countries(id),
  latitude    numeric(9,6) not null,
  longitude   numeric(9,6) not null,
  source      text not null default 'manual',   -- 'manual' or 'openstreetmap' (added by the sync)
  created_at  timestamptz not null default now(),
  unique (name, country_id)
);
alter table cities enable row level security;
drop policy if exists "read for signed-in users" on cities;
create policy "read for signed-in users" on cities for select to authenticated using (true);
drop policy if exists "public read" on cities;
create policy "public read" on cities for select to anon using (true);  -- place names only
grant select on cities to authenticated, anon;

alter table impact_stories
  add column if not exists city_of_residence text,
  add column if not exists city_id int references cities(id);

-- The cities on the sheet on 5 November 2026 (city-centre coordinates)
insert into cities (name, country_id, latitude, longitude)
select x.name, c.id, x.lat, x.lng
from (values
  ('Accra',     'Ghana',        5.603700,  -0.187000),
  ('Uwani',     'Nigeria',      6.431000,   7.493000),   -- district of Enugu
  ('Freetown',  'Sierra Leone', 8.465700, -13.231700),
  ('Abuja',     'Nigeria',      9.076500,   7.398600),
  ('Ado-Ekiti', 'Nigeria',      7.621100,   5.221000),
  ('Nairobi',   'Kenya',       -1.292100,  36.821900),
  ('Arusha',    'Tanzania',    -3.386900,  36.683000),
  ('Douala',    'Cameroon',     4.051100,   9.767900)
) as x(name, country, lat, lng)
join countries c on c.name = x.country
on conflict (name, country_id) do nothing;

-- Map markers: one per city, with counts (story names come from impact_stories)
create or replace view v_story_markers with (security_invoker = true) as
select ci.id as city_id, ci.name as city, co.name as country, co.iso2, co.iso3,
       ci.latitude, ci.longitude,
       count(*)                                            as stories,
       count(*) filter (where s.story_type = 'Video')      as video_stories,
       count(*) filter (where s.story_type = 'Text')       as text_stories,
       count(*) filter (where p.code = 'HEMP')             as hemp_stories,
       count(*) filter (where p.code = 'HENT')             as hent_stories,
       count(*) filter (where p.code = 'HECO')             as heco_stories,
       count(*) filter (where s.featured)                  as featured_stories
from impact_stories s
join cities ci    on ci.id = s.city_id
join countries co on co.id = ci.country_id
left join pillars p on p.id = s.pillar_id
group by ci.id, ci.name, co.name, co.iso2, co.iso3, ci.latitude, ci.longitude;

revoke all on v_story_markers from anon;
grant select on v_story_markers to authenticated;
