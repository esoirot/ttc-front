import { useState, type FormEvent } from "react";
import {
  useCurrentUser,
  useSetupTwoFactor,
  useEnableTwoFactor,
} from "../../hooks/useAuth";

export function TwoFactorSetupPage() {
  const { user } = useCurrentUser();
  const {
    setupTwoFactor,
    loading: setupLoading,
    qrCodeUrl,
    secret,
  } = useSetupTwoFactor();
  const {
    enableTwoFactor,
    loading: enableLoading,
    error,
  } = useEnableTwoFactor();
  const [code, setCode] = useState("");
  const [done, setDone] = useState(false);

  async function handleEnable(e: FormEvent) {
    e.preventDefault();
    const result = await enableTwoFactor(code);
    if (result.data?.enableTwoFactor) setDone(true);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-zinc-900 dark:text-white">
        Security
      </h1>

      <section className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4">
          Two-factor authentication
        </h2>

        {done || user?.twoFactorEnabled ? (
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 w-fit">
              ✓ Enabled
            </span>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your account is protected with TOTP-based 2FA.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {!qrCodeUrl ? (
              <>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Add an extra layer of security using an authenticator app.
                </p>
                <button
                  className="self-start px-5 py-2 bg-violet-600 text-white rounded-md text-sm font-semibold cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                  onClick={() => setupTwoFactor()}
                  disabled={setupLoading}
                >
                  {setupLoading ? "Generating…" : "Set up 2FA"}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Scan this QR code with your authenticator app (Google
                  Authenticator, Authy, etc.).
                </p>
                <img
                  src={qrCodeUrl}
                  alt="2FA QR code"
                  className="block rounded-lg border border-zinc-200 dark:border-zinc-700 max-w-[200px]"
                />

                {secret && (
                  <details className="text-sm text-zinc-600 dark:text-zinc-400">
                    <summary className="cursor-pointer select-none">
                      Can't scan? Enter code manually
                    </summary>
                    <code className="block mt-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded font-mono text-xs break-all text-zinc-900 dark:text-zinc-100">
                      {secret}
                    </code>
                  </details>
                )}

                <form
                  onSubmit={handleEnable}
                  className="flex flex-col gap-4 max-w-xs"
                >
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="confirm-code"
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                    >
                      Enter the 6-digit code to confirm
                    </label>
                    <input
                      id="confirm-code"
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      required
                      placeholder="000000"
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-base bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600">{error.message}</p>
                  )}

                  <button
                    type="submit"
                    className="px-5 py-2 bg-violet-600 text-white rounded-md text-sm font-semibold cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                    disabled={enableLoading || code.length !== 6}
                  >
                    {enableLoading ? "Enabling…" : "Enable 2FA"}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
