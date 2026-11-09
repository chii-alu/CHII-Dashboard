-- =====================================================================
-- CHII database update - Executive workbook: renamed rows (29 October 2026)
-- Run ONCE in Supabase: SQL Editor -> New query -> paste -> Run.
-- Run update_catch_up_2026-10-29.sql first if you haven't yet.
-- Renames two measures to match the workbook. Their stored numbers are
-- kept and refreshed on the next sync. Nothing is deleted. Safe to run again.
-- Targets need no database change: the sync already stores the 'Target'
-- column of every sheet, and the progress view works them out.
-- =====================================================================
begin;

-- At a Glance row 6: 'Total Beneficiaries' is now 'Total Outreach'
update metrics m set name = 'Total Outreach'
from dashboards d
where d.id = m.dashboard_id and d.code = 'EXEC'
  and m.section = 'At a Glance' and m.metric_group = 'Outreach & Access Metrics'
  and m.name = 'Total Beneficiaries'
  and not exists (select 1 from metrics x where x.dashboard_id = m.dashboard_id and x.section = m.section
                  and x.metric_group = m.metric_group and x.name = 'Total Outreach');

-- Outreach row 8: 'Female Share (%)' is now 'Female Participants' (a count, e.g. 844)
update metrics m set name = 'Female Participants', unit = 'count',
       description = 'Female participants across all programmes'
from dashboards d
where d.id = m.dashboard_id and d.code = 'EXEC'
  and m.section = 'Outreach' and m.metric_group = 'Outreach & Access Metrics'
  and m.name = 'Female Share (%)'
  and not exists (select 1 from metrics x where x.dashboard_id = m.dashboard_id and x.section = m.section
                  and x.metric_group = m.metric_group and x.name = 'Female Participants');

commit;

-- Check: both new names listed
select m.section, m.name, m.unit from metrics m join dashboards d on d.id = m.dashboard_id
where d.code = 'EXEC' and m.name in ('Total Outreach', 'Female Participants');
