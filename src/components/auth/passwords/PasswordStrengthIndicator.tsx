import { useIntl, type MessageDescriptor } from "react-intl";
import type { PasswordStrengthIndicatorProps } from "@/types/auth.types";

function passwordStrength(p: string): 0 | 1 | 2 | 3 {
  if (p.length === 0) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++;
  return Math.min(score, 3) as 0 | 1 | 2 | 3;
}

const STRENGTH_LABEL_MESSAGES: (MessageDescriptor | null)[] = [
  null,
  { id: "auth.passwordStrength.weak", defaultMessage: "Weak" },
  { id: "auth.passwordStrength.medium", defaultMessage: "Medium" },
  { id: "auth.passwordStrength.strong", defaultMessage: "Strong" },
];
const STRENGTH_COLOR = [
  "",
  "bg-destructive",
  "bg-yellow-400",
  "bg-emerald-500",
] as const;
const STRENGTH_TEXT_COLOR = [
  "",
  "text-destructive",
  "text-yellow-500",
  "text-emerald-500",
] as const;

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const intl = useIntl();
  if (password.length === 0) return null;
  const strength = passwordStrength(password);
  const label = STRENGTH_LABEL_MESSAGES[strength];
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              strength >= level ? STRENGTH_COLOR[strength] : "bg-border"
            }`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${STRENGTH_TEXT_COLOR[strength]}`}>
        {label ? intl.formatMessage(label) : ""}
      </span>
    </div>
  );
}
