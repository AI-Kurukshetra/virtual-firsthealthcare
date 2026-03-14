import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/charts/RevenueChart";

export const metadata = {
  title: "Billing | Virtual Health Platform"
};

export default function BillingPage() {
  return (
    <DashboardShell title="Billing" description="Revenue and claims">
      <Card>
        <CardHeader>
          <CardTitle>Revenue overview</CardTitle>
          <CardDescription>Claims, invoices, and payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
