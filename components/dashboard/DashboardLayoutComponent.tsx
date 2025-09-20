"use client";

import React, { ReactNode, useState, useCallback } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import BottomDrawer from "@/components/ui/BottomDrawer";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayoutComponent({ children }: DashboardLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = () => setDrawerOpen((open) => !open);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <div className="font-[family-name:var(--font-hind-siliguri)] text-black bg-blue-50 flex h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 bg-white shadow-sm">
        <DashboardSidebar />
      </aside>

      {/* Mobile bottom drawer */}
      <BottomDrawer 
        isOpen={drawerOpen} 
        onClose={closeDrawer}
        title="ড্যাশবোর্ড মেনু"
      >
        <DashboardSidebar onClose={closeDrawer} />
      </BottomDrawer>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <header className="p-2 md:p-4 sticky h-16 top-0 z-50 flex items-center justify-between bg-white shadow-sm">
          {/* Logo for mobile */}
          <Link href="/dashboard" className="block md:hidden w-[120px] shrink-0 ml-2 mt-1.5 mr-2">
            <Image
              src="/logos/logo-insilicology.svg"
              alt="Logo"
              width={120}
              height={40}
              className="h-auto w-full"
              priority
            />
          </Link>
          {/* Dashboard header (flex-grow) */}
          <div className="flex-1 px-2">
            <DashboardHeader />
          </div>
          {/* Mobile menu button - hamburger */}
          <button
            onClick={toggleDrawer}
            className="md:hidden p-2 mr-2 transition-colors hover:text-blue-600"
            aria-label="Open menu"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
        </header>
        <main className="flex-1 p-2 md:p-4 overflow-auto transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
