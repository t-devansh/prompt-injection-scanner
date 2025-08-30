import { Card } from "flowbite-react";
import ScanForm from "./components/ScanForm.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl p-4">
          <h1 className="text-2xl font-semibold">Prompt-Injection Risk Scanner</h1>
          <p className="text-sm text-gray-500">React + Tailwind + Flowbite-React</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4 space-y-6">
        <ScanForm />
        <Card>
          <p className="text-sm text-gray-500">
            Tip: run your API: <code>uvicorn src.api.main:app --host 0.0.0.0 --port 8000</code>
          </p>
        </Card>
      </main>

      <footer className="mx-auto max-w-4xl p-4 text-xs text-gray-500">
        Built with FastAPI · React · Tailwind · Flowbite-React
      </footer>
    </div>
  );
}
