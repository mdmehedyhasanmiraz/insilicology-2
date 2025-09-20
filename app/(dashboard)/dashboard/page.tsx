"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  CreditCard,
  Users,
  AlertTriangle,
  X,
  Video,
  BookMarked,
  NotepadText,
  GraduationCap,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";
import Link from "next/link";

const menuItems = [
  {
    name: "ড্যাশবোর্ড",
    href: "/dashboard",
    icon: <LayoutDashboard size={24} className="text-indigo-600" />,
    short: "আপনার নিয়ন্ত্রণ কেন্দ্র",
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-indigo-50",
    iconBg: "bg-indigo-100",
  },
  {
    name: "আমার কোর্স",
    href: "/dashboard/my-courses",
    icon: <BookMarked size={24} className="text-emerald-600" />,
    short: "সকল কোর্স, লাইভ ও রেকর্ডেড",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    iconBg: "bg-emerald-100",
  },
  {
    name: "আমার ওয়ার্কশপ",
    href: "/dashboard/my-workshops",
    icon: <GraduationCap size={24} className="text-amber-600" />,
    short: "সকল ওয়ার্কশপ",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    iconBg: "bg-amber-100",
  },
  {
    name: "ক্লাস রেকর্ডিং",
    href: "/dashboard/recordings",
    icon: <Video size={24} className="text-rose-600" />,
    short: "সকল রেকর্ডেড কোর্স",
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50",
    iconBg: "bg-rose-100",
  },
  {
    name: "রিসোর্স",
    href: "/dashboard/resources",
    icon: <BookOpen size={24} className="text-blue-600" />,
    short: "সব কোর্সের রিসোর্স এখানে আছে",
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    iconBg: "bg-blue-100",
  },
  {
    name: "আমার পরীক্ষা",
    href: "/dashboard/my-exams",
    icon: <NotepadText size={24} className="text-violet-600" />,
    short: "সব কোর্সের পরীক্ষা এখানে আছে",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    iconBg: "bg-violet-100",
  },
  {
    name: "সার্টিফিকেট",
    href: "/dashboard/certificates",
    icon: <Award size={24} className="text-yellow-600" />,
    short: "সকল প্রাপ্ত সার্টিফিকেট",
    color: "from-yellow-500 to-amber-600",
    bgColor: "bg-yellow-50",
    iconBg: "bg-yellow-100",
  },
  {
    name: "পেমেন্ট",
    href: "/dashboard/payments",
    icon: <CreditCard size={24} className="text-green-600" />,
    short: "পেমেন্ট হিস্টোরি দেখুন",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    iconBg: "bg-green-100",
  },
  {
    name: "সাপোর্ট",
    href: "/dashboard/support",
    icon: <Users size={24} className="text-slate-600" />,
    short: "সাহায্যের জন্য যোগাযোগ",
    color: "from-slate-500 to-gray-600",
    bgColor: "bg-slate-50",
    iconBg: "bg-slate-100",
  },
];

// Custom hook for live time
function useLiveTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  return currentTime;
}

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [userName, setUserName] = useState<string | null>(null);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const currentTime = useLiveTime();

  // Stats
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    liveCourses: 0,
    recordedCourses: 0,
    examsTaken: 0,
    certificates: 0,
    payments: 0,
    enrolledWorkshops: 0,
    totalExams: 0,
    passedExams: 0,
    examSuccessRate: 0,
    workshopProgressPercent: 0,
  });

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("name, email, gender, district, whatsapp")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
        return;
      }

      // Set name
      const displayName =
        data.name?.trim() !== ""
          ? data.name
          : data.email?.split("@")[0] || "ব্যবহারকারী";

      setUserName(displayName);

      // Check profile completeness
      const missing = !data.name || !data.gender || !data.district || !data.whatsapp;
      setProfileIncomplete(missing);
    }

    fetchUser();
  }, [supabase]);

  useEffect(() => {
    async function fetchStats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Enrolled courses
      const { data: userCourses } = await supabase
        .from('user_courses')
        .select('course_id, courses(type)')
        .eq('user_id', user.id);
      type UserCourse = { course_id: string; courses: { type: string } | null };
      // type UserWorkshop = { workshop_id: string };
      const enrolledCourses = (userCourses as UserCourse[] | null)?.length || 0;
      const liveCourses = (userCourses as UserCourse[] | null)?.filter((c) => c.courses?.type === 'live').length || 0;
      const recordedCourses = (userCourses as UserCourse[] | null)?.filter((c) => c.courses?.type === 'recorded').length || 0;

      // Enrolled workshops
      const { data: userWorkshops, error: userWorkshopsError } = await supabase
        .from('user_workshops')
        .select('workshop_id, created_at, workshops(start_time, end_time)')
        .eq('user_id', user.id);
      if (userWorkshopsError) {
        console.error('Error fetching user workshops for stats:', userWorkshopsError);
      }
      type WorkshopJoin = { workshop_id: string; created_at: string; workshops: { start_time: string; end_time: string } | null };
      const enrolledWorkshops = (userWorkshops as WorkshopJoin[] | null)?.length || 0;

      // Compute latest workshop progress percent
      let workshopProgressPercent = 0;
      const list = (userWorkshops as WorkshopJoin[] | null) || [];
      if (list.length > 0) {
        // Pick the latest by start_time; if equal/missing, fallback to created_at
        const withDates = list.filter(w => w.workshops?.start_time && w.workshops?.end_time);
        if (withDates.length > 0) {
          withDates.sort((a, b) => {
            const aStart = new Date(a.workshops!.start_time).getTime();
            const bStart = new Date(b.workshops!.start_time).getTime();
            if (aStart === bStart) {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return bStart - aStart;
          });
          const latest = withDates[0];
          const now = Date.now();
          const start = new Date(latest.workshops!.start_time).getTime();
          const end = new Date(latest.workshops!.end_time).getTime();
          if (isFinite(start) && isFinite(end) && end > start) {
            const raw = ((now - start) / (end - start)) * 100;
            workshopProgressPercent = Math.max(0, Math.min(100, Math.round(raw)));
          }
        }
      }
      // Exams taken
      const { data: examResponses } = await supabase
        .from('exam_responses')
        .select('id')
        .eq('user_id', user.id);
      const examsTaken = (examResponses as { id: string }[] | null)?.length || 0;

      // Certificates
      const { data: certs } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', user.id);
      const certificates = (certs as { id: string }[] | null)?.length || 0;

      // Payments
      const { data: pays } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', user.id);
      const payments = (pays as { id: string }[] | null)?.length || 0;

      setStats({ 
        enrolledCourses, 
        liveCourses, 
        recordedCourses, 
        examsTaken, 
        certificates, 
        payments, 
        enrolledWorkshops,
        totalExams: 0, // TODO: Implement total exams count
        passedExams: 0, // TODO: Implement passed exams count
        examSuccessRate: 0, // TODO: Implement exam success rate
        workshopProgressPercent,
      });
    }
    fetchStats();
  }, [supabase]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="mb-4">
        <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-6 md:p-9 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px), radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 1px)`,
              backgroundSize: '40px 40px, 40px 40px'
            }} />
          </div>

          {/* River + Boat Animation */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28">
            {/* Back wave */}
            <svg className="absolute inset-x-0 bottom-0 w-full h-full" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="waveGradBack" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path fill="url(#waveGradBack)" d="M0,80 C120,100 240,40 360,60 C480,80 600,140 720,120 C840,100 960,40 1080,60 C1200,80 1320,120 1440,100 L1440,160 L0,160 Z" />
            </svg>

            {/* Front wave with gentle horizontal drift */}
            <svg className="absolute inset-x-0 bottom-0 w-[200%] h-[120%] animate-wave-slow" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true" style={{ left: '-25%' }}>
              <defs>
                <linearGradient id="waveGradFront" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path fill="url(#waveGradFront)" d="M0,90 C120,110 240,50 360,70 C480,90 600,150 720,130 C840,110 960,50 1080,70 C1200,90 1320,130 1440,110 L1440,160 L0,160 Z" />
            </svg>

            {/* Boat - fixed at bottom right, small and bobbing */}
            <div className="absolute bottom-6 right-6 animate-boat-bob flex items-end" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Mast */}
                <rect x="31" y="10" width="2" height="26" fill="#f8fafc" opacity="0.9" />
                {/* Sail */}
                <path d="M32 12 L32 34 L52 28 Z" fill="#fde047" opacity="0.95" />
                <path d="M32 12 L32 34 L16 30 Z" fill="#22d3ee" opacity="0.9" />
                {/* Hull */}
                <path d="M10 38 C16 50 48 50 54 38 L10 38 Z" fill="#0ea5e9" />
                <path d="M12 38 C18 47 46 47 52 38 L12 38 Z" fill="#0369a1" />
              </svg>
            </div>
          </div>

          {/* Scoped animations */}
          <style jsx>{`
            @keyframes boat-bob {
              0% { transform: translateY(0) rotate(0deg); }
              25% { transform: translateY(-2px) rotate(-0.6deg); }
              50% { transform: translateY(0.5px) rotate(0.4deg); }
              75% { transform: translateY(-1.5px) rotate(-0.4deg); }
              100% { transform: translateY(0) rotate(0deg); }
            }
            @keyframes wave-drift {
              0% { transform: translateX(0); }
              50% { transform: translateX(-5%); }
              100% { transform: translateX(0); }
            }
            .animate-boat-bob {
              animation: boat-bob 4.5s ease-in-out infinite;
            }
            .animate-wave-slow {
              animation: wave-drift 10s ease-in-out infinite;
            }
          `}</style>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl text-yellow-400 font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  স্বাগতম{userName ? `, ${userName}` : ""}!
                </h1>
                <p className="text-purple-200 text-sm md:text-base">
                  নতুন কিছু শেখা হোক আমাদের সাথে
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-2 text-green-300">
                <Calendar className="w-4 h-4" />
                <span>{currentTime.toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-200">
                <Clock className="w-4 h-4" />
                <span className="font-hind-siliguri tracking-wider">
                  {currentTime.toLocaleTimeString('bn-BD', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit',
                    hour12: true 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Warning */}
      {profileIncomplete && showWarning && (
        <div className="my-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full -translate-y-16 translate-x-16 opacity-50" />
            
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">
                  প্রোফাইল সম্পূর্ণ করুন
                </h3>
                <p className="text-amber-700 mb-4 leading-relaxed">
                  আপনার প্রোফাইল এখনো সম্পূর্ণ নয়। অনুগ্রহ করে প্রোফাইল সম্পূর্ণ করুন যেন সেবাগুলো ঠিকমত পাওয়া যায়।
                </p>
                
                <div className="flex items-center gap-3">
                  <Link 
                    href="/dashboard/account" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-200 font-medium text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    প্রোফাইল সম্পূর্ণ করুন
                  </Link>
                  
                  <button 
                    onClick={() => setShowWarning(false)} 
                    className="inline-flex items-center gap-2 px-4 py-2 text-amber-600 hover:text-amber-800 transition-colors text-sm"
                  >
                    পরে করব
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setShowWarning(false)} 
                className="w-8 h-8 bg-amber-100 hover:bg-amber-200 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X size={16} className="text-amber-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="my-4">  
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard 
            label="মোট কোর্স" 
            value={stats.enrolledCourses} 
            icon={<BookOpen className="w-5 h-5" />} 
            trend={`${stats.enrolledCourses > 0 ? 'Enrolled' : 'Not yet'}`}
            color="indigo"
            link="/dashboard/my-courses"
          />
          <StatCard 
            label="ওয়ার্কশপ" 
            value={stats.enrolledWorkshops} 
            icon={<GraduationCap className="w-5 h-5" />} 
            trend={
              stats.enrolledWorkshops > 0 
                ? `${stats.workshopProgressPercent}%`
                : 'Not yet'
            }
            color="emerald"
            progressPercent={stats.enrolledWorkshops > 0 ? stats.workshopProgressPercent : undefined}
            link="/dashboard/my-workshops"
          />
          <StatCard 
            label="পরীক্ষা" 
            value={stats.examsTaken} 
            icon={<NotepadText className="w-5 h-5" />} 
            trend={`${stats.examsTaken > 0 ? 'Taken' : 'Not yet'}`}
            color="amber"
            link="/dashboard/my-exams"
          />
          <StatCard 
            label="সার্টিফিকেট" 
            value={stats.certificates} 
            icon={<Award className="w-5 h-5" />} 
            trend={`${stats.certificates > 0 ? 'Earned' : 'Not yet'}`}
            color="purple"
            link="/dashboard/certificates"
          />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="my-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">ড্যাশবোর্ড মেনু</h2>
          <div className="text-sm text-slate-500">আপনার প্রয়োজন অনুযায়ী নির্বাচন করুন</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {menuItems.map((item, idx) => (
            <Link href={item.href} key={idx}>
              <div className="group relative bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 overflow-hidden">
                {/* Subtle Hover Background */}
                <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className={`w-14 h-14 ${item.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-800 transition-colors duration-300 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-300 leading-relaxed">
                      {item.short}
                    </p>
                  </div>
                  
                  <div className="w-8 h-8 bg-slate-100 group-hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      {/* <div className="mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">সাম্প্রতিক কার্যক্রম</h2>
            <Link href="/dashboard/my-courses" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              সব দেখুন
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">নতুন কোর্সে ভর্তি হয়েছেন</p>
                <p className="text-xs text-slate-500">আজ সকাল ১০:৩০</p>
              </div>
              <div className="text-xs text-emerald-600 font-medium">সম্পন্ন</div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <NotepadText className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">পরীক্ষা সম্পন্ন করেছেন</p>
                <p className="text-xs text-slate-500">গতকাল বিকাল ৩:১৫</p>
              </div>
              <div className="text-xs text-amber-600 font-medium">৮৫%</div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">সার্টিফিকেট অর্জন করেছেন</p>
                <p className="text-xs text-slate-500">২ দিন আগে</p>
              </div>
              <div className="text-xs text-purple-600 font-medium">অর্জিত</div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon, 
  trend, 
  color,
  progressPercent,
  link
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode; 
  trend?: string;
  color: string;
  progressPercent?: number;
  link?: string;
}) {
  const colorClasses = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    green: "bg-green-50 border-green-200 text-green-700",
    slate: "bg-slate-50 border-slate-200 text-slate-700",
  };
  const progressGradients: Record<string, string> = {
    indigo: "bg-gradient-to-r from-indigo-500 to-indigo-300",
    emerald: "bg-gradient-to-r from-emerald-500 to-emerald-300",
    amber: "bg-gradient-to-r from-amber-500 to-amber-300",
    purple: "bg-gradient-to-r from-purple-500 to-purple-300",
    blue: "bg-gradient-to-r from-blue-500 to-blue-300",
    rose: "bg-gradient-to-r from-rose-500 to-rose-300",
    green: "bg-gradient-to-r from-green-500 to-green-300",
    slate: "bg-gradient-to-r from-slate-500 to-slate-300",
  };

  const CardContent = (
    <div className={`bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-xs px-2 py-1 rounded-lg ${
            trend.includes('No') || trend.includes('yet') 
              ? 'text-slate-500 bg-slate-100' 
              : 'text-emerald-600 bg-emerald-100'
          }`}>
            {trend}
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <div className="text-3xl font-bold text-slate-800">{value}</div>
        <div className="text-sm text-slate-600">{label}</div>
      </div>
      
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${progressGradients[color as keyof typeof progressGradients]}`}
          style={{ 
            width: `${typeof progressPercent === 'number' 
              ? Math.max(0, Math.min(100, progressPercent)) 
              : (value > 0 ? 100 : 0)}%` 
          }}
        />
      </div>
    </div>
  );

  if (link) {
    return (
      <Link href={link} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
