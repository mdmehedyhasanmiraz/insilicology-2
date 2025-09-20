'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  BookOpen,
  FileVideo,
  Users,
  ClipboardList,
  ChevronDown,
  ShieldEllipsis,
  Briefcase,
  GraduationCap,
  DollarSign,
  TicketPercent,
  Badge
} from 'lucide-react';

const adminMenu = [
  { name: 'অ্যাডমিন প্যানেল', href: '/admin', icon: <ShieldEllipsis size={18} /> },
  {
    name: 'কোর্স ম্যানেজমেন্ট',
    icon: <BookOpen size={18} />,
    subItems: [
      { name: 'সকল কোর্স', href: '/admin/courses' },
      { name: 'কোর্স যোগ করুন', href: '/admin/courses/new' },
    ],
  },
  {
    name: 'রিসোর্স ম্যানেজমেন্ট',
    icon: <FileVideo size={18} />,
    subItems: [
      { name: 'সকল রিসোর্স', href: '/admin/resources' },
      { name: 'রিসোর্স যোগ করুন', href: '/admin/resources/new' },
    ],
  },
  {
    name: 'ওয়ার্কশপ ম্যানেজমেন্ট',
    icon: <GraduationCap size={18} />,
    subItems: [
      { name: 'সকল ওয়ার্কশপ', href: '/admin/workshops' },
      { name: 'ওয়ার্কশপ যোগ করুন', href: '/admin/workshops/new' },
      { name: 'ওয়ার্কশপ এনরোলমেন্টস', href: '/admin/workshop-enrollments' },
    ],
  },
  {
    name: 'রেকর্ডিং ম্যানেজমেন্ট',
    icon: <FileVideo size={18} />,
    subItems: [
      { name: 'সকল ভিডিও', href: '/admin/recordings' },
      { name: 'ভিডিও যোগ করুন', href: '/admin/recordings/new' },
    ],
  },
  {
    name: 'পরীক্ষা',
    icon: <ClipboardList size={18} />,
    subItems: [
      { name: 'সকল পরীক্ষা', href: '/admin/exams' },
      { name: 'পরীক্ষা যোগ করুন', href: '/admin/exams/new' },
    ],
  },
  {
    name: 'সার্টিফিকেট ম্যানেজমেন্ট',
    icon: <Badge size={18} />,
    subItems: [
      { name: 'সকল সার্টিফিকেট', href: '/admin/certificates' },
    ],
  },
  {
    name: 'জব ম্যানেজমেন্ট',
    icon: <Briefcase size={18} />,
    subItems: [
      { name: 'সকল জব', href: '/admin/jobs' },
      { name: 'জব পোস্ট করুন', href: '/admin/jobs/new' },
      { name: 'জব এপ্লিকেন্টস', href: '/admin/jobs/applicants' },
    ],
  },
  {
    name: 'ইউজার ম্যানেজমেন্ট',
    icon: <Users size={18} />,
    subItems: [
      { name: 'সকল ইউজার', href: '/admin/users' },
      { name: 'এডমিন রোল দিন', href: '/admin/users/roles' },
    ],
  },
  {
    name: 'পেমেন্ট ম্যানেজমেন্ট',
    icon: <DollarSign size={18} />,
    subItems: [
      { name: 'সকল পেমেন্ট', href: '/admin/payments' },
    ],
  },
  {
    name: 'কুপন ম্যানেজমেন্ট',
    icon: <TicketPercent size={18} />,
    subItems: [
      { name: 'সকল কুপন', href: '/admin/coupons' },
      { name: 'কুপন যোগ করুন', href: '/admin/coupons/new' },
    ],
  },
  { name: 'স্টুডেন্ট ড্যাশবোর্ড', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
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
        <Image src="/logos/logo-insilicology.svg" alt="Logo" width={120} height={40} className="w-28 h-auto" />
      </div>

      {/* Menu Items - Scrollable */}
      <nav className="space-y-1 flex-1 overflow-y-auto p-1 scrollbar-thin">
        {adminMenu.map((item) => (
          <div key={item.name}>
            {item.subItems ? (
              <button
                onClick={() => toggleMenu(item.name)}
                className="flex items-center justify-between w-full px-4 py-3 cursor-pointer font-medium border-1 border-transparent hover:bg-yellow-50 hover:text-orange-500 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.icon} <span className="text-base">{item.name}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${openMenus[item.name] ? "rotate-180" : ""}`}
                />
              </button>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer font-medium border-1 border-transparent hover:bg-yellow-50 hover:text-orange-500 rounded-lg transition-colors"
                onClick={() => handleItemClick()}
              >
                {item.icon} <span className="text-base">{item.name}</span>
              </Link>
            )}

            {/* Sub Items */}
            {item.subItems && openMenus[item.name] && (
              <div className="ml-8 mt-1 space-y-1">
                {item.subItems.map((sub) => (
                  <Link
                    key={sub.name}
                    href={sub.href}
                    className="block px-4 py-2 cursor-pointer border-1 border-transparent hover:bg-yellow-50 hover:text-orange-500 rounded-lg transition-colors"
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
