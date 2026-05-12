import { useState, type FormEvent } from "react";
import {
  useCurrentUser,
  useUpdateMe,
  useSetupTwoFactor,
  useEnableTwoFactor,
  useDisableTwoFactor,
} from "../../hooks/useAuth";

type Tab = "profile" | "security";

export function EditProfilePage() {
  const { user } = useCurrentUser();
  const { updateMe, loading: saving, error: saveError } = useUpdateMe();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);

  const {
    setupTwoFactor,
    loading: setupLoading,
    qrCodeUrl,
    secret,
  } = useSetupTwoFactor();
  const {
    enableTwoFactor,
    loading: enableLoading,
    error: enableError,
  } = useEnableTwoFactor();
  const {
    disableTwoFactor,
    loading: disableLoading,
    error: disableError,
  } = useDisableTwoFactor();
  const [tfaCode, setTfaCode] = useState("");
  const [tfaDone, setTfaDone] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    await updateMe({ name: name.trim() || undefined, email: email.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleEnableTfa(e: FormEvent) {
    e.preventDefault();
    const result = await enableTwoFactor(tfaCode);
    if (result.data?.enableTwoFactor) setTfaDone(true);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6 text-zinc-900 dark:text-white">
        Edit Profile
      </h1>

      <nav className="flex gap-1 mb-8 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 -mb-px cursor-pointer ${
              activeTab === tab.id
                ? "border-violet-500 text-violet-600 dark:text-violet-400"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "profile" && (
        <form
          onSubmit={handleSaveProfile}
          className="flex flex-col gap-5 max-w-md"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="profile-name"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-base bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="profile-email"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-base bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Role
            </span>
            <span className="inline-flex text-xs font-semibold px-2 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded w-fit">
              {user?.role}
            </span>
          </div>

          {saveError && (
            <p className="text-sm text-red-600">{saveError.message}</p>
          )}

          {saved && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Profile saved.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="self-start px-5 py-2 bg-violet-600 text-white rounded-md text-sm font-semibold cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}

      {activeTab === "security" && (
        <section className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4">
            Two-factor authentication
          </h2>

          {tfaDone || user?.twoFactorEnabled ? (
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 w-fit">
                ✓ Enabled
              </span>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Your account is protected with TOTP-based 2FA.
              </p>
              {!showDisableForm ? (
                <button
                  onClick={() => setShowDisableForm(true)}
                  className="self-start text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  Disable 2FA…
                </button>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const result = await disableTwoFactor(disableCode);
                    if (result.data?.disableTwoFactor) {
                      setShowDisableForm(false);
                      setDisableCode("");
                    }
                  }}
                  className="flex flex-col gap-3 pt-1 border-t border-zinc-200 dark:border-zinc-800"
                >
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Enter your current authenticator code to confirm.
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    required
                    placeholder="000000"
                    value={disableCode}
                    onChange={(e) =>
                      setDisableCode(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-base bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none focus:border-violet-500 transition-colors"
                  />
                  {disableError && (
                    <p className="text-sm text-red-600">
                      {disableError.message}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={disableLoading || disableCode.length !== 6}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {disableLoading ? "Disabling…" : "Disable 2FA"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDisableForm(false);
                        setDisableCode("");
                      }}
                      className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
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
                    onSubmit={handleEnableTfa}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="tfa-code"
                        className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                      >
                        Enter the 6-digit code to confirm
                      </label>
                      <input
                        id="tfa-code"
                        type="text"
                        inputMode="numeric"
                        pattern="\d{6}"
                        maxLength={6}
                        required
                        placeholder="000000"
                        value={tfaCode}
                        onChange={(e) =>
                          setTfaCode(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md text-base bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>

                    {enableError && (
                      <p className="text-sm text-red-600">
                        {enableError.message}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="self-start px-5 py-2 bg-violet-600 text-white rounded-md text-sm font-semibold cursor-pointer hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                      disabled={enableLoading || tfaCode.length !== 6}
                    >
                      {enableLoading ? "Enabling…" : "Enable 2FA"}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
