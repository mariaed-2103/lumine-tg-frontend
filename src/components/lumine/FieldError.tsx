import { AlertCircle } from "lucide-react";

export function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mt-1.5 flex items-center gap-1.5 font-sans text-[13px] font-medium text-berry"
    >
      <AlertCircle size={14} className="shrink-0" />
      <span>{message}</span>
    </p>
  );
}
