import { useState } from "react";
import { useSetClockifyCredentials } from "../../hooks/useClockify";

export function ConnectForm() {
  const [apiKey, setApiKey] = useState("");
  const { mutate: save, isPending, error } = useSetClockifyCredentials();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;
    save({ apiKey: apiKey.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Clockify API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Clockify API key"
          className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Find it in Clockify → Profile → API key
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error.message}</p>}
      <button
        type="submit"
        disabled={isPending || !apiKey.trim()}
        className="px-4 py-2 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? "Connecting…" : "Connect Clockify"}
      </button>
    </form>
  );
}
