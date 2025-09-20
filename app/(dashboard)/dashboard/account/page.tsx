'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { KeyRound, User, GraduationCap, MapPin, MessageCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import EditUserModal from './EditUserModal';
import { toast } from 'react-hot-toast';
import { PublicUser } from '@/types/users.type';

export default function AccountPage() {
  const supabase = createClientComponentClient();
  
  const [user, setUser] = useState<PublicUser | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const refreshUserData = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      toast.error("User data fetch failed");
    } else {
      setUser(data);
    }
  };

  useEffect(() => {
    async function fetchUserData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      if (session?.user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
  
        if (error) {
          toast.error("User data fetch failed");
        } else {
          setUser(data);
        }
      }
  
      setLoading(false);
    }
  
    fetchUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
    
          if (error) {
            toast.error("User data fetch failed");
          } else {
            setUser(data);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-purple-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-8 h-8 text-purple-600 animate-pulse" />
            </div>
            <p className="text-gray-600">Loading your account information...</p>
          </div>
        </div>
      </div>
    );
  }

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem('confirmNewPassword') as HTMLInputElement).value;
  
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match.');
    }
  
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters.');
    }
  
    setLoading(true);
  
    // Re-authenticate is needed only if you want to verify old password (optional)
    const { data: session } = await supabase.auth.getSession();
    const email = session?.session?.user?.email;
  
    if (!email) {
      setLoading(false);
      return toast.error('User not authenticated.');
    }
  
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
  
    if (signInError) {
      setLoading(false);
      return toast.error('Current password is incorrect.');
    }
  
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
  
    setLoading(false);
  
    if (error) {
      toast.error('Failed to update password.');
    } else {
      toast.success('Password updated successfully!');
      setShowPasswordForm(false);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              প্রোফাইল
            </h1>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <button
                onClick={refreshUserData}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title="Refresh profile data"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
              <EditUserModal 
                user={user} 
                onUserUpdate={(updatedUser) => setUser(updatedUser)} 
              />
            </div>
          )}
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 className="text-sm font-semibold text-purple-600">ব্যক্তিগত তথ্য</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'নাম', value: user?.name, icon: User },
              { label: 'ইমেইল', value: user?.email, icon: MessageCircle },
              { label: 'লিঙ্গ', value: user?.gender, icon: User },
              { label: 'জেলা', value: user?.district, icon: MapPin },
              { label: 'WhatsApp', value: user?.whatsapp, icon: MessageCircle },
            ].map((field) => {
              const IconComponent = field.icon;
              return (
                <div key={field.label} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-500 mb-1">{field.label}</div>
                    <div className="text-base font-semibold text-gray-800">
                      {field.value || <span className="text-gray-400">Not provided</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Academic Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 className="text-sm font-semibold text-purple-600">একাডেমিক তথ্য <span className="text-gray-500 text-xs font-normal">(যদি আপনি শিক্ষার্থী হন)</span></h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'বিশ্ববিদ্যালয়', value: user?.university },
              { label: 'বিভাগ', value: user?.department },
              { label: 'একাডেমিক বছর', value: user?.academic_year },
              { label: 'একাডেমিক সেশন', value: user?.academic_session },
            ].map((field) => (
              <div key={field.label} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 mb-1">{field.label}</div>
                  <div className="text-base font-semibold text-gray-800">
                    {field.value || <span className="text-gray-400">Not provided</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">পাসওয়ার্ড পরিবর্তন</h3>
            </div>
            <button
              onClick={() => setShowPasswordForm((prev) => !prev)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <KeyRound size={16} />
              {showPasswordForm ? 'Hide Form' : 'Change Password'}
            </button>
          </div>

          {showPasswordForm && (
            <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">বর্তমান পাসওয়ার্ড</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="আপনার বর্তমান পাসওয়ার্ড লিখুন"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">নতুন পাসওয়ার্ড</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="নতুন পাসওয়ার্ড লিখুন (কমপক্ষে ৬ অক্ষর)"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmNewPassword"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="নতুন পাসওয়ার্ড আবার লিখুন"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                  >
                    বাতিল করুন
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    {loading ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
