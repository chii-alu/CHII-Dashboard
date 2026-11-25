-- =====================================================================
-- CHII database update - Executive workbook, half-year layout (25 November 2026)
-- Matches the database to the new Executive_Dashboard_2026 workbook:
--   * every table now has columns 2025 | H1 2026 | H2 2026 | ... | H2 2030 |
--     Cumulative Total (with Female / Male / Total / Target sub-columns).
--     No table change is needed for that: metric_values already has a
--     'period' column. The updated sync (sync_to_supabase.py) stores
--     H1 2026 as year 2026 + period 'H1', 'Cumulative Total' as year empty,
--     and the full year 2026 as H1 + H2 for counts.
--   * some rows and tables were renamed, and a few are new (below).
-- Numbers already stored are kept and refreshed on the next sync.
-- Run ONCE in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run again. All or nothing: if anything fails, nothing changes.
-- Run this BEFORE starting the updated sync, otherwise the sync stops with
-- "no metric ..." messages and writes nothing.
-- =====================================================================
begin;

-- ---------------------------------------------------------------------
-- 1. Health Missions (HM) pillar and its interventions
--    (Outreach > Participation by Intervention lists them under 'HM')
-- ---------------------------------------------------------------------
insert into pillars (code, name) values ('HM', 'Health Missions')
on conflict (code) do nothing;

insert into interventions (pillar_id, name)
select p.id, x.name
from (values
  ('HM',   'Student Onboarding & Orientation'),
  ('HM',   'Mission Development & Implementation Support'),
  ('HM',   'Training & Capacity Building'),
  ('HM',   'Mentorship & Professional Guidance'),
  ('HM',   'Experiential Learning & Professional Exposure'),
  ('HM',   'Research & Innovation Support'),
  ('HM',   'Student Progress Monitoring & Follow-up'),
  ('HECO', 'Research Activities'),
  ('HECO', 'Executive Courses')
) as x(pillar, name)
join pillars p on p.code = x.pillar
on conflict (name) do nothing;

-- ---------------------------------------------------------------------
-- 2. Renamed rows and tables (old name -> name in the workbook)
--    A table's measure is named after its heading, so both the group
--    and the name change for tables.
-- ---------------------------------------------------------------------
with renames(section, old_group, old_name, new_group, new_name) as (values
  -- At a Glance row 6
  ('At a Glance',     'Outreach & Access Metrics',            'Total Outreach',
                      'Outreach & Access Metrics',            'Total Work-Enabling Outreach'),
  -- Youth in Work row 6
  ('Youth in Work',   'Youth In Work Metrics',                'Participants',
                      'Youth In Work Metrics',                'Beneficiaries'),
  -- Youth in Work row 11 (now a count, e.g. 188 - see unit change below)
  ('Youth in Work',   'Youth In Work Metrics',                'Female Share (%)',
                      'Youth In Work Metrics',                'Female Share'),
  -- Youth in Work tables
  ('Youth in Work',   'Work Pathway Distribution',            'Work Pathway Distribution',
                      'Pathway Distribution',                 'Pathway Distribution'),
  -- Outreach tables
  ('Outreach',        'Graduation Status',                    'Graduation Status',
                      'Health Mission Students Graduation Status', 'Health Mission Students Graduation Status'),
  ('Outreach',        'Gender Split',                         'Gender Split',
                      'Gender Split By Academic Program',     'Gender Split By Academic Program'),
  -- Wage Employment table (Less than 6 / 6 / 12 / 24 months)
  ('Wage Employment', 'Time To Employment After Graduation',  'Time To Employment After Graduation',
                      'Employment Placement Rate',            'Employment Placement Rate')
)
update metrics m set metric_group = r.new_group, name = r.new_name
from renames r, dashboards d
where d.id = m.dashboard_id and d.code = 'EXEC'
  and m.section = r.section and m.metric_group = r.old_group and m.name = r.old_name
  and not exists (select 1 from metrics x where x.dashboard_id = m.dashboard_id and x.section = m.section
                  and x.metric_group = r.new_group and x.name = r.new_name);

-- Youth in Work 'Female Share' is now a count of women (188), not a %.
-- Old % figures are removed so they are not shown as counts; the sync refills it.
delete from metric_values v
using metrics m, dashboards d
where v.metric_id = m.id and d.id = m.dashboard_id and d.code = 'EXEC'
  and m.section = 'Youth in Work' and m.name = 'Female Share' and m.unit = 'percent';

update metrics m set unit = 'count', description = 'Women among youth in work'
from dashboards d
where d.id = m.dashboard_id and d.code = 'EXEC'
  and m.section = 'Youth in Work' and m.metric_group = 'Youth In Work Metrics' and m.name = 'Female Share';

-- ---------------------------------------------------------------------
-- 3. New rows and tables
-- ---------------------------------------------------------------------
insert into metrics (dashboard_id, section, metric_group, name, unit, is_headline, description)
select d.id, x.section, x.grp, x.name, x.unit, x.headline, x.descr
from (values
  ('At a Glance', 'Program Outcomes', 'Health Mission Students', 'count', true,
   'Students taking part in health missions'),
  ('Outreach', 'Participant Geographic Distribution', 'Participant Geographic Distribution', 'count', false,
   'Participants by setting: rural, urban, peri-urban, not reported'),
  ('Outreach', 'Quality Dimensions & Recommendations', 'Quality Dimensions & Recommendations', 'score', false,
   'Average relevance, quality, usefulness and NPS ratings')
) as x(section, grp, name, unit, headline, descr)
cross join dashboards d
where d.code = 'EXEC'
on conflict (dashboard_id, section, metric_group, name) do nothing;

commit;

-- Check: the renamed and new Executive measures (10 rows expected)
select m.section, m.metric_group, m.name, m.unit
from metrics m join dashboards d on d.id = m.dashboard_id
where d.code = 'EXEC' and m.name in (
  'Total Work-Enabling Outreach', 'Beneficiaries', 'Female Share', 'Pathway Distribution',
  'Health Mission Students Graduation Status', 'Gender Split By Academic Program',
  'Employment Placement Rate', 'Health Mission Students', 'Participant Geographic Distribution',
  'Quality Dimensions & Recommendations')
order by m.section, m.name;
