import { AuthShell } from "@/components/layout/AuthShell";
import { AuthResetForm } from "@/components/forms/AuthResetForm";

export const metadata = {
  title: "Set New Password | Virtual Health Platform"
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Create a new password"
      subtitle="Secure your account before returning to your dashboard."
    >
      <AuthResetForm />
    </AuthShell>
  );
}
