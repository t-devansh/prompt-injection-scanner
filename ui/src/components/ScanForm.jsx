import { useState } from "react";
import { Card, TextInput, Textarea, Button, Spinner, Badge } from "flowbite-react";
import { scan, getReport } from "../lib/api";
import FindingsTable from "./FindingsTable.jsx";
import SummaryChips from "./SummaryChips.jsx";

export default function ScanForm() {
  const [mode, setMode] = useState("url"); // "url" | "html"
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const hasInput = mode === "url" ? Boolean(url) : Boolean(html);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const payload = mode === "url" ? { url } : { html };
      const data = await scan(payload);
      setResult(data);
    } catch (err) {
      setError(err.message || "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  const onDownloadReport = async () => {
    if (!hasInput || reportLoading) return;
    setError("");
    setReportLoading(true);
    try {
      const payload = mode === "url" ? { url } : { html };
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
      setError(err.message || "Report failed");
    } finally {
      setReportLoading(false);
    }
  };

  const counts = result?.summary?.counts || { high: 0, medium: 0, low: 0 };

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-3">
          <Button
            type="button"
            color={mode === "url" ? "info" : "light"}
            onClick={() => setMode("url")}
          >
            URL mode
          </Button>
          <Button
            type="button"
            color={mode === "html" ? "info" : "light"}
            onClick={() => setMode("html")}
          >
            HTML mode
          </Button>
        </div>

        {/* Inputs */}
        {mode === "url" ? (
          <TextInput
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        ) : (
          <Textarea
            rows={6}
            placeholder="<div>Paste HTML here</div>"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
          />
        )}

        {/* Actions + counts */}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={loading || !hasInput}>
            {loading ? <Spinner size="sm" /> : "Scan"}
          </Button>

          <Button
            type="button"
            color="light"
            disabled={reportLoading || !hasInput}
            onClick={onDownloadReport}
          >
            {reportLoading ? <Spinner size="sm" /> : "Download report"}
          </Button>

          {result && (
            <div className="flex gap-2">
              <Badge color="failure">High: {counts.high}</Badge>
              <Badge color="warning">Medium: {counts.medium}</Badge>
              <Badge color="success">Low: {counts.low}</Badge>
            </div>
          )}
        </div>

        {/* Errors */}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Summary + Findings table + optional raw JSON */}
        {result && (
          <>
            <div className="mt-3 space-y-3">
              <SummaryChips counts={result.summary?.counts} />

              <p className="text-sm text-gray-500">
                Target: <span className="font-mono">{result.summary?.target}</span> · Scanned at:{" "}
                <span className="font-mono">{result.summary?.scanned_at}</span>
              </p>

              <FindingsTable findings={result.findings || []} />

              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-gray-500">Raw JSON</summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
{JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          </>
        )}

      </form>
    </Card>
  );
}
