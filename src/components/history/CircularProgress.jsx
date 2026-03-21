/**
 * @fileoverview CircularProgress — SVG ring progress indicator.
 *
 * Renders an animated SVG circle that fills clockwise based on a percentage,
 * with the numeric percentage displayed in the center.
 *
 * @param {{ pct: number }} props  0–100 percentage value
 */
export function CircularProgress({ pct }) {
  const size = 52;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="circ-progress"
      aria-label={`${pct}% completado`}
      role="img"
    >
      {/* Track ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth={strokeWidth}
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#ffffff"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      {/* Center percentage text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        fontSize="11"
        fontWeight="800"
        fontFamily="Inter, sans-serif"
      >
        {pct}%
      </text>
    </svg>
  );
}
