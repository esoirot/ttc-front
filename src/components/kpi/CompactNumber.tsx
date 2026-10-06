import { useIntl } from "react-intl";
import type { CompactNumberProps } from "@/types/shared-ui.types";

const COMPACT_FROM = 1_000_000;

/** A number shown in full, or as 8.2M / 10B / 1T from one million up. */
export function CompactNumber({
  value,
  fractionDigits = 0,
}: CompactNumberProps) {
  const intl = useIntl();
  const full = intl.formatNumber(value, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  if (Math.abs(value) < COMPACT_FROM) return <span>{full}</span>;
  return (
    <span title={full}>
      {intl.formatNumber(value, {
        notation: "compact",
        maximumFractionDigits: 1,
      })}
    </span>
  );
}
