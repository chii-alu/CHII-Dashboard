'use client';

import { useDashboardData } from '@/hooks/useDashboardData';
import { getHeadlines, getLastSync } from '@/lib/dashboardData';

/**
 * Example: Executive headline figures
 * Shows the pattern for using useDashboardData hook with dashboard functions
 */
export function ExecutiveSnapshot() {
  const { data: headlines, loading: headlinesLoading, error: headlinesError } =
    useDashboardData(() => getHeadlines('EXEC', 'At a Glance'), []);

  const { data: syncInfo, loading: syncLoading, error: syncError } = useDashboardData(
    () => getLastSync(),
    []
  );

  if (headlinesLoading || syncLoading) {
    return <div className="p-4 text-center">Loading dashboard data…</div>;
  }

  if (headlinesError) {
    return (
      <div className="p-4 text-center text-red-600">
        Couldn't load the data: {headlinesError}
      </div>
    );
  }

  const execSync = syncInfo?.find((s) => s.dashboard === 'EXEC');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">CHII Executive Dashboard</h1>

      {/* Headlines grid */}
      <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-3 lg:grid-cols-4">
        {headlines?.map((card) => (
          <div
            key={card.metric}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="text-sm text-gray-600 font-medium uppercase mb-2">
              {card.metric}
            </div>

            <div className="text-3xl font-bold text-blue-900 mb-3">
              {card.value?.toLocaleString()}
            </div>

            {card.female !== undefined && (
              <div className="text-xs text-gray-500 space-y-1 mb-3">
                <div>👩 Female: {card.female?.toLocaleString()}</div>
                {card.male !== undefined && (
                  <div>👨 Male: {card.male?.toLocaleString()}</div>
                )}
              </div>
            )}

            {card.progress !== undefined && (
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(card.progress, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600">
                  {card.progress}% of goal
                  {card.target && ` (${card.target?.toLocaleString()} target)`}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Data freshness indicator */}
      {execSync && (
        <div className="text-sm text-gray-600 text-center border-t pt-4">
          Data as of <strong>{execSync.syncedAt}</strong>
        </div>
      )}
    </div>
  );
}
