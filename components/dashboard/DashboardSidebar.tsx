"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, Users, CreditCard, Award, BookOpen, NotepadText, BookMarked, Video, GraduationCap } from "lucide-react";

type SubMenuItem = { name: string; href: string };

const menuItems = [
  { name: "ড্যাশবোর্ড", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
  {
    name: "আমার কোর্স",
    subItems: [
      { name: "সকল কোর্স", href: "/dashboard/my-courses" },
      { name: "লাইভ কোর্স", href: "/dashboard/my-courses/live" },
      { name: "রেকর্ডেড কোর্স", href: "/dashboard/my-courses/recorded" },
    ],
    icon: <BookMarked size={18} />,
  },
  { name: "আমার ওয়ার্কশপ", href: "/dashboard/my-workshops", icon: <GraduationCap size={18} /> },
  { name: "রিসোর্স", href: "/dashboard/resources", icon: <BookOpen size={18} />, },
  { name: "ক্লাস রেকর্ডিং", href: "/dashboard/recordings", icon: <Video size={18} />, },
  { name: "আমার পরীক্ষা", href: "/dashboard/my-exams", icon: <NotepadText size={18} />, },
  { name: "সার্টিফিকেট", href: "/dashboard/certificates", icon: <Award size={18} />, },
  { name: "পেমেন্ট", href: "/dashboard/payments", icon: <CreditCard size={18} />, },
  { name: "সাপোর্ট", href: "/dashboard/support", icon: <Users size={18} /> },
];

interface DashboardSidebarProps {
  onClose?: () => void;
}

export default function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const pathname = usePathname();

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Check if a menu item is active
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  // Check if a submenu item is active
  const isSubItemActive = (href: string) => {
    return pathname === href;
  };

  // Check if a parent menu with subitems should be open/active
  const isParentActive = (subItems: SubMenuItem[]) => {
    return subItems.some(sub => isSubItemActive(sub.href));
  };

  const handleItemClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-full h-full bg-white p-4 flex flex-col">
      {/* Logo - only show on desktop */}
      <div className="hidden md:block mb-6 flex px-4 pt-1 flex-shrink-0">
        <Image src="/logos/logo-insilicology.svg" alt="Logo" width={40} height={40} className="w-28 h-auto" />
      </div>

      {/* Menu Items - Scrollable */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-1 scrollbar-thin">
        {menuItems.map((item) => (
          <div key={item.name}>
            {item.subItems ? (
              <button
                onClick={() => toggleMenu(item.name)}
                className={`flex items-center justify-between w-full px-4 py-3 font-medium border-1 border-transparent rounded-lg transition-all duration-150 hover:bg-purple-50 hover:text-purple-700 focus:bg-purple-100 focus:text-purple-700 group cursor-pointer ${
                  isParentActive(item.subItems) ? 'bg-purple-100 text-purple-700' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon} <span className="text-base">{item.name}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${openMenus[item.name] || isParentActive(item.subItems) ? "rotate-180" : ""}`}
                />
              </button>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 font-medium border-1 border-transparent rounded-lg transition-all duration-150 hover:bg-purple-50 hover:text-purple-700 focus:bg-purple-100 focus:text-purple-700 ${
                  isActive(item.href) ? 'bg-purple-100 text-purple-700' : ''
                }`}
                onClick={() => handleItemClick()}
              >
                {item.icon} <span className="text-base">{item.name}</span>
              </Link>
            )}

            {/* Sub Items */}
            {item.subItems && (openMenus[item.name] || isParentActive(item.subItems)) && (
              <div className="ml-7 mt-1 space-y-1">
                {item.subItems.map((sub) => (
                  <Link
                    key={sub.name}
                    href={sub.href}
                    className={`block px-4 py-2 rounded-lg transition-all duration-150 hover:bg-purple-50 hover:text-purple-700 focus:bg-purple-100 focus:text-purple-700 ${
                      isSubItemActive(sub.href) ? 'bg-purple-100 text-purple-700' : ''
                    }`}
                    onClick={() => handleItemClick()}
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
