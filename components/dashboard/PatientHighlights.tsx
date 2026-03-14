import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const highlights = [
  {
    name: "John Doe",
    detail: "Hypertension follow-up",
    next: "Tomorrow, 09:30"
  },
  {
    name: "Jane Smith",
    detail: "Diabetes review",
    next: "Today, 16:00"
  },
  {
    name: "Emily Davis",
    detail: "Lab results pending",
    next: "Monday, 11:15"
  }
];

export function PatientHighlights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient highlights</CardTitle>
        <CardDescription>Priority charts requiring review.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {highlights.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/60 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{item.name}</p>
              <p className="text-xs text-foreground/50">{item.detail}</p>
            </div>
            <p className="text-xs text-foreground/60">{item.next}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
