# Quick Start Testing Guide

## 5-Minute Sanity Check

Run this before any detailed testing:

### 1. Build Check
```bash
npm run build
# Expected: ✓ Compiled successfully (no TypeScript errors)
```

### 2. Dev Server Start
```bash
npm run dev
# Expected: ready on http://localhost:3000
```

### 3. Visit Each Page & Check Loading
```
□ http://localhost:3000/hemp/course              → Loading spinner → Data loads
□ http://localhost:3000/hemp/sie                 → Loading spinner → Data loads
□ http://localhost:3000/hemp/internships         → Loading spinner → Data loads
□ http://localhost:3000/hemp/career-development  → Loading spinner → Data loads
□ http://localhost:3000/hemp                     → Loading spinner → Data loads
```

### 4. Check Browser Console (F12)
```
□ No RED error messages
□ No "Cannot read property" errors
□ No "undefined" values in critical places
```

---

## 30-Minute Full Test

### Setup
```bash
# 1. Make sure .env.local has credentials
cat .env.local | grep SUPABASE

# 2. Verify Supabase is accessible
# Open Supabase dashboard and confirm you can see data

# 3. Start dev server
npm run dev
```

### Test Each Page (5 minutes each)

**Courses Page:**
```
1. Open http://localhost:3000/hemp/course
2. Wait for loading → data
3. Check:
   - 6 stat cards have numbers
   - 3 section tabs (Enrolment & Outcomes, Academic Performance, Outcomes)
   - Year filter works (click dropdown, select 2025, chart updates)
   - No console errors
```

**SIE Page:**
```
1. Open http://localhost:3000/hemp/sie
2. Wait for loading → data
3. Check:
   - 6 stat cards have numbers (Total Applicants, Participants Selected, Female %, etc.)
   - NPS Score shows a number (7-8 range)
   - 3 section tabs work
   - Country filter shows real countries
   - No console errors
```

**Internships Page:**
```
1. Open http://localhost:3000/hemp/internships
2. Wait for loading → data
3. Check:
   - 6 stat cards have numbers (Total Applicants, Placements Secured, etc.)
   - Organization filter shows real organizations
   - Charts have data
   - 4 section tabs work
   - No console errors
```

**Career Development Page:**
```
1. Open http://localhost:3000/hemp/career-development
2. Wait for loading → data
3. Check:
   - Loads without error
   - Shows participant data
   - Filters work
   - No console errors
```

**At-a-Glance Page:**
```
1. Open http://localhost:3000/hemp
2. Wait for loading → data
3. Check:
   - Header shows "15 countries active" (or your number)
   - Stats cards display
   - Breakdown cards show percentages
   - No console errors (map errors are usually fine)
```

---

## Troubleshooting Quick Fixes

### Issue: "Loading..." never goes away
**Fix:**
```bash
# Check if Supabase credentials are correct
echo $NEXT_PUBLIC_SUPABASE_URL
# Should output: https://xxxxx.supabase.co

# Restart dev server
npm run dev
```

### Issue: "Failed to load data"
**Fix:**
```bash
# 1. Check Supabase is online
#    Go to supabase.com and login

# 2. Check .env.local exists
ls -la .env.local

# 3. Verify your API key has read permissions
#    Supabase Dashboard → Settings → API → Check anon key
```

### Issue: Stats show 0 or no data
**Fix:**
```bash
# Check if Supabase has data
# 1. Open Supabase Dashboard
# 2. Go to SQL Editor
# 3. Run:
SELECT COUNT(*) as total_rows FROM metric_values;
# Should return > 100
```

### Issue: TypeScript errors after changes
**Fix:**
```bash
npm run build
# Read the error message carefully
# Usually it's a missing type or wrong property name
```

---

## Performance Check

**Measure Load Time:**
```
1. Open Chrome DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Refresh page
5. Wait for page to fully load
6. Click Stop
7. Look for "Largest Contentful Paint" (LCP)
   - Should be < 2.5s for HEMP pages
   - Should be < 3s for at-a-glance (includes map)
```

---

## Mobile Testing

**Test Responsiveness:**
```
1. Press F12 to open DevTools
2. Click mobile icon (top left of DevTools)
3. Select "iPhone 14" (or any mobile device)
4. Reload page
5. Check:
   - Text is readable (not too small)
   - No horizontal scroll
   - Buttons are clickable
   - Charts fit screen
```

---

## Sign-Off Checklist

Before marking as "ready for production":

```
□ All 5 pages load without errors
□ No red errors in browser console
□ Stats cards display reasonable numbers
□ Filters work on each page
□ Mobile view looks good
□ Page load time < 3 seconds
□ Charts render with data
□ No TypeScript build errors
```

### If all ✅:
```bash
git add -A
git commit -m "Complete: Supabase integration testing passed"
git push
# Ready to deploy!
```

### If any ❌:
Note the issue and check TESTING_PLAN.md for detailed troubleshooting.

---

## Commands Cheat Sheet

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Check for TypeScript errors
npm run type-check

# Check console for errors
# Open browser DevTools (F12)
# Go to Console tab

# View Supabase data
# Go to https://supabase.com/dashboard

# Test specific page
# Just visit: http://localhost:3000/hemp/[page-name]
```

---

## What Success Looks Like

### Before Testing:
```
❌ Pages load but show "Loading..." indefinitely
❌ Stats cards are blank
❌ Console has red errors
```

### After Testing (Success):
```
✅ Pages load in < 2 seconds
✅ All stats cards display numbers
✅ All charts have data
✅ Filters work
✅ No red console errors
✅ Mobile view is responsive
```

---

**Estimated Time:** 30 minutes
**Difficulty:** Easy (mostly clicking and observing)
**No coding required:** ✅
