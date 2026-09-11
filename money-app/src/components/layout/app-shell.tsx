import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { MobileFab } from "./mobile-fab";

export function AppShell({ userName, children }: { userName: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar userName={userName} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <main className="min-w-0 flex-1 pb-24 md:pb-0">{children}</main>
      </div>
      <MobileNav />
      <MobileFab />
    </div>
  );
}
