import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/bottom-nav";

export function AppLayout() {
  return (
    <div className="relative mx-auto h-full w-full max-w-[480px] overflow-hidden">
      <main className="h-full overflow-y-auto pb-[calc(72px+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
