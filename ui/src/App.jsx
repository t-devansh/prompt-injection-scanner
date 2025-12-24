import { useState } from "react";
import { Card, Button, Label, Select, Checkbox, Textarea } from "flowbite-react";
import { HiAdjustments } from "react-icons/hi";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ScanForm from "./components/ScanForm.jsx";
import SummaryPanel from "./components/SummaryPanel.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";
import AdvancedControls from "./components/AdvancedControls";



/** Animated background */
function AnimatedBackground() {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute -top-24 -left-16 h-[38rem] w-[38rem] rounded-full bg-blue-500/40 blur-[200px]" />
        <div className="absolute -bottom-20 left-1/4 h-[34rem] w-[34rem] rounded-full bg-purple-500/35 blur-[200px]" />
        <div className="absolute -right-24 top-1/3 h-[36rem] w-[36rem] rounded-full bg-pink-500/30 blur-[200px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(transparent_60%,rgba(0,0,0,0.35))]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950" />

      <motion.div
        className="absolute -top-24 -left-16 h-[38rem] w-[38rem] rounded-full bg-blue-500/40 blur-[200px] [will-change:transform]"
        animate={{ x: [0, 80, -60, 0], y: [0, -50, 40, 0] }}
        transition={{ duration: 9, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 left-1/4 h-[34rem] w-[34rem] rounded-full bg-purple-500/35 blur-[200px] [will-change:transform]"
        animate={{ x: [0, -70, 50, 0], y: [0, 40, -35, 0] }}
        transition={{ duration: 9, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 0.6 }}
      />
      <motion.div
        className="absolute -right-24 top-1/3 h-[36rem] w-[36rem] rounded-full bg-pink-500/30 blur-[200px] [will-change:transform]"
        animate={{ x: [0, 50, -80, 0], y: [0, -35, 50, 0] }}
        transition={{ duration: 9, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 1.2 }}
      />

      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(transparent_65%,rgba(0,0,0,0.35))]" />
    </div>
  );
}

// Shared glass styles
const GLASS =
  "!bg-white/10 dark:!bg-white/5 !backdrop-blur-md !border !border-white/20 dark:!border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)]";

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
  const [failOn, setFailOn] = useState("none");
  const [rendered, setRendered] = useState(false);

  // HTML expand modal
  const [expandOpen, setExpandOpen] = useState(false);

  const showResults = scanning || !!result || !!error;
  const cap = (s = "") => (s ? s[0].toUpperCase() + s.slice(1) : "");

  return (
    <div className="relative min-h-screen text-gray-100">
      <AnimatedBackground />

      {/* Header */}
      <header className={`border-b ${GLASS}`}>
        <div className="mx-auto max-w-7xl p-4 text-center">
          <h1 className="text-2xl font-bold text-white">
            Prompt-Injection Risk Scanner
          </h1>
        </div>
      </header>



      {/* Main */}
      <main className="mx-auto max-w-7xl p-6 space-y-6">
        {showResults ? (
          <div className="gap-6 md:grid md:h-[75vh] md:grid-cols-[1fr_2fr] md:grid-rows-2">
            <div className="md:row-start-1 md:row-end-2 md:col-start-1">
              <ScanForm
                className={`h-full ${GLASS}`}
                mode={mode}
                setMode={setMode}
                url={url}
                setUrl={setUrl}
                html={html}
                setHtml={setHtml}
                failOn={failOn}
                rendered={rendered}
                expandOpen={expandOpen}
                setExpandOpen={setExpandOpen}
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

            <div className="md:row-start-2 md:row-end-3 md:col-start-1">
              <SummaryPanel
                className={`h-full ${GLASS}`}
                loading={scanning}
                counts={result?.summary?.counts}
                error={error}
                failOnTriggered={Boolean(result?._failOnTriggered)}
                thresholdLabel={cap(failOn || "none")}
              />
            </div>

            <div className="md:row-start-1 md:row-end-3 md:col-start-2">
              <ResultsPanel
                className={`h-full ${GLASS}`}
                loading={scanning}
                result={result}
                payload={lastPayload}
                error={error}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <ScanForm
              className={GLASS}
              mode={mode}
              setMode={setMode}
              url={url}
              setUrl={setUrl}
              html={html}
              setHtml={setHtml}
              failOn={failOn}
              rendered={rendered}
              expandOpen={expandOpen}
              setExpandOpen={setExpandOpen}
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

        {/* Raw JSON */}
        <Card className={GLASS}>
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-gray-100">
              Raw JSON Output
            </summary>
            {result ? (
              <pre className="mt-2 overflow-auto rounded bg-white/5 p-3 text-xs text-gray-100">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : error ? (
              <p className="mt-2 text-sm text-red-300">{error}</p>
            ) : (
              <p className="mt-2 text-sm text-gray-300">Run a scan to see the raw API response.</p>
            )}
          </details>
        </Card>
      </main>

      <footer className={`mx-auto max-w-7xl p-4 text-sm text-gray-300 ${GLASS}`}>
        <div className="flex justify-between items-center">
          {/* Left side text */}
          <span className="text-gray-200">
            Made by Devansh Tandon
          </span>

          {/* Right side icons */}
          <div className="flex space-x-4">
            <a
              href="https://github.com/t-devansh"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition"
            >
              <img
                src={`${import.meta.env.BASE_URL}icons/github.png`}
                alt="GitHub"
                className="h-6 w-6 inline-block filter invert hover:opacity-80 transition"
              />
            </a>

            <a
              href="https://www.linkedin.com/in/tandon-devansh/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition"
            >
              <img
                src={`${import.meta.env.BASE_URL}icons/linkedin.png`}
                alt="LinkedIn"
                className="h-6 w-6 inline-block filter invert hover:opacity-80 transition"
              />
            </a>
          </div>
        </div>
      </footer>



      

      {/* Expand HTML Modal (moved here) */}
      <AnimatePresence>
        {expandOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
              className="rounded-lg w-full max-w-5xl mx-4
                         bg-white/10 dark:bg-white/5 backdrop-blur-md
                         border border-white/20 dark:border-white/10
                         shadow-[0_8px_30px_rgba(0,0,0,0.24)]"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Edit HTML</h3>
                <button onClick={() => setExpandOpen(false)} className="text-gray-300 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="p-4">
                <Textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  className="h-[60vh] w-full resize-none thin-scrollbar bg-white/10 border-white/20 text-gray-100 placeholder:text-gray-300"
                  placeholder="<div>Paste HTML here</div>"
                />
              </div>

              <div className="flex justify-end gap-2 p-4 border-t border-white/10">
                <button
                  onClick={() => setExpandOpen(false)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                >
                  Save & Close
                </button>
                <button
                  onClick={() => setExpandOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 text-gray-100 border border-white/20 hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* SpeedDial (bottom right corner) */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end z-[9998] group">
        {/* Hover action: Scan Settings */}
        <AnimatePresence>
          <motion.button
            key="settings-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSettingsOpen(true)}
            className="mb-3 hidden group-hover:flex justify-center items-center w-[52px] h-[52px]
                      text-gray-100 hover:text-white bg-white/10 backdrop-blur-md border border-white/20
                      dark:border-white/10 shadow-md hover:bg-white/20 focus:ring-4 focus:ring-white/10
                      rounded-full"
          >
            <HiAdjustments className="w-5 h-5" />
            <span className="sr-only">Scan Settings</span>
          </motion.button>
        </AnimatePresence>

        {/* Main FAB */}
        <button
          type="button"
          className="flex items-center justify-center text-white bg-blue-600 rounded-full w-14 h-14
                    hover:bg-blue-500 focus:ring-4 focus:ring-blue-300 transition-transform group-hover:rotate-45"
        >
          <svg
            className="w-6 h-6"
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
    

    {/* Settings Modal (animated, glass) */}
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="rounded-lg w-full max-w-md mx-4
                      bg-white/10 dark:bg-white/5 backdrop-blur-md
                      border border-white/20 dark:border-white/10
                      shadow-[0_8px_30px_rgba(0,0,0,0.24)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Scan Settings</h3>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-6">
              <div>
                <Label htmlFor="fail_on" value="Fail on severity" className="text-gray-200" />
                <Select
                  id="fail_on"
                  value={failOn}
                  onChange={(e) => setFailOn(e.target.value)}
                  className="bg-white/10 text-gray-100 border-white/20"
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
                <Label htmlFor="rendered" className="text-gray-200">
                  Use rendered page (Playwright)
                </Label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-white/10">
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
