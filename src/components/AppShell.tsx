import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

interface AppShellProps {
  children?: React.ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 pb-20">
        {children || <Outlet />}
      </main>
      <BottomNav />
    </div>
  );
};

export default AppShell;
