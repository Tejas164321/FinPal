import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-dark-gradient">
      <Sidebar />
      <MobileNav />
      <main className="lg:ml-64 p-6 pt-20 lg:pt-6">{children}</main>
    </div>
  );
};

export default AppLayout;
