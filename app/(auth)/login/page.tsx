import { AuthShell } from "@/components/layout/AuthShell";
import { AuthLoginForm } from "@/components/forms/AuthLoginForm";

export const metadata = {
  title: "Login | Virtual Health Platform"
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Securely access your clinical workflows and telehealth rooms."
    >
      <AuthLoginForm />
    </AuthShell>
  );
}
