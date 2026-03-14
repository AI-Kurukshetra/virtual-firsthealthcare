import { AuthShell } from "@/components/layout/AuthShell";
import { AuthRegisterForm } from "@/components/forms/AuthRegisterForm";

export const metadata = {
  title: "Register | Virtual Health Platform"
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Onboard your organization, providers, and patients in minutes."
    >
      <AuthRegisterForm />
    </AuthShell>
  );
}
