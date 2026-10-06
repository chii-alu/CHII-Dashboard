# CHII Dashboard

**Live dashboards showing CHII's reach and impact across youth employment, entrepreneurship, and education programs.**

**Status at a glance:**
- ✅ **Executive Dashboard** — live with real Supabase data
- ✅ **HEMP Dashboard** — live and updating every 30 seconds
- 🔜 **HENT Dashboard** — in development
- 🔜 **HECO Dashboard** — awaiting data source
- 🔜 **Individual program views** — coming soon

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

The CHII Dashboard displays real-time outcomes and metrics:

- **Executive Dashboard** — Consolidated view of all program metrics, outreach impact, youth employment outcomes
- **HEMP Dashboard** — Health Entrepreneurship program metrics, participant outcomes, investment data
- **HENT Dashboard** — Health Enterprise program tracking (coming soon)
- **HECO Dashboard** — Health Economics program tracking (coming soon)

Each dashboard updates automatically every 30 seconds as Excel data syncs. You see:
- **KPI cards** — Headline numbers (total participants, employment rate, jobs created, etc.)
- **Charts** — Outcomes broken down by program, gender, country, or time
- **Live data** — Timestamp shows when data was last synced
- **"In coming data"** — Placeholder for charts where Supabase data isn't available yet

## How it works in one picture

```
┌──────────────────────┐
│   Excel Workbooks    │
│   (data entry)       │
└──────────┬───────────┘
           │
           │ (auto-sync every 30 seconds)
           ↓
┌──────────────────────┐
│   Supabase (live)    │  ← Single source of truth
│   PostgreSQL data    │
└──────────┬───────────┘
           │
           │ (automatic, every page load)
           ↓
┌──────────────────────┐
│  CHII Dashboard      │  ← What you see here
│  (this website)      │     (updates ~instantly)
└──────────────────────┘
```

**The golden rule:** Excel workbooks are edited directly. Every 30 seconds, data automatically syncs to Supabase. Everything you see on the dashboard comes from Supabase.

**How fast does it update?**
- When you edit Excel → syncs to Supabase within 30 seconds → dashboard updates within seconds
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

## Roadmap

### Coming next
- 🔜 **HENT Dashboard** — Complete with live data sync
- 🔜 **HECO Dashboard** — Launch with program-specific metrics
- 🔜 **Advanced filtering** — Filter across all dashboards simultaneously
- 🔜 **Impact analytics** — New charts for outcome tracking

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
