'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TicketPercent } from 'lucide-react';

type CouponForm = {
  code: string;
  description: string;
  discount_type: 'percentage' | 'amount';
  discount_value: number;
  currency: string;
  applies_to: 'any' | 'course' | 'workshop' | 'book' | 'other';
  course_id: string;
  workshop_id: string;
  min_order_amount: string;
  max_uses: string;
  max_uses_per_user: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
};

type CouponPayload = {
  code: string;
  description: string | undefined;
  discount_type: 'percentage' | 'amount';
  discount_value: number;
  currency: string;
  applies_to: 'any' | 'course' | 'workshop' | 'book' | 'other';
  course_id: string | null;
  workshop_id: string | null;
  min_order_amount: number | null;
  max_uses: number | null;
  max_uses_per_user: number | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
};

export default function AdminCouponsEditPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [workshops, setWorkshops] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CouponForm>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    currency: 'BDT',
    applies_to: 'any',
    course_id: '',
    workshop_id: '',
    min_order_amount: '',
    max_uses: '',
    max_uses_per_user: '',
    starts_at: '',
    expires_at: '',
    is_active: true,
  });

  useEffect(() => {
    (async () => {
      const [c, w, r] = await Promise.all([
        supabase.from('courses').select('id, title').order('title'),
        supabase.from('workshops').select('id, title').order('title'),
        supabase.from('coupons').select('*').eq('id', id).single(),
      ]);
      setCourses(c.data || []);
      setWorkshops(w.data || []);
      if (!r.error && r.data) {
        const d = r.data;
        setForm({
          code: d.code,
          description: d.description || '',
          discount_type: d.discount_type,
          discount_value: Number(d.discount_value),
          currency: d.currency || 'BDT',
          applies_to: d.applies_to,
          course_id: d.course_id || '',
          workshop_id: d.workshop_id || '',
          min_order_amount: d.min_order_amount?.toString() || '',
          max_uses: d.max_uses?.toString() || '',
          max_uses_per_user: d.max_uses_per_user?.toString() || '',
          starts_at: d.starts_at ? new Date(d.starts_at).toISOString().slice(0,16) : '',
          expires_at: d.expires_at ? new Date(d.expires_at).toISOString().slice(0,16) : '',
          is_active: !!d.is_active,
        });
      }
      setLoading(false);
    })();
  }, [id, supabase]);

  const saveCoupon = async () => {
    try {
      setSaving(true);
      const payload: CouponPayload = {
        code: form.code.trim(),
        description: form.description || undefined,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        currency: form.currency || 'BDT',
        applies_to: form.applies_to,
        course_id: form.applies_to === 'course' ? (form.course_id || null) : null,
        workshop_id: form.applies_to === 'workshop' ? (form.workshop_id || null) : null,
        min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        max_uses_per_user: form.max_uses_per_user ? Number(form.max_uses_per_user) : null,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        is_active: !!form.is_active,
      };
      const { error } = await supabase.from('coupons').update(payload).eq('id', id);
      if (error) {
        alert('আপডেট ব্যর্থ হয়েছে');
        return;
      }
      router.push('/admin/coupons');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">লোড হচ্ছে...</div>;

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-3 md:px-6">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <TicketPercent className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">কুপন এডিট করুন</h1>
          </div>
        </div>
      </div>

      <div className="px-0 md:px-6 pb-10">
        <div className="bg-white rounded-lg border p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border px-3 py-2 rounded" placeholder="কুপন কোড" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <input className="border px-3 py-2 rounded" placeholder="বর্ণনা (ঐচ্ছিক)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <select className="border px-3 py-2 rounded" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as CouponForm['discount_type'] })}>
              <option value="percentage">Percentage</option>
              <option value="amount">Amount</option>
            </select>
            <input type="number" className="border px-3 py-2 rounded" placeholder="Discount Value" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />

            <input className="border px-3 py-2 rounded" placeholder="Currency (BDT)" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            <select className="border px-3 py-2 rounded" value={form.applies_to} onChange={(e) => setForm({ ...form, applies_to: e.target.value as CouponForm['applies_to'] })}>
              <option value="any">Any</option>
              <option value="course">Course</option>
              <option value="workshop">Workshop</option>
              <option value="book">Book</option>
              <option value="other">Other</option>
            </select>

            {form.applies_to === 'course' && (
              <select className="border px-3 py-2 rounded" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            )}
            {form.applies_to === 'workshop' && (
              <select className="border px-3 py-2 rounded" value={form.workshop_id} onChange={(e) => setForm({ ...form, workshop_id: e.target.value })}>
                <option value="">Select Workshop</option>
                {workshops.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
              </select>
            )}

            <input type="number" className="border px-3 py-2 rounded" placeholder="Minimum Order Amount" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} />
            <input type="number" className="border px-3 py-2 rounded" placeholder="Max Uses (overall)" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
            <input type="number" className="border px-3 py-2 rounded" placeholder="Max Uses Per User" value={form.max_uses_per_user} onChange={(e) => setForm({ ...form, max_uses_per_user: e.target.value })} />

            <input type="datetime-local" className="border px-3 py-2 rounded" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
            <input type="datetime-local" className="border px-3 py-2 rounded" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />

            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => router.push('/admin/coupons')} className="px-4 py-2 rounded border border-gray-300">Cancel</button>
            <button disabled={saving} onClick={saveCoupon} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}


