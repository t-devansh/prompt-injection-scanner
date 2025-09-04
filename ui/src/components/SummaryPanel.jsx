import { Card } from "flowbite-react";
import SeverityDonut from "./SeverityDonut.jsx";
import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import warningIcon from "../assets/icons/warning_icon.svg";

function AnimatedCountBadge({
  label,
  value = 0,
  boxClass,
  textClass,
  delay = 0,
  growDuration = 0.8,
  countDuration = 0.9,
}) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const c = animate(mv, value, {
      duration: countDuration,
      delay: delay + growDuration * 0.7,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => c.stop();
  }, [value, delay, growDuration, countDuration, mv]);

  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: growDuration, delay, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ transformOrigin: "left" }}
      className={`overflow-hidden rounded-2xl ${boxClass}`}
    >
      <div
        className={`px-3 py-2 text-sm font-semibold flex items-center justify-between ${textClass}`}
      >
        <span className="truncate">{label}</span>
        <span className="tabular-nums">{display}</span>
      </div>
    </motion.div>
  );
}

export default function SummaryPanel({
  loading,
  error = "",
  counts = { high: 0, medium: 0, low: 0 },
  failOnTriggered = false,
  thresholdLabel = "None",
  className = "",
}) {
  const hasError = !!error;
  const key = useMemo(
    () => `${counts.high}-${counts.medium}-${counts.low}`,
    [counts]
  );

  return (
    <Card
      className={`h-full !bg-white/10 dark:!bg-white/5 !backdrop-blur-md !border !border-white/20 dark:!border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${className}`}
    >
      <div className="-mt-1 md:-mt-2 mb-3 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-gray-100">Scan Summary</h2>
      </div>

      {loading ? (
        <div
          role="status"
          className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2 animate-pulse"
          aria-busy="true"
        >
          <div className="flex justify-center sm:justify-start">
            <div className="relative w-[120px] h-[120px]">
              <div className="absolute inset-0 rounded-full bg-white/20" />
              <div className="absolute inset-4 rounded-full bg-white/10" />
            </div>
          </div>
          <div className="flex flex-col gap-3 max-w-[280px]">
            <div className="h-8 rounded-2xl bg-white/15" />
            <div className="h-8 rounded-2xl bg-white/15" />
            <div className="h-8 rounded-2xl bg-white/15" />
          </div>
          <span className="sr-only">Loading…</span>
        </div>
      ) : hasError ? (
        // Error UI
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <div className="flex justify-center sm:justify-start">
            <motion.img
              src={warningIcon}
              alt="Warning"
              className="w-[120px] h-[120px]"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-red-300">Scan failed</div>
            <p className="mt-1 text-sm text-gray-200">{error}</p>
          </div>
        </div>
      ) : failOnTriggered ? (
        // Threshold exceeded UI
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <div className="flex justify-center sm:justify-start">
            <motion.img
              src={warningIcon}
              alt="Threshold exceeded"
              className="w-[120px] h-[120px]"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold text-red-300">Threshold exceeded</div>
            <p className="text-sm text-gray-200">
              Findings were detected at or above your configured{" "}
              <span className="font-semibold">Threshold: {thresholdLabel}</span>
            </p>
            <p className="text-xs text-gray-300">Findings are still listed on the right for review.</p>
          </div>
        </div>
      ) : (
        // Normal donut + badges
        <div key={key} className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <div className="flex justify-center sm:justify-start">
            <SeverityDonut counts={counts} />
          </div>
          <div className="flex flex-col gap-2 max-w-[280px]">
            <AnimatedCountBadge
              label="High"
              value={counts.high}
              boxClass="border-2 border-red-400/70 bg-red-400/10"
              textClass="text-red-200"
              delay={0}
            />
            <AnimatedCountBadge
              label="Medium"
              value={counts.medium}
              boxClass="border-2 border-amber-300/70 bg-amber-300/10"
              textClass="text-amber-100"
              delay={0.22}
            />
            <AnimatedCountBadge
              label="Low"
              value={counts.low}
              boxClass="border-2 border-emerald-300/70 bg-emerald-300/10"
              textClass="text-emerald-100"
              delay={0.44}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
