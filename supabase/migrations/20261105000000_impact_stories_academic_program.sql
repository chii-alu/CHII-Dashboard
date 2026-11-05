-- =====================================================================
-- Impact Stories: Academic Program column (5 November 2026)
-- The Executive workbook's STORY DATABASE now has an 'Academic Program'
-- column (e.g. 'BSc (Hons) Software Engineering').
--   academic_program : the programme exactly as written in the sheet
--   program_id       : the matching programme in academic_programs
--                      (BSE, BEL, IBT, ...), filled in by the sync when it
--                      recognises the name, so stories can be grouped with
--                      the rest of the dashboard data
-- Access is unchanged: only signed-in users can read impact_stories.
-- Safe to run again.
-- =====================================================================
alter table impact_stories
  add column if not exists academic_program text,
  add column if not exists program_id smallint references academic_programs(id);
