// Helpers for per-host charts. Hosts come from the database; colours are assigned by position.

export type HostRow = { organization: string; item: string | null; year: number | null; value: number };
export type HostMetrics = Record<string, HostRow[]>;

// Palette cycled by position in the sorted host list, so a new host gets a colour without a code change.
export const HOST_PALETTE = ["#14306B", "#479BD6", "#0F6E56", "#D45F2C", "#9333EA", "#EAB308", "#16A34A", "#6B7280"];
export const hostColor = (index: number) => HOST_PALETTE[index % HOST_PALETTE.length];

/** Every host name: the organizations table plus any host that appears in the rows, A–Z. */
export function hostNameList(orgNames: string[], metrics: HostMetrics): string[] {
  const names = new Set<string>(orgNames);
  Object.values(metrics).forEach(rows => rows.forEach(r => names.add(r.organization)));
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

export const hasMetric = (metrics: HostMetrics, metric: string) => (metrics[metric]?.length ?? 0) > 0;

/** Sum of a host's rows for one metric and item. year null is the Current Total. Null when there is no row. */
function valueOf(metrics: HostMetrics, metric: string, host: string, year: number | null, item: string | null = null): number | null {
  const rows = (metrics[metric] ?? []).filter(r => r.organization === host && r.year === year && (r.item ?? null) === item);
  return rows.length === 0 ? null : rows.reduce((sum, r) => sum + r.value, 0);
}

/** One row per host: { name, [seriesKey]: value }, largest first by the first series. Hosts with no value are left out. */
export function hostBars(metrics: HostMetrics, series: Record<string, string>, year: number | null, names: string[]) {
  const keys = Object.keys(series);
  return names
    .map(name => {
      const row: Record<string, string | number | null> = { name };
      keys.forEach(k => { row[k] = valueOf(metrics, series[k], name, year); });
      return row;
    })
    .filter(row => keys.some(k => row[k] !== null))
    .sort((a, b) => ((b[keys[0]] as number) ?? 0) - ((a[keys[0]] as number) ?? 0));
}

/** Top n hosts, with everything after them grouped as "Other". Used where a chart would be too crowded. */
export function topWithOther<T extends Record<string, any>>(list: T[], key: string, n = 8): (T | { name: string; [k: string]: any })[] {
  if (list.length <= n) return list;
  const rest = list.slice(n);
  const other = rest.reduce((sum, row) => sum + ((row[key] as number) ?? 0), 0);
  return [...list.slice(0, n), { name: "Other", [key]: other }];
}

/** Departments for the stacked host chart: one row per host, one key per department (the item). */
export function departmentBars(metrics: HostMetrics, metric: string, year: number | null, names: string[]) {
  const departments = Array.from(new Set((metrics[metric] ?? []).map(r => r.item).filter((d): d is string => !!d)));
  const data = names
    .map(name => {
      const row: Record<string, string | number | null> = { organization: name };
      departments.forEach(d => { row[d] = valueOf(metrics, metric, name, year, d); });
      return row;
    })
    .filter(row => departments.some(d => row[d] !== null));
  return { data, departments };
}
