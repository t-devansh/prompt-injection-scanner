import { Button, Badge, Card } from "flowbite-react";

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
        <Card>
          <h2 className="text-lg font-medium">Quick check</h2>
          <p className="text-sm text-gray-600">
            UI scaffold is running. Next tasks will add the form and results.
          </p>
          <div className="flex items-center gap-2">
            <Badge color="info">UI Ready</Badge>
            <Button>Placeholder Button</Button>
          </div>
        </Card>
      </main>

      <footer className="mx-auto max-w-4xl p-4 text-xs text-gray-500">
        Built with FastAPI · React · Tailwind · Flowbite-React
      </footer>
    </div>
  );
}
