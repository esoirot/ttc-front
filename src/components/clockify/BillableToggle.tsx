export function BillableToggle({
  billable,
  onChange,
}: {
  billable: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!billable)}
      title={billable ? "Billable" : "Non-billable"}
      className={`px-1.5 py-0.5 rounded text-xs font-semibold transition-colors ${
        billable
          ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
          : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400"
      }`}
    >
      $
    </button>
  );
}
