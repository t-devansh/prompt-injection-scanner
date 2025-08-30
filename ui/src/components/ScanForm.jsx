import { useState } from "react";
import { Card, TextInput, Textarea, Button, Spinner, Badge } from "flowbite-react";
import { scan } from "../lib/api";

export default function ScanForm() {
  const [mode, setMode] = useState("url"); // "url" | "html"
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

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

        {/* Submit + counts */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading || (mode === "url" ? !url : !html)}>
            {loading ? <Spinner size="sm" /> : "Scan"}
          </Button>

          {result && (
            <div className="flex gap-2">
              <Badge color="failure">High: {counts.high}</Badge>
              <Badge color="warning">Medium: {counts.medium}</Badge>
              <Badge color="success">Low: {counts.low}</Badge>
            </div>
          )}
        </div>

        {/* Errors + raw JSON */}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {result && (
          <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
{JSON.stringify(result, null, 2)}
          </pre>
        )}
      </form>
    </Card>
  );
}
