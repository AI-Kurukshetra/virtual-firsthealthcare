import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientGrowthChart } from "@/components/charts/PatientGrowthChart";
import { AppointmentChart } from "@/components/charts/AppointmentChart";
import { RevenueChart } from "@/components/charts/RevenueChart";

export const metadata = {
  title: "Analytics | Virtual Health Platform"
};

export default function AnalyticsPage() {
  return (
    <DashboardShell title="Analytics" description="Insights">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient growth</CardTitle>
            <CardDescription>Net new patients across orgs.</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientGrowthChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Weekly visit trends.</CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentChart />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Monthly collections & billing cycles.</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
