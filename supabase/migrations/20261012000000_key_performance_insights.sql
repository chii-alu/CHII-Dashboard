-- =====================================================================
-- CHII database update - Key Performance Insights, with headline figures
-- (12 October 2026)
-- Lets the sync store the 'KEY PERFORMANCE INSIGHTS' rows from the
-- workbooks: the figure (57%), title, what is measured and the detail.
-- This single file includes everything from update_insights_2026-10-12.sql,
-- so it works whether or not that file was run. Safe to run again.
-- Run in Supabase: SQL Editor -> New query -> paste -> Run.
-- Nothing else is changed. The figures come from the workbook and update
-- on every sync.
-- =====================================================================
begin;

-- 1. The parts of each insight, as laid out in the workbook
alter table dashboard_insights
  add column if not exists title         text,      -- e.g. 'Gender Balance'
  add column if not exists description   text,      -- what is measured
  add column if not exists detail        text,      -- the finding
  add column if not exists sort_order    smallint,  -- order on the sheet
  add column if not exists source_id     bigint references data_sources(id),
  add column if not exists value         numeric,   -- the figure as a number, e.g. 57 (for 57%)
  add column if not exists value_display text,      -- the figure as shown, e.g. '57%'
  add column if not exists value_unit    text;      -- 'percent', 'count' or 'currency_usd'
alter table dashboard_insights drop column if exists insight;   -- old single-text column, never used

-- 2. Readable view for the app
drop view if exists v_insights;
create view v_insights with (security_invoker = true) as
select d.code as dashboard, i.section, i.sort_order, i.title, i.description, i.detail,
       i.created_at as updated_at, i.value, i.value_display, i.value_unit
from dashboard_insights i
join dashboards d on d.id = i.dashboard_id;

-- 3. Who can read them: signed-in users, and (while the dashboard is public)
--    anyone. Insights are summary text with no personal details.
grant select on dashboard_insights, v_insights to authenticated;
grant select on dashboard_insights, v_insights to anon;
drop policy if exists "public read" on dashboard_insights;
create policy "public read" on dashboard_insights for select to anon using (true);

commit;

-- Check: empty until the next sync, then one row per insight with its figure
select sort_order, value_display, title, description, detail from v_insights
where dashboard = 'EXEC' order by sort_order;
