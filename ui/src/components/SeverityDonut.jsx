import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, animate, useTransform } from "framer-motion";

// Weighted scoring function
// High = 100, Medium = 60, Low = 30
function scoreFromCounts({ high = 0, medium = 0, low = 0 }) {
  const total = high + medium + low;
  if (!total) return 0;

  const weighted =
    high * 100 + medium * 60 + low * 30; // weighted sum
  const avg = weighted / total; // average per finding
  return Math.round(avg); // scale already 0–100
}

export default function SeverityDonut({
  counts = { high: 0, medium: 0, low: 0 },
  size = 120,
  duration = 1.1,
}) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;

  const targetPct = useMemo(() => scoreFromCounts(counts), [counts]);

  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduced(mq.matches);
      const onChange = (e) => setReduced(e.matches);
      mq.addEventListener?.("change", onChange);
      return () => mq.removeEventListener?.("change", onChange);
    }
  }, []);

  const pctMV = useMotionValue(0);

  useEffect(() => {
    if (reduced) {
      pctMV.set(targetPct);
      return;
    }
    const controls = animate(pctMV, targetPct, {
      duration,
      ease: [0.2, 0.8, 0.2, 1],
    });
    return () => controls.stop();
  }, [targetPct, reduced, duration, pctMV]);

  const dashArray = useTransform(pctMV, (p) => {
    const dash = (p / 100) * circ;
    return `${dash} ${circ}`;
  });

  const [displayPct, setDisplayPct] = useState(0);
  useEffect(() => {
    const controls = animate(0, targetPct, {
      duration: reduced ? 0 : duration,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => setDisplayPct(Math.round(v)),
    });
    return () => controls.stop();
  }, [targetPct, reduced, duration]);

  let ringColor = "#16a34a"; // green
  if (targetPct >= 67) ringColor = "#ef4444"; // red
  else if (targetPct >= 34) ringColor = "#f59e0b"; // amber

  return (
    <div className="flex items-center justify-center">
      <motion.div
        key={targetPct}
        className="relative"
        style={{ width: size, height: size }}
        initial={reduced ? false : { scale: 0.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeDasharray={dashArray}
            initial={false}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center" aria-live="polite">
            <div className="text-2xl font-extrabold tabular-nums flex items-baseline justify-center gap-1">
              {displayPct}
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                %
              </span>
            </div>
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: reduced ? 0 : duration * 0.2,
                duration: reduced ? 0 : duration * 0.45,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              className="text-[10px] uppercase tracking-wide font-semibold text-gray-500"
            >
              risk
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
