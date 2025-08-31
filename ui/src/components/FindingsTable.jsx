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

function clamp(text = "", n = 160) {
  if (!text) return "";
  return text.length > n ? text.slice(0, n - 1) + "…" : text;
}

export default function FindingsTable({ findings = [] }) {
  if (!findings.length) {
    return (
      <Card>
        <p className="text-sm text-gray-600">No findings detected.</p>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table hoverable>
        <TableHead>
          <TableRow>
            <TableHeadCell>Rule</TableHeadCell>
            <TableHeadCell>Severity</TableHeadCell>
            <TableHeadCell>Confidence</TableHeadCell>
            <TableHeadCell>Title</TableHeadCell>
            <TableHeadCell>Evidence</TableHeadCell>
          </TableRow>
        </TableHead>

        <TableBody className="divide-y">
          {findings.map((f, idx) => (
            <TableRow key={idx} className="bg-white">
              <TableCell className="font-mono">{f.rule_id}</TableCell>
              <TableCell>
                <Badge color={sevColor[f.severity] || "gray"} className="capitalize">
                  {f.severity || "unknown"}
                </Badge>
              </TableCell>
              <TableCell className="font-mono">
                {(f.confidence ?? 0).toFixed(2)}
              </TableCell>
              <TableCell className="whitespace-nowrap">{f.title || "-"}</TableCell>
              <TableCell className="max-w-[28rem]">{clamp(f.evidence)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
