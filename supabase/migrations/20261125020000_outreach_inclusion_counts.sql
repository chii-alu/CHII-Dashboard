-- =====================================================================
-- CHII database update - Outreach inclusion rows are counts (25 November 2026)
-- The Outreach rows 'Refugee / IDP (%)' and 'Persons with Disability (%)' hold head
-- counts in the workbook (e.g. 70 and 30), not percentages. Marking them as counts:
--   * stops the sync turning a count of 1 into 100 (it scales percent values <= 1),
--   * lets the sync add H1 + H2 into a full-year figure, like other counts.
-- The dashboard works out the % against Total Participants. Names are unchanged.
-- Run ONCE in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run again.
-- =====================================================================
begin;

update metrics m set unit = 'count'
from dashboards d
where d.id = m.dashboard_id and d.code = 'EXEC'
  and m.section = 'Outreach' and m.metric_group = 'Outreach & Access Metrics'
  and m.name in ('Refugee / IDP (%)', 'Persons with Disability (%)');

commit;

-- Check: both rows now 'count'
select m.name, m.unit from metrics m join dashboards d on d.id = m.dashboard_id
where d.code = 'EXEC' and m.section = 'Outreach' and m.name in ('Refugee / IDP (%)', 'Persons with Disability (%)');
