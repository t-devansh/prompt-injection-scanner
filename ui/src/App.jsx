import { Card } from "flowbite-react";
import { useState } from "react";
import ScanForm from "./components/ScanForm.jsx";
import ResultsPanel from "./components/ResultsPanel.jsx";

export default function App() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const showResults = scanning || !!result;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-6xl p-4">
          <h1 className="text-2xl font-bold">Prompt-Injection Risk Scanner</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">React · Tailwind · Flowbite-React</p>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl p-6 space-y-6">
        <div className={`grid gap-6 transition-all duration-500 ${showResults ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
          <ScanForm
            onStart={() => {
              setScanning(true);
              setResult(null);
            }}
            onResult={(data) => {
              setScanning(false);
              setResult(data || null);
            }}
            onClear={() => {
              setScanning(false);
              setResult(null);
            }}
          />

          {showResults && <ResultsPanel loading={scanning} result={result} />}
        </div>

        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tip: run your API: <code className="font-mono">uvicorn src.api.main:app --host 0.0.0.0 --port 8000</code>
          </p>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-6xl p-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Prompt-Injection Risk Scanner · Built with FastAPI · React · Tailwind · Flowbite
      </footer>
    </div>
  );
}
