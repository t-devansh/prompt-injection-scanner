import { useState } from "react";
import { Card, TextInput, Textarea, Button, Spinner } from "flowbite-react";
import { scan, getReport } from "../lib/api";

export default function ScanForm({ onStart, onResult, onClear }) {
  const [mode, setMode] = useState("url"); // "url" | "html"
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");

  const hasInput = mode === "url" ? Boolean(url) : Boolean(html);

  const payload = () => (mode === "url" ? { url } : { html });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    onStart?.();
    try {
      const data = await scan(payload());
      onResult?.(data);
    } catch (err) {
      setError(err.message || "Scan failed");
      onResult?.(null); // let parent know it's done (no result)
    } finally {
      setLoading(false);
    }
  };

  const onDownloadReport = async () => {
    if (!hasInput || reportLoading) return;
    setError("");
    setReportLoading(true);
    try {
      const htmlReport = await getReport(payload());
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

  const doClear = () => {
    setUrl("");
    setHtml("");
    setError("");
    onClear?.();
  };

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Mode toggle (component 1 top) */}
        <div className="flex gap-3">
          <Button type="button" color={mode === "url" ? "info" : "light"} onClick={() => setMode("url")}>
            URL mode
          </Button>
          <Button type="button" color={mode === "html" ? "info" : "light"} onClick={() => setMode("html")}>
            HTML mode
          </Button>
        </div>

        {/* Input */}
        {mode === "url" ? (
          <TextInput placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
        ) : (
          <Textarea rows={6} placeholder="<div>Paste HTML here</div>" value={html} onChange={(e) => setHtml(e.target.value)} />
        )}

        {/* Buttons row (Scan / Download / Clear) */}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={loading || !hasInput}>
            {loading ? <Spinner size="sm" /> : "Scan"}
          </Button>

          <Button type="button" color="light" disabled={reportLoading || !hasInput} onClick={onDownloadReport}>
            {reportLoading ? <Spinner size="sm" /> : "Download report"}
          </Button>

          <Button type="button" color="light" onClick={doClear}>
            Clear
          </Button>
        </div>

        {/* Error */}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </Card>
  );
}
