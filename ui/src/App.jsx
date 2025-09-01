import { useState } from "react";
import { Card } from "flowbite-react";
import ScanForm from "./components/ScanForm.jsx";
import SummaryPanel from "./components/SummaryPanel.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";

export default function App() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);
  const [error, setError] = useState("");
  const [hasScanned, setHasScanned] = useState(false);

  // lifted state for inputs + mode
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");

  const showResults = hasScanned || scanning || !!result;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl p-4">
          <h1 className="text-2xl font-bold">Prompt-Injection Risk Scanner</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            React · Tailwind · Flowbite-React
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl p-6 space-y-6">
        {showResults ? (
          <div className="gap-6 md:grid md:h-[75vh] md:grid-cols-[1fr_2fr] md:grid-rows-2">
            {/* Left top: Scan Configuration */}
            <div className="md:row-start-1 md:row-end-2 md:col-start-1">
              <ScanForm
                className="h-full"
                busy={scanning}
                mode={mode}
                setMode={setMode}
                url={url}
                setUrl={setUrl}
                html={html}
                setHtml={setHtml}
                onNewPayload={(p) => setLastPayload(p)}
                onStart={() => {
                  setHasScanned(true);
                  setScanning(true);
                  setResult(null);
                  setError("");
                }}
                onResult={(data) => {
                  setScanning(false);
                  setResult(data || null);
                  setError("");
                }}
                onError={(msg) => {
                  setScanning(false);
                  setResult(null);
                  setError(msg || "Scan failed");
                }}
                onClear={() => {
                  setScanning(false);
                  setResult(null);
                  setError("");
                  setHasScanned(false);
                }}
              />
            </div>

            {/* Left bottom: Scan Summary */}
            <div className="md:row-start-2 md:row-end-3 md:col-start-1">
              <SummaryPanel
                className="h-full"
                loading={scanning}
                error={error}
                counts={result?.summary?.counts}
              />
            </div>

            {/* Right: Findings */}
            <div className="md:row-start-1 md:row-end-3 md:col-start-2">
              <ResultsPanel
                className="h-full"
                loading={scanning}
                error={error}
                result={result}
                payload={lastPayload}
              />
            </div>
          </div>
        ) : (
          // Pre-scan: just the form
          <div className="space-y-6">
            <ScanForm
              busy={scanning}
              mode={mode}
              setMode={setMode}
              url={url}
              setUrl={setUrl}
              html={html}
              setHtml={setHtml}
              onNewPayload={(p) => setLastPayload(p)}
              onStart={() => {
                setHasScanned(true);
                setScanning(true);
                setResult(null);
                setError("");
              }}
              onResult={(data) => {
                setScanning(false);
                setResult(data || null);
                setError("");
              }}
              onError={(msg) => {
                setScanning(false);
                setResult(null);
                setError(msg || "Scan failed");
              }}
              onClear={() => {
                setScanning(false);
                setResult(null);
                setError("");
                setHasScanned(false);
              }}
            />
          </div>
        )}

        {/* Raw JSON Output */}
        {showResults && (
          <Card>
            <details open={!!result && !error}>
              <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-200">
                Raw JSON Output
              </summary>
              {result ? (
                <pre className="mt-2 overflow-auto rounded bg-gray-100 dark:bg-gray-800 p-3 text-xs">
{JSON.stringify(result, null, 2)}
                </pre>
              ) : error ? (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  Last scan failed: <span className="font-medium">{error}</span>
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Scanning… (the raw API response will appear when ready)
                </p>
              )}
            </details>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl p-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Prompt-Injection Risk Scanner · Built with FastAPI · React · Tailwind · Flowbite
      </footer>
    </div>
  );
}
