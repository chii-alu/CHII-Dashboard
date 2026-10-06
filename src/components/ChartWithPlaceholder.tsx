import React from 'react';

interface ChartWithPlaceholderProps {
  data: any;
  height?: number;
  children: React.ReactNode;
}

export function ChartWithPlaceholder({
  data,
  height = 250,
  children
}: ChartWithPlaceholderProps) {
  // Show placeholder if data is null, undefined, or empty array
  const hasNoData = !data || (Array.isArray(data) && data.length === 0);

  if (hasNoData) {
    return (
      <div style={{
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9CA3AF"
      }}>
        <p style={{
          fontSize: 14,
          fontWeight: 400,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          In coming data
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
