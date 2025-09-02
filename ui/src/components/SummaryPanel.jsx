import { Card } from "flowbite-react";
import SeverityDonut from "./SeverityDonut.jsx";
import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import warningIcon from "../assets/icons/warning_icon.svg"; // ✅ Import image path

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
    <Card className={`h-full ${className}`}>
      <div className="-mt-1 md:-mt-2 mb-3 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-200">
          Scan Summary
        </h2>
      </div>

      {loading ? (
        <div
          role="status"
          className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2 animate-pulse"
          aria-busy="true"
        >
          <div className="flex justify-center sm:justify-start">
            <div className="relative w-[120px] h-[120px]">
              <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="absolute inset-4 rounded-full bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
          <div className="flex flex-col gap-3 max-w-[280px]">
            <div className="h-8 rounded-2xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-8 rounded-2xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-8 rounded-2xl bg-gray-200 dark:bg-gray-700" />
          </div>
          <span className="sr-only">Loading…</span>
        </div>
      ) : hasError ? (
        // Error UI
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <div className="flex justify-center sm:justify-start">
            {/* ✅ Animated custom warning icon */}
            <motion.img
              src={warningIcon}
              alt="Warning"
              className="w-[120px] h-[120px]"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: "easeInOut",
              }}
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-red-600 dark:text-red-400">
              Scan failed
            </div>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {error}
            </p>
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
              transition={{
                repeat: Infinity,
                duration: 1.8,
                ease: "easeInOut",
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold text-red-600 dark:text-red-400">
              Threshold exceeded
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Findings were detected at or above your configured{" "}
              <span className="font-semibold">Threshold: {thresholdLabel}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Findings are still listed on the right for review.
            </p>
          </div>
        </div>
      ) : (
        // Normal donut + badges
        <div
          key={key}
          className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2"
        >
          <div className="flex justify-center sm:justify-start">
            <SeverityDonut counts={counts} />
          </div>
          <div className="flex flex-col gap-2 max-w-[280px]">
            <AnimatedCountBadge
              label="High"
              value={counts.high}
              boxClass="border-2 border-red-500 bg-red-500/10 dark:border-red-400 dark:bg-red-400/10"
              textClass="text-red-600 dark:text-red-400"
              delay={0}
            />
            <AnimatedCountBadge
              label="Medium"
              value={counts.medium}
              boxClass="border-2 border-amber-500 bg-amber-500/10 dark:border-amber-400 dark:bg-amber-400/10"
              textClass="text-amber-600 dark:text-amber-400"
              delay={0.22}
            />
            <AnimatedCountBadge
              label="Low"
              value={counts.low}
              boxClass="border-2 border-emerald-500 bg-emerald-500/10 dark:border-emerald-400 dark:bg-emerald-400/10"
              textClass="text-emerald-600 dark:text-emerald-400"
              delay={0.44}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
