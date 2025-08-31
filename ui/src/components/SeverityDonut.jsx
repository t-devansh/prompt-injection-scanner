import { Card } from "flowbite-react";

function scoreFromCounts({ high = 0, medium = 0, low = 0 }) {
  const total = high + medium + low;
  if (!total) return 0;
  const weighted = high * 3 + medium * 2 + low * 1;
  return Math.round((weighted / (total * 3)) * 100); // 0..100
}

export default function SeverityDonut({ counts = { high: 0, medium: 0, low: 0 } }) {
  const size = 120;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;

  const pct = scoreFromCounts(counts);
  const dash = (pct / 100) * circ;

  let ringColor = "#16a34a"; // green
  if (pct >= 67) ringColor = "#ef4444"; // red
  else if (pct >= 34) ringColor = "#f59e0b"; // yellow

  return (
    <Card className="flex items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{pct}</div>
            <div className="text-xs text-gray-500">risk</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
