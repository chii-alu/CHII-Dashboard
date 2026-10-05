# Supabase Integration Testing Plan

## Overview
This testing plan ensures all HEMP pages correctly integrate with Supabase data and handle loading/error states gracefully.

---

## Phase 1: Setup & Prerequisites ✅

### Before Testing:
- [ ] Verify Supabase project is created and accessible
- [ ] Confirm database schema is set up (run the SQL setup script)
- [ ] Check that `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Verify auth context is properly configured for Supabase
- [ ] Run `npm run dev` and confirm no build errors

**Test Command:**
```bash
npm run dev
# Should start without TypeScript errors
```

---

## Phase 2: Individual Page Testing

### Test Each Page (5 pages total)

#### **1. Courses Page** (`/hemp/course`)
**URL:** `http://localhost:3000/hemp/course`

**Tests:**
- [ ] **Loading State** - Page should show "Loading Courses data…" briefly
- [ ] **Data Load** - Stats cards should display (Total Enrolled, Completion Rate, etc.)
- [ ] **Charts** - All charts should render with data
- [ ] **Filters** - Year filter should work and update charts
- [ ] **Error Handling** - (Intentional: temporarily break Supabase URL to test error state)

**Expected Behavior:**
```
✓ Loading spinner appears
✓ Data loads in < 2 seconds
✓ All 6 stats cards display values
✓ 3 section tabs show content
✓ Filters respond to clicks
```

**Data Validation:**
- [ ] Stats card values are reasonable (e.g., Total Enrolled > 0)
- [ ] Completion Rate is a percentage (0-100)
- [ ] Charts have data points
- [ ] Filter dropdown shows years from data

---

#### **2. SIE Page** (`/hemp/sie`)
**URL:** `http://localhost:3000/hemp/sie`

**Tests:**
- [ ] **Loading State** - Page should show "Loading SIE data…" briefly
- [ ] **Cohort Data** - Should display Cohort 1, 2, 3, 4 data
- [ ] **Stats Cards** - 6 stats cards with data (Total Applicants, Participants Selected, etc.)
- [ ] **Filters** - Year, Country, Region filters should work
- [ ] **NPS Score Card** - Should display numeric value (e.g., 7.8)

**Expected Behavior:**
```
✓ Loading spinner appears
✓ Cohort data displays (multiple years available)
✓ Filter dropdowns populate with real options
✓ Charts update when filters change
✓ Geography filter shows countries from data
```

**Data Validation:**
- [ ] NPS Score is between 0-10
- [ ] Satisfaction Score is between 0-5
- [ ] Selected > Applied (data logic)
- [ ] Female participants ≤ Total participants

---

#### **3. Internships Page** (`/hemp/internships`)
**URL:** `http://localhost:3000/hemp/internships`

**Tests:**
- [ ] **Loading State** - Page should show "Loading Internships data…" briefly
- [ ] **Placement Data** - Stats cards show placement numbers
- [ ] **Organization Filter** - Dropdown populates with organization names
- [ ] **Department Filter** - Dropdown shows departments
- [ ] **Charts** - Enrolment funnel and progression charts render

**Expected Behavior:**
```
✓ Loading spinner appears
✓ Placements Secured shows a number > 0
✓ Organization/Department filters show real options
✓ Charts display with data
✓ Employer Rating shows a score (0-10)
```

**Data Validation:**
- [ ] Placements ≤ Total Applicants
- [ ] Female Participation ≤ 100%
- [ ] Employment Conversions ≤ Placements Secured
- [ ] Employer Rating is between 0-10

---

#### **4. Career Workshops Page** (`/hemp/career-development`)
**URL:** `http://localhost:3000/hemp/career-development`

**Tests:**
- [ ] **Loading State** - Page should show "Loading Career Workshops data…" briefly
- [ ] **Total Participants** - Should display from Supabase data
- [ ] **Year Filter** - Filter works and updates displayed data
- [ ] **Partners** - Partner list displays

**Expected Behavior:**
```
✓ Loading spinner appears
✓ Total Participants displays a value > 0
✓ Stat cards show Career Workshops specific metrics
✓ Year filter has options from data
✓ No console errors
```

---

#### **5. At-a-Glance Page** (`/hemp`)
**URL:** `http://localhost:3000/hemp`

**Tests:**
- [ ] **Loading State** - Page should show "Loading HEMP dashboard…" briefly
- [ ] **Overview Cards** - Stats cards display (Total Enrolled, Female %, etc.)
- [ ] **Map Loads** - Map should render (Mapbox)
- [ ] **Participation Cards** - Shows breakdown by activity (Career Workshops, SIE, etc.)
- [ ] **Side Cards** - Demographics cards display

**Expected Behavior:**
```
✓ Loading spinner appears
✓ Header shows "15 countries active" (or your number)
✓ Stats cards have data
✓ Map renders without errors
✓ All breakdowns show percentages
```

---

## Phase 3: Error State Testing

### Intentional Error Tests

**Test 1: Network Error**
```bash
# Temporarily disconnect internet or break Supabase URL
# Expected: Error message displays
# "Failed to load data: [error message]"
```

**Test 2: Empty Data**
```bash
# If Supabase has no data yet:
# Expected: Pages should show loading, then handle empty gracefully
# Stats should show 0, charts should be empty
```

**Test 3: Slow Network (DevTools)**
```bash
# In Chrome DevTools:
# 1. Go to Network tab
# 2. Set throttling to "Slow 3G"
# 3. Reload page
# Expected: Loading state visible for >1 second, then data loads
```

---

## Phase 4: Data Integrity Tests

### Verify Data Transforms Correctly

**Test: Stats Cards Display Correct Values**

For **Courses** page:
```javascript
// Check browser console:
console.log("Total Enrolled from API:", totalEnrolled);
// Should match Supabase: SELECT SUM(enrolled) FROM gh_cohorts
```

For **SIE** page:
```javascript
// Verify cohort name transform
// "Cohort 1" should appear (not "SIE Pilot Cohort")
```

For **Internships** page:
```javascript
// Check that organization filter has real organizations
// Not just hardcoded values
```

**How to check:**
1. Open **Chrome DevTools** (F12)
2. Go to **Console** tab
3. Look for any error messages (red text)
4. Check **Network** tab for failed API calls

---

## Phase 5: Performance Testing

### Load Time Tests

**Test: Page Load Time**
```bash
# Measure time from page load to data display

Courses:      Target < 2s
SIE:          Target < 2s
Internships:  Target < 2s
Career Dev:   Target < 2s
At-a-Glance:  Target < 3s (includes map)
```

**How to measure:**
1. Open DevTools Performance tab
2. Reload page
3. Check "Largest Contentful Paint" (LCP)
4. Should be < 2.5s

---

## Phase 6: Browser Compatibility Testing

Test on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Tests:**
- [ ] Pages load without errors
- [ ] Stats cards display correctly
- [ ] Filters work
- [ ] Maps render (if applicable)
- [ ] No layout shift or overflow

---

## Phase 7: Integration Tests

### Test Page Interactions

**Navigation:**
- [ ] Click between tabs (Reach & Engagement, etc.)
- [ ] Each tab shows correct data
- [ ] Filters persist or reset as expected

**Filter Interactions:**
- [ ] Select year → charts update
- [ ] Select organization → list updates
- [ ] Clear filter → shows all data
- [ ] Multiple filters → data intersects correctly

**Charts:**
- [ ] Hover over data points → tooltip shows
- [ ] Mobile: charts responsive (no horizontal scroll)
- [ ] Chart legends work

---

## Phase 8: Regression Testing

### Ensure No Existing Features Broke

**Navigation:**
- [ ] Header links work (logo, nav items)
- [ ] Portal footer loads correctly
- [ ] Page routing works

**UI Components:**
- [ ] Stats cards are same size
- [ ] Charts render properly
- [ ] Buttons are clickable
- [ ] Dropdowns close when clicked outside

**Styling:**
- [ ] Dark mode (if enabled) works
- [ ] Colors match design system
- [ ] Text is readable
- [ ] No console CSS errors

---

## Testing Checklist

### Critical Path (Must Pass)
- [ ] Courses page loads and displays data
- [ ] SIE page loads and displays data
- [ ] Internships page loads and displays data
- [ ] No TypeScript/build errors
- [ ] No console errors (red text)
- [ ] Error states display correctly

### Important (Should Pass)
- [ ] All filters work
- [ ] Page load time < 2s
- [ ] Stats card values are reasonable
- [ ] Charts render with data
- [ ] Mobile responsive

### Nice to Have (Good to Pass)
- [ ] Smooth loading animations
- [ ] Tooltip text helpful
- [ ] All breakpoints tested
- [ ] Accessibility (keyboard nav, screen reader)

---

## Common Issues & Fixes

### Issue: "Failed to load data"
**Cause:** Supabase URL/key incorrect or missing
```bash
# Fix: Check .env.local
echo $NEXT_PUBLIC_SUPABASE_URL
# Should output your Supabase URL
```

### Issue: Stats card shows 0
**Cause:** No data in Supabase or incorrect query
```bash
# Fix: Verify data in Supabase dashboard
# Check metrics table has rows
SELECT COUNT(*) FROM metric_values;
```

### Issue: Filters don't update charts
**Cause:** useMemo dependencies missing
```javascript
// Verify filter dependencies include data variable
}, [filterYear, filterCountry, sieCohorts]); // ← sieCohorts must be here
```

### Issue: TypeScript errors
**Cause:** Type mismatches in data mapper
```bash
# Fix: Check that interfaces match Supabase response
# Run: npm run build
# Address any type errors
```

---

## Sign-Off Template

Once all tests pass, fill this out:

```markdown
## Testing Complete ✅

- **Date:** [Today]
- **Tester:** [Your name]
- **Pages Tested:** Courses, SIE, Internships, Career Dev, At-a-Glance

### Results:
- **Critical Path:** ✅ PASS
- **Important:** ✅ PASS
- **Performance:** ✅ PASS (< 2s load time)

### Known Issues:
None

### Ready for Production:
✅ YES
```

---

## Next Steps After Testing

1. **If All Tests Pass:**
   - Commit changes: `git commit -m "Integrate Supabase data for HEMP pages"`
   - Push to main or create PR
   - Deploy to staging/production

2. **If Tests Fail:**
   - Document issues with screenshots
   - Check Supabase schema against expected structure
   - Review data mapper transformations
   - Fix and re-test

3. **Monitor in Production:**
   - Watch error logs for failed API calls
   - Monitor page load times
   - Get user feedback on data accuracy

---

## Test Data Preparation

Before testing, ensure Supabase has:
```sql
-- At least one row per table:
SELECT COUNT(*) FROM metric_values; -- Should be > 100
SELECT COUNT(*) FROM dashboards;    -- Should be 4 (EXEC, HEMP, HENT, HECO)
SELECT COUNT(*) FROM metrics;       -- Should be 150+
SELECT COUNT(*) FROM pillars;       -- Should be 4
```

---

**Document Version:** 1.0
**Last Updated:** 2026-10-05
**Status:** Ready for Testing
