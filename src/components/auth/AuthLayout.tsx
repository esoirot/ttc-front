import type { ReactNode } from "react";

type Props = { title: string; children: ReactNode };

export function AuthLayout({ title, children }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
