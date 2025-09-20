import React, { ReactNode } from "react";
import DashboardLayoutComponent from "@/components/dashboard/DashboardLayoutComponent";

export const metadata = {
  title: "Dashboard",
  description:
    "Insilicology dashboard page. All dashboard pages are listed here.",
  keywords: [
    "dashboard",
    "insilicology",
    "insilicology dashboard",
    "insilicology dashboard page",
    "insilicology dashboard page",
  ],
  metadataBase: new URL("https://insilicology.org"),
  alternates: {
    canonical: `/dashboard`,
  },
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="font-[family-name:var(--font-hind-siliguri)]">
      <DashboardLayoutComponent>
        {children}
      </DashboardLayoutComponent>
    </div>
  );
}
