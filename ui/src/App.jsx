import { useState } from "react";
import { Card, Button, Label, Select, Checkbox } from "flowbite-react";
import { HiAdjustments } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import ScanForm from "./components/ScanForm.jsx";
import SummaryPanel from "./components/SummaryPanel.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";

export default function App() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);
  const [error, setError] = useState("");

  // Mode + inputs
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [html, setHtml] = useState("");

  // Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [failOn, setFailOn] = useState("none"); // none | low | medium | high
  const [rendered, setRendered] = useState(false);

  const showResults = scanning || !!result || !!error;

  const cap = (s = "") => (s ? s[0].toUpperCase() + s.slice(1) : "");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 relative">
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
                mode={mode}
                setMode={setMode}
                url={url}
                setUrl={setUrl}
                html={html}
                setHtml={setHtml}
                failOn={failOn}
                rendered={rendered}
                onNewPayload={(p) => setLastPayload(p)}
                onStart={() => {
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
                  setError(msg);
                }}
                onClear={() => {
                  setScanning(false);
                  setResult(null);
                  setError("");
                }}
                busy={scanning}
              />
            </div>

            {/* Left bottom: Scan Summary */}
            <div className="md:row-start-2 md:row-end-3 md:col-start-1">
              <SummaryPanel
                className="h-full"
                loading={scanning}
                counts={result?.summary?.counts}
                error={error}
                failOnTriggered={Boolean(result?._failOnTriggered)}  
                thresholdLabel={cap(failOn || "none")}               
              />
            </div>

            {/* Right: Scan Findings (spans both rows) */}
            <div className="md:row-start-1 md:row-end-3 md:col-start-2">
              <ResultsPanel
                className="h-full"
                loading={scanning}
                result={result}
                payload={lastPayload}
                error={error}
              />
            </div>
          </div>
        ) : (
          // Pre-scan: just the form
          <div className="space-y-6">
            <ScanForm
              mode={mode}
              setMode={setMode}
              url={url}
              setUrl={setUrl}
              html={html}
              setHtml={setHtml}
              failOn={failOn}
              rendered={rendered}
              onNewPayload={(p) => setLastPayload(p)}
              onStart={() => {
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
                setError(msg);
              }}
              onClear={() => {
                setScanning(false);
                setResult(null);
                setError("");
              }}
              busy={scanning}
            />
          </div>
        )}

        {/* Raw JSON Output */}
        <Card>
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-200">
              Raw JSON Output
            </summary>
            {result ? (
              <pre className="mt-2 overflow-auto rounded bg-gray-100 dark:bg-gray-800 p-3 text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : error ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Run a scan to see the raw API response.
              </p>
            )}
          </details>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl p-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Prompt-Injection Risk Scanner · Built with FastAPI · React · Tailwind ·
        Flowbite
      </footer>

      {/* SpeedDial bottom right (hover to reveal) */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end z-50 group">
        {/* Speed dial action: Scan Settings */}
        <AnimatePresence>
          <motion.button
            key="scan-settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSettingsOpen(true)}
            className="mb-3 hidden group-hover:flex justify-center items-center w-[52px] h-[52px] 
                       text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 
                       dark:border-gray-600 shadow-md dark:hover:text-white dark:text-gray-400 
                       hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 
                       focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400"
          >
            <HiAdjustments className="w-5 h-5" />
            <span className="sr-only">Scan Settings</span>
          </motion.button>
        </AnimatePresence>

        {/* Main FAB */}
        <button
          type="button"
          className="flex items-center justify-center text-white bg-blue-700 rounded-full w-14 h-14
                     hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4
                     focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
        >
          <svg
            className="w-6 h-6 transition-transform group-hover:rotate-45"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 18 18"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 1v16M1 9h16" />
          </svg>
          <span className="sr-only">Open actions menu</span>
        </button>
      </div>

      {/* Settings Modal (animated) */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Scan Settings
                </h3>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-6">
                <div>
                  <Label htmlFor="fail_on" value="Fail on severity" />
                  <Select
                    id="fail_on"
                    value={failOn}
                    onChange={(e) => setFailOn(e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rendered"
                    checked={rendered}
                    onChange={(e) => setRendered(e.target.checked)}
                  />
                  <Label htmlFor="rendered">Use rendered page (Playwright)</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t dark:border-gray-700">
                <Button color="gray" onClick={() => setSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button color="blue" onClick={() => setSettingsOpen(false)}>
                  Save
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
