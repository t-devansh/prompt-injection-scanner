import { useMemo, useState, useRef, useEffect } from "react";
import {
  Card,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "flowbite-react";
import FindingsTable from "./FindingsTable.jsx";
import { getReport } from "../lib/api";

export default function ResultsPanel({ loading, error = "", result, payload, className = "" }) {
  const [reportLoading, setReportLoading] = useState(false);
  const [sevFilter, setSevFilter] = useState("all"); // all | high | medium | low
  const [openFilter, setOpenFilter] = useState(false);

  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const hasError = !!error;

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!openFilter) return;
      if (btnRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setOpenFilter(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openFilter]);

  if (!loading && !result && !hasError) return null;

  const findings = result?.findings || [];
  const filteredFindings = useMemo(() => {
    if (sevFilter === "all") return findings;
    return findings.filter((f) => (f.severity || "").toLowerCase() === sevFilter);
  }, [findings, sevFilter]);

  const canDownload = !!payload && !reportLoading && !hasError;

  const onDownloadReport = async () => {
    if (!payload || reportLoading || hasError) return;
    setReportLoading(true);
    try {
      const htmlReport = await getReport(payload);
      const blob = new Blob([htmlReport], { type: "text/html" });
      const urlObj = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      a.href = urlObj;
      a.download = `scan-report-${ts}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlObj);
    } catch (err) {
      console.error("Download report failed:", err);
      alert("Failed to download report");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <Card
      className={`flex h-full flex-col !bg-white/10 dark:!bg-white/5 !backdrop-blur-md !border !border-white/20 dark:!border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${className}`}
    >
      {/* Header + controls */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-gray-100">Scan Findings</h2>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="relative">
            <button
              ref={btnRef}
              type="button"
              onClick={() => setOpenFilter((v) => !v)}
              className="inline-flex items-center text-gray-100 bg-white/10 backdrop-blur-md border border-white/20
                         focus:outline-none hover:bg-white/20 focus:ring-4 focus:ring-white/10 font-medium rounded-lg
                         text-sm px-5 py-2.5"
              disabled={loading || hasError}
            >
              {/* filter icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
                className="w-4 h-4 me-3 text-gray-200"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              {sevFilter === "all" ? "All Severities" : sevFilter[0].toUpperCase() + sevFilter.slice(1)}
              <svg
                className="w-2.5 h-2.5 ms-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
              </svg>
            </button>

            {openFilter && (
              <div
  ref={menuRef}
  className="z-50 absolute left-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/20
             rounded-lg shadow-lg text-gray-100"
>

                <ul className="p-3 space-y-1 text-sm" aria-label="Severity filter">
                  {[
                    { value: "all", label: "All Severities" },
                    { value: "high", label: "High" },
                    { value: "medium", label: "Medium" },
                    { value: "low", label: "Low" },
                  ].map((opt) => (
                    <li key={opt.value}>
                      <label
                        htmlFor={`sev-${opt.value}`}
                        className="flex items-center p-2 rounded-sm hover:bg-white/10 cursor-pointer"
                      >
                        <input
                          id={`sev-${opt.value}`}
                          type="radio"
                          name="sev-filter"
                          value={opt.value}
                          checked={sevFilter === opt.value}
                          onChange={() => {
                            setSevFilter(opt.value);
                            setOpenFilter(false);
                          }}
                          className="w-4 h-4 text-blue-400 bg-transparent border-white/30 focus:ring-blue-400 focus:ring-2"
                        />
                        <span className="w-full ms-2 text-sm font-medium">{opt.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Download */}
          <button
            type="button"
            onClick={onDownloadReport}
            disabled={!canDownload || loading}
            className="flex items-center gap-2 text-white border border-blue-400/70 hover:bg-blue-500/20
                       focus:ring-4 focus:outline-none focus:ring-blue-300/30 font-medium rounded-lg text-sm px-5 py-2.5
                       disabled:opacity-50 disabled:pointer-events-none"
          >
            {reportLoading ? (
              <>
                <Spinner size="sm" />
                Downloading…
              </>
            ) : (
              "Download report"
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <>
          <div className="mb-3 space-y-2 animate-pulse">
            <div className="h-3 w-64 rounded bg-white/20" />
            <div className="h-3 w-80 rounded bg-white/20" />
          </div>

          <div
            className="thin-scrollbar flex-1 overflow-y-auto overflow-x-hidden rounded border border-white/15"
            role="status"
            aria-busy="true"
          >
            <Table className="min-w-full table-fixed">
              <TableHead className="sticky top-0 z-10 bg-white/10 backdrop-blur-md">
                <TableRow>
                  <TableHeadCell className="w-20 text-gray-100">Rule</TableHeadCell>
                  <TableHeadCell className="w-32 text-gray-100">Severity</TableHeadCell>
                  <TableHeadCell className="w-32 text-gray-100">Confidence</TableHeadCell>
                  <TableHeadCell className="w-72 text-gray-100">Title</TableHeadCell>
                  <TableHeadCell className="text-gray-100">Evidence</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y divide-white/10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="bg-white/5 animate-pulse">
                    <TableCell className="px-4 py-3 align-top">
                      <div className="h-3 w-10 rounded bg-white/20" />
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      <div className="mx-auto h-6 w-[92px] rounded-full bg-white/20" />
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      <div className="mx-auto h-3 w-12 rounded bg-white/20" />
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      <div className="h-3 w-3/4 rounded bg-white/20" />
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      <div className="space-y-2">
                        <div className="h-3 w-11/12 rounded bg-white/20" />
                        <div className="h-3 w-10/12 rounded bg-white/20" />
                        <div className="h-3 w-8/12 rounded bg-white/20" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <span className="sr-only">Loading findings…</span>
          </div>
        </>
      ) : hasError ? (
        <>
          <div className="thin-scrollbar flex-1 overflow-y-auto overflow-x-hidden rounded border border-white/15">
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div>
                <svg
                  className="mx-auto mb-3 h-14 w-14 text-gray-300"
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="10" y="6" width="22" height="30" rx="2" ry="2" fill="none" />
                  <circle cx="30" cy="30" r="7" />
                  <line x1="26" y1="26" x2="34" y2="34" />
                  <line x1="34" y1="26" x2="26" y2="34" />
                  <line x1="36" y1="36" x2="42" y2="42" strokeLinecap="round" />
                </svg>
                <div className="text-sm font-semibold text-gray-100">Findings Unavailable</div>
                <p className="mt-1 text-sm text-gray-300">The last scan failed. Adjust your target or try again.</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="mb-3 text-xs text-gray-300">
            Target: <span className="font-mono">{result?.summary?.target}</span> · Scanned at:{" "}
            <span className="font-mono">{result?.summary?.scanned_at}</span>
          </p>

          <div className="thin-scrollbar flex-1 overflow-y-auto overflow-x-hidden rounded border border-white/15">
            <FindingsTable findings={filteredFindings} stickyHead />
          </div>
        </>
      )}
    </Card>
  );
}
  