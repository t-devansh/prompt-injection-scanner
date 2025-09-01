import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Card,
} from "flowbite-react";

const sevColor = { high: "failure", medium: "warning", low: "success" };
const cap = (s = "") =>
  s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : "";

function clamp(text = "", n = 200) {
  if (!text) return "";
  return text.length > n ? text.slice(0, n - 1) + "…" : text;
}

export default function FindingsTable({ findings = [], stickyHead = false }) {
  if (!findings.length) {
    return (
      <Card>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          No findings detected.
        </p>
      </Card>
    );
  }

  return (
    <Table hoverable={true} className="min-w-full table-fixed">
      <TableHead
        className={
          stickyHead ? "sticky top-0 z-10 bg-white dark:bg-gray-800" : ""
        }
      >
        <TableRow>
          <TableHeadCell className="w-20">Rule</TableHeadCell>
          <TableHeadCell className="w-32">Severity</TableHeadCell>
          <TableHeadCell className="w-32">Confidence</TableHeadCell>
          <TableHeadCell className="w-72">Title</TableHeadCell>
          <TableHeadCell>Evidence</TableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody className="divide-y">
        {findings.map((f, idx) => {
          const sev = (f.severity || "").toLowerCase();
          return (
            <TableRow key={idx} className="bg-white dark:bg-gray-900">
              <TableCell className="px-4 py-2 font-mono break-words">
                {f.rule_id}
              </TableCell>

              <TableCell className="px-4 py-2">
                <div className="flex justify-center">
                  <Badge
                    color={sevColor[sev] || "gray"}
                    className="min-w-[92px] justify-center"
                  >
                    {cap(sev) || "Unknown"}
                  </Badge>
                </div>
              </TableCell>

              <TableCell className="px-4 py-2 font-mono">
                {(f.confidence ?? 0).toFixed(2)}
              </TableCell>
              <TableCell className="px-4 py-2 whitespace-normal break-words">
                {f.title || "-"}
              </TableCell>
              <TableCell className="px-4 py-2 whitespace-normal break-words">
                {clamp(f.evidence)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
