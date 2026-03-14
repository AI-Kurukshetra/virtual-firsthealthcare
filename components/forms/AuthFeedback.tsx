export function AuthFeedback({
  message,
  tone = "error"
}: {
  message?: string | null;
  tone?: "error" | "success";
}) {
  if (!message) return null;

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-xs ${
        tone === "error"
          ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
          : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
      }`}
    >
      {message}
    </div>
  );
}
