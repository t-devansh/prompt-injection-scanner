import { Badge, Card } from "flowbite-react";

export default function SummaryChips({ counts }) {
  if (!counts) return null;
  return (
    <Card>
      <div className="flex flex-wrap gap-3">
        <Badge color="failure" size="lg">High: {counts.high}</Badge>
        <Badge color="warning" size="lg">Medium: {counts.medium}</Badge>
        <Badge color="success" size="lg">Low: {counts.low}</Badge>
      </div>
    </Card>
  );
}
