import { Card, Spinner } from "flowbite-react";
import SummaryChips from "./SummaryChips.jsx";
import SeverityDonut from "./SeverityDonut.jsx";
import FindingsTable from "./FindingsTable.jsx";

export default function ResultsPanel({ loading, result }) {
  const counts = result?.summary?.counts;

  if (!loading && !result) return null;

  return (
    <div className="space-y-4">
      {/* Component 2: summary area */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {loading ? (
          <>
            <Card className="h-[160px] flex items-center justify-center">
              <Spinner />
            </Card>
            <Card className="h-[160px] flex items-center justify-center">
              <Spinner />
            </Card>
          </>
        ) : (
          <>
            <SeverityDonut counts={counts} />
            <SummaryChips counts={counts} />
          </>
        )}
      </div>

      {/* Meta line */}
      {!loading && result && (
        <p className="text-sm text-gray-500">
          Target: <span className="font-mono">{result.summary?.target}</span> · Scanned at:{" "}
          <span className="font-mono">{result.summary?.scanned_at}</span>
        </p>
      )}

      {/* Component 3: scrollable table */}
      <Card className="max-h-[70vh] overflow-y-auto">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <FindingsTable findings={result?.findings || []} />
        )}
      </Card>
    </div>
  );
}
