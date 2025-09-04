import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Card } from "flowbite-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const cap = (s = "") => (s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : "");

function SeverityBox({ severity }) {
  const styles = {
    high: "bg-red-400/15 text-red-200",
    medium: "bg-amber-300/15 text-amber-100",
    low: "bg-emerald-300/15 text-emerald-100",
  };
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`px-3 py-1 rounded-lg text-sm font-semibold text-center min-w-[80px] ${
        styles[severity] || "bg-white/10 text-gray-200"
      }`}
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
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <span className="tabular-nums text-white">{display}%</span>;
}

export default function FindingsTable({ findings = [], stickyHead = false }) {
  if (!findings.length) {
    return (
      <Card className="!bg-white/10 dark:!bg-white/5 !backdrop-blur-md !border !border-white/20 dark:!border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <p className="text-sm text-gray-200">No findings detected.</p>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Table hoverable={true} className="min-w-full table-fixed bg-slate-900">
        <TableHead className={stickyHead ? "sticky top-0 z-10 bg-white/10 backdrop-blur-md" : ""}>
          <TableRow>
            <TableHeadCell className="w-16 text-gray-100">Rule</TableHeadCell>
            <TableHeadCell className="w-28 text-gray-100">Severity</TableHeadCell>
            <TableHeadCell className="w-24 text-gray-100">Confidence</TableHeadCell>
            <TableHeadCell className="w-64 text-gray-100">Title</TableHeadCell>
            <TableHeadCell className="text-gray-100">Evidence</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y divide-white/10">
          {findings.map((f, idx) => {
            const sev = (f.severity || "").toLowerCase();
            return (
              <motion.tr
                key={idx}
                className="bg-white/5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <TableCell className="px-4 py-2 font-mono break-words text-gray-100">{f.rule_id}</TableCell>
                <TableCell className="px-4 py-2 text-center">
                  <SeverityBox severity={sev} />
                </TableCell>
                <TableCell className="px-4 py-2 text-center font-mono">
                  <ConfidenceCell value={Math.round((f.confidence ?? 0) * 100)} />
                </TableCell>
                <TableCell className="px-4 py-2 whitespace-normal break-words text-gray-100">
                  {f.title || "-"}
                </TableCell>
                <TableCell className="px-4 py-2 whitespace-normal break-words text-gray-100">
                  {f.evidence?.length > 200 ? f.evidence.slice(0, 199) + "…" : f.evidence || ""}
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
}
