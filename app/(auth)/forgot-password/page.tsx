import { AuthShell } from "@/components/layout/AuthShell";
import { AuthForgotForm } from "@/components/forms/AuthForgotForm";

export const metadata = {
  title: "Reset Password | Virtual Health Platform"
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Recover access to your clinical workspace in seconds."
    >
      <AuthForgotForm />
    </AuthShell>
  );
}
