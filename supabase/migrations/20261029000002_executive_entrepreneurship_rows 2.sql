-- =====================================================================
-- CHII database update - Executive 'Entrepreneurship' rows (29 October 2026)
-- Matches the database to the new row names on the Entrepreneurship sheet:
--   Entrepreneurs, Enterprises, Jobs created, Female-led, Capital Secured,
--   Market Extension
-- * 'Active Enterprises' is renamed 'Enterprises' (its numbers are kept)
-- * 'Median salary' is removed from Entrepreneurship (the row is gone from
--   the sheet). Median salary on Wage Employment is NOT touched.
-- ('Enterpreneurs' as spelt in the sheet already matches 'Entrepreneurs'.)
-- Run ONCE in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run again.
-- =====================================================================
begin;

update metrics m set name = 'Enterprises', description = 'Enterprises started by participants'
from dashboards d
where d.id = m.dashboard_id and d.code = 'EXEC'
  and m.section = 'Entrepreneurship' and m.metric_group = 'Entrepreneurship Metrics'
  and m.name = 'Active Enterprises'
  and not exists (select 1 from metrics x where x.dashboard_id = m.dashboard_id and x.section = m.section
                  and x.metric_group = m.metric_group and x.name = 'Enterprises');

delete from metric_values v
using metrics m, dashboards d
where v.metric_id = m.id and d.id = m.dashboard_id and d.code = 'EXEC'
  and m.section = 'Entrepreneurship' and m.metric_group = 'Entrepreneurship Metrics'
  and m.name = 'Median salary';

delete from metrics m
using dashboards d
where d.id = m.dashboard_id and d.code = 'EXEC'
  and m.section = 'Entrepreneurship' and m.metric_group = 'Entrepreneurship Metrics'
  and m.name = 'Median salary';

commit;

-- Check: the six Entrepreneurship measures, in sheet order
select m.name, m.unit from metrics m join dashboards d on d.id = m.dashboard_id
where d.code = 'EXEC' and m.section = 'Entrepreneurship' and m.metric_group = 'Entrepreneurship Metrics'
order by m.id;
