-- =====================================================================
-- CHII database update - Executive At a Glance row 23 renamed (25 November 2026)
-- 'Enterprises' is now 'Enterprises Supported' in the workbook (Program Outcomes).
-- Its stored numbers are kept and refreshed on the next sync.
-- Only the At a Glance row changes; 'Enterprises' on the Entrepreneurship sheet is not touched.
-- Run ONCE in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again.
-- =====================================================================
begin;

update metrics m set name = 'Enterprises Supported', description = 'Enterprises supported by CHII programmes'
from dashboards d
where d.id = m.dashboard_id and d.code = 'EXEC'
  and m.section = 'At a Glance' and m.metric_group = 'Program Outcomes'
  and m.name = 'Enterprises'
  and not exists (select 1 from metrics x where x.dashboard_id = m.dashboard_id and x.section = m.section
                  and x.metric_group = m.metric_group and x.name = 'Enterprises Supported');

commit;

-- Check: one row, 'Enterprises Supported'
select m.section, m.metric_group, m.name from metrics m join dashboards d on d.id = m.dashboard_id
where d.code = 'EXEC' and m.section = 'At a Glance' and m.name like 'Enterprises%';
