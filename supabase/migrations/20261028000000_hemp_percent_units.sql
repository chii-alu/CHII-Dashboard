-- =====================================================================
-- CHII database update - HEMP percentage measures (28 October 2026)
-- These HEMP measures hold percentages in the workbook (e.g. 14.79%,
-- 44.35%) but were set up as counts, so they were stored as 0.1479,
-- 0.4435. This marks them as percentages; the next sync then stores
-- them as 14.79, 44.35 (and targets as 50, 5).
-- Run ONCE in Supabase: SQL Editor -> New query -> paste -> Run.
-- Safe to run again. Nothing is deleted.
-- =====================================================================
begin;

update metrics m
set unit = 'percent'
from dashboards d
where d.id = m.dashboard_id
  and d.code = 'HEMP'
  and (
        (m.section = 'At a Glance'  and m.name = 'Inclusion Reach')
     or (m.section = 'Intervention' and m.metric_group = 'Programme Overview - Key Metrics'
                                    and m.name in ('Female Participation', 'Inclusion Reach', 'Employment Conversions'))
     or (m.section = 'Intervention' and m.metric_group = 'Inclusion Reach')
      );

-- Convert values already stored as fractions (0.1479 -> 14.79), so the
-- dashboard is right even before the next sync
update metric_values v
set value = round(v.value * 100, 4), updated_at = now()
from metrics m join dashboards d on d.id = m.dashboard_id
where v.metric_id = m.id and d.code = 'HEMP' and m.unit = 'percent'
  and v.value > 0 and v.value <= 1
  and m.name <> 'Female %' and m.name <> 'Male %';

commit;

-- Check: Inclusion Reach 14.79, Female Participation 44.35 (targets 50, 5)
select section, metric, intervention, value_type, value, unit
from v_metric_values
where dashboard = 'HEMP' and unit = 'percent'
order by section, metric, intervention, value_type;
