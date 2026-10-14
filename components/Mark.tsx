// The app mark: two circles, overlapping. Rendered both as the app icon and on the login page.
// Icons are left square: iOS and Android apply their own corner masks.
export function Mark({ size = 48, inline = false }: { size?: number; inline?: boolean }) {
  const r = size * 0.21;
  const cy = size / 2;
  const cx1 = size / 2 - r * 0.55;
  const cx2 = size / 2 + r * 0.55;
  const bg = inline ? "none" : "#f6f3ed";
  const ink = inline ? "currentColor" : "#1c1a17";
  const clay = "#b8532f";
  return (
    <div style={{ display: "flex", width: size, height: size, background: bg, borderRadius: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
        <circle cx={cx1} cy={cy} r={r} fill={ink} />
        <circle cx={cx2} cy={cy} r={r} fill={clay} fillOpacity={0.92} />
      </svg>
    </div>
  );
}
