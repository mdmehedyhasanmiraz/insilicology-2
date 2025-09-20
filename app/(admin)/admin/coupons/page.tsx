'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Search, Plus, TicketPercent, CheckCircle, XCircle, Clock } from 'lucide-react';

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'amount';
  discount_value: number;
  currency: string | null;
  applies_to: 'any' | 'course' | 'workshop' | 'book' | 'other';
  course_id: string | null;
  workshop_id: string | null;
  min_order_amount: number | null;
  max_uses: number | null;
  max_uses_per_user: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
};

export default function AdminCouponsListPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filtered, setFiltered] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'expired' | 'scheduled'>('all');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (!error) {
        setCoupons(data || []);
        setFiltered(data || []);
      }
      setLoading(false);
    })();
  }, [supabase]);

  useEffect(() => {
    const now = new Date().toISOString();
    let list = coupons;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      list = list.filter(c => c.code.toLowerCase().includes(t) || (c.description || '').toLowerCase().includes(t));
    }
    if (status !== 'all') {
      list = list.filter(c => {
        const isExpired = !!c.expires_at && c.expires_at < now;
        const isScheduled = !!c.starts_at && c.starts_at > now;
        const isActiveWindow = (!c.starts_at || c.starts_at <= now) && (!c.expires_at || c.expires_at > now);
        if (status === 'expired') return isExpired;
        if (status === 'scheduled') return isScheduled;
        return c.is_active && isActiveWindow;
      });
    }
    setFiltered(list);
  }, [searchTerm, status, coupons]);

  const formatWindow = (s: string | null, e: string | null) => {
    const fmt = (d: string) => new Date(d).toLocaleString('bn-BD');
    if (!s && !e) return '—';
    if (s && e) return `${fmt(s)} → ${fmt(e)}`;
    if (s) return `শুরু: ${fmt(s)}`;
    return `শেষ: ${fmt(e as string)}`;
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-3 md:px-6">
      <div className="px-4 md:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <TicketPercent className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">কুপন ম্যানেজমেন্ট</h1>
              <p className="text-sm text-gray-600">কুপন দেখুন, যোগ করুন ও সম্পাদনা করুন</p>
            </div>
          </div>
          <button onClick={() => router.push('/admin/coupons/new')} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" /> কুপন যোগ করুন
          </button>
        </div>
      </div>

      <div className="px-0 md:px-6 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="কোড বা বর্ণনা দিয়ে খুঁজুন..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'expired' | 'scheduled')} className="px-3 py-2 border rounded-lg">
              <option value="all">সব</option>
              <option value="active">চলমান</option>
              <option value="scheduled">সিডিউলড</option>
              <option value="expired">মেয়াদোত্তীর্ণ</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">লোড হচ্ছে...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">কোড</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">ছাড়</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">স্কোপ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">টাইম উইন্ডো</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map(c => {
                    const now = new Date();
                    const expired = !!c.expires_at && new Date(c.expires_at) < now;
                    const scheduled = !!c.starts_at && new Date(c.starts_at) > now;
                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{c.code}</div>
                          <div className="text-xs text-gray-500">{c.description || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-900">
                            {c.discount_type === 'percentage' ? `${c.discount_value}%` : `${c.currency || 'BDT'} ${c.discount_value}`}
                          </div>
                          {c.min_order_amount ? (
                            <div className="text-xs text-gray-500">Min: {(c.currency || 'BDT')} {c.min_order_amount}</div>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-sm text-gray-900">{c.applies_to}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-xs text-gray-700">{formatWindow(c.starts_at, c.expires_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expired ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Expired</span>
                          ) : scheduled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Scheduled</span>
                          ) : c.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Active</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => router.push(`/admin/coupons/${c.id}`)} className="text-blue-600 hover:text-blue-900">এডিট</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


