-- =====================================================================
-- HENT 'At a Glance' tables (2 November 2026)
-- The HENT workbook's At a Glance sheet now has two tables:
--   PARTICIPATION:   Total Participants, Countries Reached, Ventures Supported,
--                    Ventures Funded, Total Jobs Created, Capital Deployed,
--                    Employment Rate
--   HENT ENGAGEMENT: Masterclasses, Mentorship, Hackathons, Ventures,
--                    Venture Funding, Exposure & Networking, Study Trips
-- 1. The old table name 'Participation Metrics' becomes 'Participation'
--    (its measures and any stored numbers are kept).
-- 2. The HENT ENGAGEMENT measures are added.
-- Safe on any database: only changes what is not already there.
-- =====================================================================

-- 1. Rename the table, unless 'Participation' already exists
update metrics m set metric_group = 'Participation'
from dashboards d
where d.id = m.dashboard_id and d.code = 'HENT'
  and m.section = 'At a Glance' and m.metric_group = 'Participation Metrics'
  and not exists (select 1 from metrics x where x.dashboard_id = m.dashboard_id
                  and x.section = 'At a Glance' and x.metric_group = 'Participation' and x.name = m.name);

-- Make sure every PARTICIPATION row exists (with the right unit)
insert into metrics (dashboard_id, section, metric_group, name, unit, is_headline, description)
select d.id, 'At a Glance', 'Participation', x.name, x.unit, true, x.descr
from (values
  ('Total Participants', 'count',        'People reached across all HENT programmes'),
  ('Countries Reached',  'count',        'Countries HENT participants come from'),
  ('Ventures Supported', 'count',        'Ventures supported by HENT'),
  ('Ventures Funded',    'count',        'Ventures that received funding'),
  ('Total Jobs Created', 'count',        'Jobs created by supported ventures'),
  ('Capital Deployed',   'currency_usd', 'Capital deployed to ventures (USD)'),
  ('Employment Rate',    'percent',      'Share of participants in employment')
) as x(name, unit, descr)
cross join dashboards d
where d.code = 'HENT'
on conflict (dashboard_id, section, metric_group, name) do nothing;

-- 2. HENT ENGAGEMENT: participants per programme
insert into metrics (dashboard_id, section, metric_group, name, unit, is_headline, description)
select d.id, 'At a Glance', 'HENT Engagement', x.name, 'count', true, 'Participants in ' || x.name
from (values ('Masterclasses'), ('Mentorship'), ('Hackathons'), ('Ventures'),
             ('Venture Funding'), ('Exposure & Networking'), ('Study Trips')) as x(name)
cross join dashboards d
where d.code = 'HENT'
on conflict (dashboard_id, section, metric_group, name) do nothing;
