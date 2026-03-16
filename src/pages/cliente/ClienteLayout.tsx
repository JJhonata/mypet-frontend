import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MobileFrame } from "../../components/mobile/MobileFrame";
import { DrawerMenu } from "../../components/mobile/DrawerMenu";
import { AppSidebar } from "../../components/AppSidebar";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";

export function ClienteLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MobileFrame>
      <div className="relative min-h-screen bg-white dark:bg-slate-900 flex">
        <AppSidebar />
        {/* Drawer apenas no mobile */}
        <DrawerMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

        <main className="flex-1 min-h-screen md:pl-64">
          <div className="max-w-5xl mx-auto px-5 sm:px-5 md:px-6 lg:px-8 py-4 md:py-6">
            <Outlet
              context={{
                openMenu: () => setMenuOpen(true),
                userName: user?.nome ?? "Cliente",
                userFoto: user?.foto,
                pathname: location.pathname
              }}
            />
          </div>
        </main>
      </div>
    </MobileFrame>
  );
}

export function useClienteShell() {
  return useOutletContext<{
    openMenu: () => void;
    userName: string;
    userFoto?: string;
    pathname: string;
  }>();
}

