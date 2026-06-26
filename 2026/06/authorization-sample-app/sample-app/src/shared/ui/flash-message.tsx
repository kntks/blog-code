import type { FlashMessageKind } from "@/shared/lib/flash-message";

type FlashMessageProps = {
  kind: FlashMessageKind;
  message: string;
};

const flashMessageClassNames: Record<FlashMessageKind, string> = {
  success:
    "border-[color:rgba(31,122,62,0.18)] bg-[color:var(--success-bg)] text-[color:var(--success-text)]",
  error:
    "border-[color:rgba(178,52,52,0.18)] bg-[color:var(--danger-bg)] text-[color:var(--danger-text)]",
};

export function FlashMessage({ kind, message }: FlashMessageProps) {
  return (
    <div
      className={`rounded-[12px] border px-4 py-3 text-sm shadow-[var(--card-shadow)] ${flashMessageClassNames[kind]}`}
    >
      {message}
    </div>
  );
}
