import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const labs = [
  {
    patient: "Emily Davis",
    test: "Lipid panel",
    status: "Pending"
  },
  {
    patient: "Robert Wilson",
    test: "CBC",
    status: "Completed"
  }
];

export const metadata = {
  title: "Labs | Virtual Health Platform"
};

export default function LabsPage() {
  return (
    <DashboardShell title="Labs" description="Orders and results">
      <Card>
        <CardHeader>
          <CardTitle>Lab queue</CardTitle>
          <CardDescription>Track lab orders and diagnostic results.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {labs.map((lab) => (
            <div
              key={lab.patient}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-white">{lab.patient}</p>
                <p className="text-xs text-white/50">{lab.test}</p>
              </div>
              <Badge variant={lab.status === "Completed" ? "success" : "warning"}>
                {lab.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
