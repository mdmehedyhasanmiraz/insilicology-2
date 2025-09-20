'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  ShieldEllipsis,
  BookOpen,
  FileVideo,
  ClipboardList,
  Users,
  LayoutDashboard,
  Briefcase,
  FileText,
} from 'lucide-react';

const adminMenu = [
  {
    name: 'অ্যাডমিন প্যানেল',
    href: '/admin',
    icon: <ShieldEllipsis size={28} className="text-orange-600" />,
    short: 'নিয়ন্ত্রণ ও পরিদর্শন',
  },
  {
    name: 'কোর্স ম্যানেজমেন্ট',
    href: '/admin/courses',
    icon: <BookOpen size={28} className="text-orange-600" />,
    short: 'কোর্স তৈরি ও আপডেট',
  },
  {
    name: 'ভিডিও ও রিসোর্স',
    href: '/admin/resources',
    icon: <FileVideo size={28} className="text-orange-600" />,
    short: 'রিসোর্স আপলোড ও ম্যানেজ',
  },
  {
    name: 'পরীক্ষা',
    href: '/admin/exams',
    icon: <ClipboardList size={28} className="text-orange-600" />,
    short: 'পরীক্ষার তালিকা ও ম্যানেজমেন্ট',
  },
  {
    name: 'ইউজার ম্যানেজমেন্ট',
    href: '/admin/users',
    icon: <Users size={28} className="text-orange-600" />,
    short: 'ইউজার তথ্য ও রোল নিয়ন্ত্রণ',
  },
  {
    name: 'চাকরির বিজ্ঞাপন',
    href: '/admin/jobs',
    icon: <Briefcase size={28} className="text-orange-600" />,
    short: 'চাকরির বিজ্ঞাপন তৈরি ও ম্যানেজ',
  },
  {
    name: 'জব অ্যাপ্লিকেশন',
    href: '/admin/applications',
    icon: <FileText size={28} className="text-orange-600" />,
    short: 'জব অ্যাপ্লিকেশন দেখুন ও ম্যানেজ করুন',
  },
  {
    name: 'স্টুডেন্ট ড্যাশবোর্ড',
    href: '/dashboard',
    icon: <LayoutDashboard size={28} className="text-orange-600" />,
    short: 'স্টুডেন্ট ভিউ দেখতে এখানে যান',
  },
];

export default function AdminDashboardPage() {
  const supabase = createClientComponentClient();
  const [adminName, setAdminName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user.id)
        .single();

      if (!error) {
        const display = data.name?.trim() || data.email?.split('@')[0] || 'অ্যাডমিন';
        setAdminName(display);
      }
    }

    fetchAdmin();
  }, [supabase]);

  return (
    <div className="p-2 md:p-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        স্বাগতম{adminName ? `, ${adminName}` : ''}! 🛠️
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminMenu.map((item, idx) => (
          <Link href={item.href} key={idx}>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md hover:shadow-orange-200 p-5 transition-all duration-300 group border border-white hover:border-orange-300">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 rounded-full p-2 group-hover:bg-orange-200">
                  {item.icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold group-hover:text-orange-600">{item.name}</h2>
                  <p className="text-sm text-gray-500">{item.short}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
