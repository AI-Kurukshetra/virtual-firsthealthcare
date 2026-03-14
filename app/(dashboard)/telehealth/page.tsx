import { DashboardShell } from "@/components/layout/DashboardShell";
import { TelehealthRoom } from "@/components/telehealth/TelehealthRoom";

export const metadata = {
  title: "Telehealth | Virtual Health Platform"
};

export default function TelehealthPage() {
  return (
    <DashboardShell title="Telehealth" description="Live consultation">
      <TelehealthRoom />
    </DashboardShell>
  );
}
