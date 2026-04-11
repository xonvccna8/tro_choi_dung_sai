import { Outlet } from "react-router-dom";
import { TabBar } from "./TabBar";

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col pb-20 pt-4 relative">
      <div className="flex-1 w-full mx-auto pb-4 z-10">
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}