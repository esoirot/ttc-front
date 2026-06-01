import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useTimerSSE } from "@/hooks/time/useTimerSSE";
import { useAuthSSE } from "@/hooks/auth/useAuthSSE";

export function AppLayout() {
  useTimerSSE();
  useAuthSSE();

  return (
    <div className="flex flex-col sm:flex-row min-h-screen text-left bg-white dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
