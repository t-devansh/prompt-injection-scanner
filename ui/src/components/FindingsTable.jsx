// ui/src/components/FindingsTable.jsx
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Card,
} from "flowbite-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const cap = (s = "") =>
  s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : "";

function SeverityBox({ severity }) {
  const styles = {
    high: "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400",
    medium:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
    low: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
  };
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`px-3 py-1 rounded-lg text-sm font-semibold text-center min-w-[80px] ${styles[severity] || "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}
    >
      {cap(severity) || "Unknown"}
    </motion.div>
  );
}

function ConfidenceCell({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame;
    let start;
    const duration = 700; // ms
    function tick(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <span className="tabular-nums">{display}%</span>;
}

export default function FindingsTable({ findings = [], stickyHead = false }) {
  if (!findings.length) {
    return (
      <Card>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          No findings detected.
        </p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Table hoverable={true} className="min-w-full table-fixed">
        <TableHead
          className={
            stickyHead ? "sticky top-0 z-10 bg-white dark:bg-gray-800" : ""
          }
        >
          <TableRow>
            <TableHeadCell className="w-16">Rule</TableHeadCell>
            <TableHeadCell className="w-28">Severity</TableHeadCell>
            <TableHeadCell className="w-24">Confidence</TableHeadCell>
            <TableHeadCell className="w-64">Title</TableHeadCell>
            <TableHeadCell>Evidence</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {findings.map((f, idx) => {
            const sev = (f.severity || "").toLowerCase();
            return (
              <motion.tr
                key={idx}
                className="bg-white dark:bg-gray-900"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <TableCell className="px-4 py-2 font-mono break-words">
                  {f.rule_id}
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  <SeverityBox severity={sev} />
                </TableCell>
                <TableCell className="px-4 py-2 text-center font-mono">
                  <ConfidenceCell value={Math.round((f.confidence ?? 0) * 100)} />
                </TableCell>
                <TableCell className="px-4 py-2 whitespace-normal break-words">
                  {f.title || "-"}
                </TableCell>
                <TableCell className="px-4 py-2 whitespace-normal break-words">
                  {f.evidence?.length > 200
                    ? f.evidence.slice(0, 199) + "…"
                    : f.evidence || ""}
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
}
