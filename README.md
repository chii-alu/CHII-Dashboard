# CHII Dashboard

**Live dashboards showing CHII's reach and impact across youth employment, entrepreneurship, and education programs.**

**Status at a glance:**
- ✅ **Executive Dashboard** — live and updating from Supabase
- ✅ **Outreach** — showing real data with live metrics
- ✅ **Youth in Work** — live participant metrics
- 🔜 **Wage Employment** — ready for Supabase data
- 🔜 **Further Education** — awaiting data source
- 🔜 **HEMP, HENT, HECO programs** — individual dashboards coming

---

## Start here: Find your section

| I... | Jump to |
|---|---|
| **Enter data in spreadsheets or databases** | [Part B: For the Data Team](#part-b-for-the-data-team) |
| **Look at the dashboard to make decisions** | [How it works in one picture](#how-it-works-in-one-picture) and [What the dashboard shows](#what-the-dashboard-shows) |
| **Maintain the code, database, or sync** | [Part C: For the Technical Team](#part-c-for-the-technical-team) |
| **Something isn't working or looks wrong** | [When something goes wrong](#when-something-goes-wrong) |
| **I need a definition** | [Glossary](#glossary) |

---

# Part A: For Everyone

## What the dashboard shows

The CHII Dashboard displays outcomes across all our programs:

- **Outreach** — How many people we've reached, their demographics, how many completed programs
- **Youth in Work** — Employment status, types of work, quality of jobs, time from graduation to employment
- **Wage Employment** — Salary levels, sector distribution, work quality indicators
- **Further Education** — Participants continuing their studies
- **At a Glance** — Key summary metrics across all programs

Each section updates automatically when the source data changes. You see:
- **KPI cards** — The headline numbers (total participants, employment rate, etc.)
- **Charts** — How outcomes break down by program, gender, country, or time
- **Data quality** — Last updated timestamp and data source for every page
- **"In coming data"** — Charts that don't have data yet (they're not broken; we're still collecting)

## How it works in one picture

```
┌─────────────────────┐
│   Supabase (live)   │  ← The single source of truth
│   PostgreSQL data   │     (only place to add/change data)
└──────────┬──────────┘
           │
           │ (automatic, every page load)
           ↓
┌─────────────────────┐
│  CHII Dashboard     │  ← What you see here
│  (this website)     │     (updates ~instantly)
└─────────────────────┘
```

**The golden rule:** Supabase is the only place to change data. Everything you see on the dashboard comes from there.

**How fast does it update?**
- When source data changes in Supabase → dashboard updates within seconds
- No manual refresh needed; just reload the page to see the latest

## Who looks after what

| What | Owner | Contact |
|---|---|---|
| **Executive Dashboard code** | Engineering | [TBD] |
| **Supabase database & data** | Data team | [TBD] |
| **Data entry workflows** | Program managers | [TBD] |
| **Deployment & hosting** | DevOps | [TBD] |
| **Troubleshooting & support** | Engineering | [TBD] |

---

# Part B: For the Data Team

## Everyday routine

1. **Update data in Supabase** (via the app, API, or direct SQL)
2. **Open the dashboard** (or refresh if already open)
3. **Check the page updated** — Last updated timestamp should show your recent change
4. **If something doesn't match**, let engineering know immediately with:
   - What you changed
   - What you expected to see
   - What you actually saw
   - Screenshot if helpful

## Rules that keep the dashboard working

### Do ✅

| Rule | Why |
|---|---|
| Keep one version of each data table in Supabase | Prevents duplicate or conflicting data |
| Enter numbers as numbers, not text | Charts and calculations break with text |
| Use empty cells or NULL for missing data | "In coming data" shows only when data is actually missing |
| Keep data consistent (e.g., same country spellings) | Charts group data correctly |

### Don't ❌

| Rule | Why |
|---|---|
| Rename database tables or column headers | The dashboard code breaks if names change |
| Manually type totals; use formulas instead | Totals sync correctly with updated records |
| Add test data to live tables | Real dashboards show fake numbers |
| Edit dashboard code if you're not a developer | You might break something; ask engineering instead |

## Common tasks

### Adding a new year of data
1. **Contact:** Engineering
2. **What they'll do:** Update Supabase to accept the new year, update API endpoints to include it
3. **Time:** Usually 1–2 days

### Adding a new program
1. **Contact:** Data team lead
2. **What to do:**
   - Add program row to the `programs` table in Supabase
   - Add a new sheet in the source workbook (if using sheets)
   - Notify engineering to update dashboard filters
3. **Time:** Usually 1 day

### Adding a new country or region
1. **Contact:** Data team lead
2. **What to do:**
   - Add country to `countries` table in Supabase
   - Update any regional groupings/hierarchies
   - Notify engineering if new filters needed
3. **Time:** Usually a few hours

### Fixing data entry mistakes
1. **In Supabase:** Correct the record directly
2. **Don't:** Try to "undo" — just fix the value
3. **Tell:** Engineering if you think the dashboard should have caught this, so we can add validation

## Known issues to fix

| Issue | Impact | Status |
|---|---|---|
| Missing 2025–2026 data in Youth in Work | Charts show old data only | In progress |
| Supabase sync not running | Dashboard goes stale | Monitoring |
| Duplicate country names in some tables | Charts group wrong data | [TBD] |

---

# Part C: For the Technical Team

## Technical overview

**Stack:**
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts
- **Backend:** Supabase (PostgreSQL), Row Level Security, custom API routes
- **Hosting:** Vercel (auto-deploy from main branch)
- **Data sync:** Python scripts (to be always-on; currently manual)
- **Icons:** lucide-react

**Never commit these files:**
- `.env.local` — contains Supabase keys
- `.env` — environment config
- `node_modules/` — dependency files

**Repository structure:**
```
src/
├── app/
│   ├── api/                      # API routes (server-side data fetching)
│   │   ├── youth-in-work-participants/
│   │   ├── outreach-breakdown/
│   │   ├── outreach-data/
│   │   └── ...
│   ├── executive/                # Executive dashboard pages
│   │   ├── at-a-glance/
│   │   ├── outreach/
│   │   ├── youth-in-work/
│   │   ├── wage-employment/
│   │   ├── further-education/
│   │   └── layout.tsx
│   └── layout.tsx
├── components/
│   ├── ChartWithPlaceholder.tsx   # Auto-placeholder for missing data
│   ├── MetadataHeader.tsx         # Consistent header w/ last-updated
│   ├── charts/
│   └── ui/
├── styles/
│   └── globals.css               # Theme variables (31+ CSS custom properties)
└── data/
    └── executive/                # Legacy seed data (fallbacks)
```

## Setup and running

### Prerequisites
```
Node.js 18+
npm or yarn
Supabase account (with database provisioned)
```

### Install and run locally

```bash
git clone <repo>
cd CHII-Dashboard
npm install

# Create .env.local with these variables:
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EOF

npm run dev
# Opens http://localhost:3000
```

### Environment variables

| Variable | Purpose | Public or Secret |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Public (in client code) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon key for client-side reads | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side writes (admin access) | **Secret** — server only |

### Deployment (Vercel)

1. Connect repo to Vercel
2. Add environment variables in Vercel project settings (same as above)
3. Push to `main` branch → auto-deploy
4. Manual redeploy: Vercel dashboard → Deployments → Redeploy if needed

## Data model and app code

### Supabase: Primary table `v_metric_values`

```sql
CREATE TABLE v_metric_values (
  dashboard TEXT,        -- 'EXEC', 'OUTREACH', 'YOUTH_IN_WORK', etc.
  section TEXT,          -- 'At a Glance', 'Youth in Work', etc.
  metric TEXT,           -- 'Participants', 'Jobs Created (Total)', etc.
  segment TEXT,          -- 'all', program name, gender, etc.
  value NUMERIC,         -- The actual number
  year INT,              -- NULL for current/summary
  updated_at TIMESTAMP   -- When last changed
);
```

**Data conventions:**
- `year = NULL` → Current total (not a specific year)
- Percentages stored as 0–100 (not 0–1)
- Empty cells → NULL, not 0
- Always use actual Supabase data; never synthesize missing breakdowns

### Key components

#### ChartWithPlaceholder
Automatically shows "In coming data" when data is null or empty:

```tsx
<ChartWithPlaceholder data={chartData} height={250}>
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={chartData}>
      {/* Chart elements */}
    </BarChart>
  </ResponsiveContainer>
</ChartWithPlaceholder>
```

#### MetadataHeader
Displays title, subtitle, data source, period, participant count, last-updated:

```tsx
<MetadataHeader
  title="Outreach"
  subtitle="Participant demographics and outcomes"
  dataSource="Supabase v_metric_values"
  lastUpdated="October 6, 2026, 14:30 CAT"
  participantsCount={1529}
  period="2022–2026"
/>
```

### Adding a new dashboard page

1. Create folder `src/app/executive/[page-name]/`
2. Add `page.tsx` with data fetching and charts
3. Wrap charts with `ChartWithPlaceholder`
4. Add navigation link in layout
5. Update README roadmap

### Debugging

**"In coming data" on all charts?**
→ Check Supabase has data: `SELECT * FROM v_metric_values LIMIT 1;`

**Dashboard shows stale data?**
→ Hard refresh (Cmd+Shift+R) or check Vercel deployment status

**API endpoint returning null?**
→ Check environment variables, Supabase query, RLS policies

---

# Part D: For Everyone Again

## When something goes wrong

### What you might notice (everyone)

| You see | Likely cause | What to do |
|---|---|---|
| "In coming data" on a chart | Data not in Supabase yet (not a bug) | Wait or ask data team |
| Old numbers that don't match your change | Browser cache | Hard refresh (Cmd+Shift+R) |
| **Error message on the page** | Dashboard or database issue | [See below](#error-messages) |
| Timestamp says "Loading..." | Network delay | Wait 5 seconds and refresh |
| One chart missing, others fine | That data isn't in Supabase | Expected; "In coming data" shows |

### Error messages (technical)

| Error | Cause | Fix |
|---|---|---|
| `Cannot read properties of null` | Code trying to use missing data | Check Supabase query, RLS policies |
| `NEXT_PUBLIC_SUPABASE_URL is undefined` | Missing environment variable | Add `.env.local` with correct values |
| `403 Forbidden from Supabase` | RLS policy blocking read | Check database permissions |
| `502 Bad Gateway` | Vercel or Supabase down | Wait a few minutes, check status pages |

**Can't fix it?** Contact the engineering team with:
- URL where you see the error
- Screenshot of the error
- What you were doing when it happened
- Your browser and OS (e.g., "Chrome 120 on macOS")

## Security and privacy

### Plain version (everyone)
- **Public:** All dashboard pages are viewable without login (for now)
- **Private:** Your login and profile (when login is added)
- **How we keep data safe:** Passwords are encrypted, database access is restricted to the team

### Technical version (developers)

**Current state:**
- Anonymous read access to `v_metric_values` (no login required)
- Row Level Security (RLS) policies limit what each role can see
- Service role key (secret) used only for admin writes from API routes
- All data in transit encrypted (HTTPS)

**Before public launch:**
1. Add login page (Supabase Auth)
2. Restrict dashboard to authenticated users only
3. Add per-role access control (who can see which sections)
4. Audit logs for all data changes

**Keys that are secret:**
- `SUPABASE_SERVICE_ROLE_KEY` — never share, never commit
- Google API key (if sheets sync added) — same
- Never log these in error messages

## Roadmap

### Coming next (by end of 2026)
- 🔜 **Login page** — restrict dashboard to team members
- 🔜 **HENT & HECO dashboards** — same layout as HEMP, with their data
- 🔜 **Always-on sync** — Python script running 24/7 instead of manual updates
- 🔜 **Further Education data** — add real data source and activate charts

### Later (2027)
- 📋 Impact stories tied to outcomes
- 📋 Program manager dashboards (filtered by their program)
- 📋 Map visualization of geographic reach
- 📋 PDF report export

### Descoped (won't do)
- Forecasting model (too complex, not needed yet)
- Mobile app (web dashboard works on mobile)

## Glossary

| Term | Meaning |
|---|---|
| **Supabase** | Database and backend service we use (like Google Firebase, but with PostgreSQL) |
| **API route** | Code on the server that fetches data and sends it to the webpage |
| **Row Level Security (RLS)** | Database rules that control who can see which rows |
| **Service role key** | Admin password for the database (secret, server-only) |
| **Anon key** | Public password for basic reads (safe to put in browser code) |
| **Segment** | A breakdown category (e.g., by gender, program, country) |
| **Metric** | A measured outcome (e.g., "Participants", "Jobs Created") |
| **In coming data** | Data is missing (charts show this; it's not an error) |
| **Hard refresh** | Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows) — clears cached version |
| **Vercel** | Hosting service that runs this website |
| **Deploy** | Upload new code version to Vercel |
| **Sync** | Automatic data transfer (e.g., from Google Sheets → Supabase) |
| **PostgreSQL** | The database software Supabase uses |
| **RLS policies** | Rules in Supabase that enforce who can see what data |

---

## Questions?

Check the relevant section above, or contact your team lead. If you found a bug or have a feature idea, open an issue on GitHub.

**Last updated:** October 6, 2026
