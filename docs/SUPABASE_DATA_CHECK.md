# Supabase Data Verification Guide

Before testing the integration, verify your Supabase database is set up correctly.

---

## Quick Data Check

### 1. Open Supabase Dashboard
- Go to https://supabase.com/dashboard
- Select your project
- Click **SQL Editor**

### 2. Run These Queries

#### Check Overall Data Volume
```sql
-- This query shows data statistics
SELECT 
  'dashboards' as table_name, COUNT(*) as row_count FROM dashboards
UNION ALL
SELECT 'metrics', COUNT(*) FROM metrics
UNION ALL
SELECT 'metric_values', COUNT(*) FROM metric_values
UNION ALL
SELECT 'pillars', COUNT(*) FROM pillars
UNION ALL
SELECT 'interventions', COUNT(*) FROM interventions;
```

**Expected Results:**
```
dashboards:      4 rows (EXEC, HEMP, HENT, HECO)
metrics:        150+ rows
metric_values:  1000+ rows
pillars:        4 rows
interventions:  15+ rows
```

---

## Per-Dashboard Verification

### HEMP Dashboard Data

#### Check Headlines for Courses
```sql
SELECT m.name, COUNT(v.id) as value_count
FROM metrics m
LEFT JOIN metric_values v ON m.id = v.metric_id
WHERE m.dashboard_id = (SELECT id FROM dashboards WHERE code = 'HEMP')
  AND m.section = 'Intervention'
  AND m.is_headline = true
GROUP BY m.name
ORDER BY m.name;
```

**Expected:** Should show metrics like "Total Enrolled", "Completion Rate", etc.

#### Check Intervention Data
```sql
SELECT DISTINCT i.name as intervention
FROM interventions i
WHERE i.pillar_id = (SELECT id FROM pillars WHERE code = 'HEMP')
ORDER BY i.name;
```

**Expected:**
```
Career Workshops
Courses
Exposure Events
Internships
SIE (Signature Immersive Experience)
```

#### Check Metric Values Exist
```sql
SELECT 
  COUNT(*) as total_values,
  MIN(updated_at) as oldest_data,
  MAX(updated_at) as newest_data
FROM metric_values
WHERE metric_id IN (
  SELECT id FROM metrics 
  WHERE dashboard_id = (SELECT id FROM dashboards WHERE code = 'HEMP')
);
```

**Expected:**
```
total_values:   1000+
oldest_data:    Should be recent (2024-2026)
newest_data:    Should be today or recent
```

---

## Test Data Sample Queries

### Test 1: Verify Courses Data
```sql
-- Should return Courses headline metrics
SELECT m.name, v.value, v.segment
FROM metric_values v
JOIN metrics m ON v.metric_id = m.id
WHERE m.dashboard_id = (SELECT id FROM dashboards WHERE code = 'HEMP')
  AND m.section = 'Intervention'
  AND v.intervention_id = (SELECT id FROM interventions WHERE name = 'Courses')
  AND m.is_headline = true
LIMIT 20;
```

**Should show:** Total Enrolled, Completion Rate, Graduation Rate, Female Participation, etc. with actual numbers

### Test 2: Verify SIE Data
```sql
-- Should return SIE headline metrics
SELECT m.name, v.value, v.year, v.segment
FROM metric_values v
JOIN metrics m ON v.metric_id = m.id
WHERE m.dashboard_id = (SELECT id FROM dashboards WHERE code = 'HEMP')
  AND m.section = 'Intervention'
  AND v.intervention_id = (SELECT id FROM interventions WHERE name = 'SIE')
  AND m.is_headline = true
ORDER BY v.year DESC
LIMIT 30;
```

**Should show:** Multiple years (2024, 2025, 2026) with data for each metric

### Test 3: Verify Internships Data
```sql
-- Should return Internships data
SELECT m.name, v.value, v.organization
FROM metric_values v
JOIN metrics m ON v.metric_id = m.id
WHERE m.dashboard_id = (SELECT id FROM dashboards WHERE code = 'HEMP')
  AND m.section = 'Intervention'
  AND v.intervention_id = (SELECT id FROM interventions WHERE name = 'Internships')
LIMIT 20;
```

**Should show:** Organizations with placement data

---

## Data Integrity Checks

### Check 1: No NULL Values in Critical Fields
```sql
SELECT 
  COUNT(CASE WHEN metric_id IS NULL THEN 1 END) as null_metrics,
  COUNT(CASE WHEN value IS NULL THEN 1 END) as null_values,
  COUNT(CASE WHEN segment IS NULL THEN 1 END) as null_segments
FROM metric_values;
```

**Expected:** All counts should be 0

### Check 2: All Metrics Have Rows
```sql
-- Shows metrics with no data
SELECT m.id, m.name, COUNT(v.id) as value_count
FROM metrics m
LEFT JOIN metric_values v ON m.id = v.metric_id
WHERE m.dashboard_id = (SELECT id FROM dashboards WHERE code = 'HEMP')
GROUP BY m.id, m.name
HAVING COUNT(v.id) = 0
ORDER BY m.name;
```

**Expected:** Should be empty (all metrics have at least some data)

### Check 3: Verify Year Data Exists
```sql
SELECT DISTINCT year
FROM metric_values
WHERE year IS NOT NULL
ORDER BY year DESC;
```

**Expected:** Should show years like 2024, 2025, 2026

---

## Common Data Issues & Fixes

### Issue: No data showing in queries
**Solution:**
```sql
-- Check if schema was created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should show: metrics, metric_values, dashboards, pillars, interventions, etc.
```

### Issue: Counts are 0
**Solution:**
```sql
-- Make sure you ran the SQL setup script
-- Execute the entire SQL from CHII-Dashboard database setup
-- Then verify counts increase
```

### Issue: Data is from wrong time period
**Solution:**
```sql
-- Check data dates
SELECT MIN(updated_at), MAX(updated_at) FROM metric_values;

-- If old, delete old data:
DELETE FROM metric_values WHERE updated_at < '2024-01-01';

-- Then re-import latest data
```

---

## Pre-Testing Checklist

Before running the integration tests, complete this:

- [ ] Supabase project created
- [ ] Database schema initialized (SQL setup script run)
- [ ] At least 100 rows in metric_values table
- [ ] All 4 dashboards exist (EXEC, HEMP, HENT, HECO)
- [ ] HEMP interventions include: Courses, SIE, Internships, Career Workshops
- [ ] Data includes multiple years (2024, 2025, 2026)
- [ ] No NULL values in critical fields
- [ ] .env.local has correct Supabase credentials
- [ ] Can connect to Supabase from application

---

## Verification SQL Script (All-in-One)

Copy and paste this entire script into Supabase SQL Editor:

```sql
-- SUPABASE DATA VERIFICATION SCRIPT
-- Run this to verify your setup is complete

-- 1. Show table row counts
SELECT 'Table Counts' as check_name, 'Info' as status;
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.tables t WHERE t.table_name = tables.table_name AND table_schema = 'public') as exists_check,
  CASE 
    WHEN table_name = 'dashboards' THEN (SELECT COUNT(*) FROM dashboards)
    WHEN table_name = 'metrics' THEN (SELECT COUNT(*) FROM metrics)
    WHEN table_name = 'metric_values' THEN (SELECT COUNT(*) FROM metric_values)
    WHEN table_name = 'pillars' THEN (SELECT COUNT(*) FROM pillars)
    WHEN table_name = 'interventions' THEN (SELECT COUNT(*) FROM interventions)
    ELSE NULL
  END as row_count
FROM (
  VALUES ('dashboards'), ('metrics'), ('metric_values'), ('pillars'), ('interventions')
) as tables(table_name);

-- 2. Check HEMP dashboard exists
SELECT 'HEMP Dashboard' as check_name, 
  CASE WHEN EXISTS(SELECT 1 FROM dashboards WHERE code = 'HEMP') THEN '✓ Exists' ELSE '✗ Missing' END as status;

-- 3. Check HEMP interventions
SELECT 'HEMP Interventions' as check_name, COUNT(*) as count
FROM interventions
WHERE pillar_id = (SELECT id FROM pillars WHERE code = 'HEMP');

-- 4. Check metric values volume
SELECT 'Total Metric Values' as check_name, COUNT(*) as count
FROM metric_values;

-- 5. Show data date range
SELECT 'Data Date Range' as check_name, 
  MIN(CAST(updated_at AS TEXT)) as oldest,
  MAX(CAST(updated_at AS TEXT)) as newest
FROM metric_values;

-- 6. Check for NULL critical values
SELECT 'NULL Value Check' as check_name,
  'metric_id NULLs: ' || COUNT(CASE WHEN metric_id IS NULL THEN 1 END) ||
  ', value NULLs: ' || COUNT(CASE WHEN value IS NULL THEN 1 END) as status
FROM metric_values;
```

**Run this and verify all counts are > 0**

---

## If Data Is Missing

### Re-run Setup Script
```sql
-- 1. Open Supabase SQL Editor
-- 2. Copy entire SQL from database setup
-- 3. Run it (this is safe to run multiple times)
-- 4. Check data counts increase
```

### Verify Connection Works
```bash
# In your terminal, test the connection:
curl -X GET "https://YOUR_PROJECT.supabase.co/rest/v1/dashboards" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Should return JSON array with dashboards
```

---

## Success Indicators

Once this checklist passes, you're ready for integration testing:

```
✅ metric_values table: 1000+ rows
✅ metrics table: 150+ rows
✅ dashboards table: 4 rows
✅ interventions include Courses, SIE, Internships, Career Workshops
✅ Data includes years 2024, 2025, 2026
✅ No NULL values in critical fields
✅ Supabase connection works from application
✅ .env.local configured correctly
```

---

**Status:** Ready for Integration Testing ✅
