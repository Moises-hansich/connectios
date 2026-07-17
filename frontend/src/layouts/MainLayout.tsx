import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";

import { Sidebar } from "../components/Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [mobileAberta, setMobileAberta] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        aberta={sidebarAberta}
        mobileAberta={mobileAberta}
        onAlternar={() => setSidebarAberta((valor) => !valor)}
        onFecharMobile={() => setMobileAberta(false)}
      />

      <main
        className={`
          relative z-0 min-h-screen transition-all duration-300
          md:ml-20
          ${sidebarAberta ? "md:ml-64" : "md:ml-20"}
        `}
      >
        <header className="flex h-16 items-center border-b border-gray-200 bg-white px-4 md:hidden">
          <button
            type="button"
            onClick={() => setMobileAberta(true)}
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
            aria-label="Abrir menu"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
