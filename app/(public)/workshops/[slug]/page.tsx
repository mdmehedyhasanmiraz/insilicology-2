"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { 
  Calendar, 
  Clock, 
  Users, 
  Tag, 
  Play, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import StickyEnrollButton from "@/components/workshops/StickyEnrollButton";
import { Workshop } from "@/types/workshop.type";

export default function WorkshopDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [earlybirdSlotsLeft, setEarlybirdSlotsLeft] = useState<number | null>(null);

  useEffect(() => {
    const fetchWorkshop = async () => {
      const supabase = createClientComponentClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch workshop
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      
      if (error || !data) {
        console.error("Error fetching workshop:", error);
        router.push("/workshops");
        return;
      }
      
      setWorkshop(data);
      
      // Debug workshop data
      console.log("Workshop data:", {
        id: data.id,
        title: data.title,
        earlybirds_count: data.earlybirds_count,
        price_earlybirds: data.price_earlybirds
      });

      // Check if user is enrolled
      if (user) {
        const { data: enrollments, error } = await supabase
          .from("user_workshops")
          .select("*")
          .eq("user_id", user.id)
          .eq("workshop_id", data.id);
        
        if (!error && enrollments && enrollments.length > 0) {
          setIsEnrolled(true);
        } else {
          setIsEnrolled(false);
        }
      }

      // Calculate early bird slots left
      if (data.earlybirds_count && data.earlybirds_count > 0) {
        try {
          console.log("Starting early bird calculation for workshop:", data.id);
          
          const { data: enrollments, error: enrollmentError } = await supabase
            .from("user_workshops")
            .select("id, user_id, created_at")
            .eq("workshop_id", data.id);
          
          if (!enrollmentError && enrollments) {
            const totalEnrollments = enrollments.length;
            const slotsLeft = Math.max(0, data.earlybirds_count - totalEnrollments);
            console.log(`Early bird calculation: ${data.earlybirds_count} - ${totalEnrollments} = ${slotsLeft} slots left`);
            console.log("Enrollment details:", enrollments);
            setEarlybirdSlotsLeft(slotsLeft);
          } else {
            console.error("Enrollment query failed:", enrollmentError);
            setEarlybirdSlotsLeft(0);
          }
        } catch (error) {
          console.error("Exception in early bird calculation:", error);
          setEarlybirdSlotsLeft(0);
        }
      } else {
        setEarlybirdSlotsLeft(0);
      }
      
      setLoading(false);
    };
    fetchWorkshop();
  }, [slug, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bn-BD", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Dhaka'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("bn-BD", {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Dhaka'
    });
  };

  const isUpcoming = (startTime: string) => {
    const nowDhaka = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    const start = new Date(startTime);
    return start.getTime() > nowDhaka.getTime();
  };

  const isLive = (startTime: string, endTime: string) => {
    const nowDhaka = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    const start = new Date(startTime);
    const end = new Date(endTime);
    return nowDhaka >= start && nowDhaka <= end;
  };

  const isPast = (endTime: string) => {
    const nowDhaka = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    const end = new Date(endTime);
    return end.getTime() < nowDhaka.getTime();
  };

  const getStatusBadge = (startTime: string, endTime: string) => {
    if (isLive(startTime, endTime)) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          🔴 এখনই লাইভ
        </span>
      );
    }
    if (isUpcoming(startTime)) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          ⏰ Upcoming
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        📺 রেকর্ডেড
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ওয়ার্কশপ পাওয়া যায়নি</h1>
          <Link href="/workshops">
            <Button>ওয়ার্কশপে ফিরে যান</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{workshop.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            {getStatusBadge(workshop.start_time, workshop.end_time)}
            <span className="text-gray-600">স্পিকার: {workshop.speaker_name}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner Image */}
          <div className="relative aspect-[1200/630] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-lg overflow-hidden">
            {workshop.banner_image_path ? (
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/workshop-banners/${workshop.banner_image_path}`}
                alt={workshop.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #ffffff 1px, transparent 1px), radial-gradient(circle at 80% 30%, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px, 24px 24px" }} />
                <div className="relative text-center px-6">
                  <div className="text-white/60 text-xs uppercase tracking-widest mb-2">Workshop</div>
                  <h2 className="text-white font-extrabold text-2xl md:text-4xl leading-tight line-clamp-2">{workshop.title}</h2>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 px-4">
                  {workshop.speaker_name && (
                    <span className="inline-flex items-center gap-1 text-xs text-white/90 bg-white/10 border border-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
                      <Users className="w-3 h-3 text-white/80" />
                      <span className="truncate max-w-[160px]">{workshop.speaker_name}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-white/90 bg-white/10 border border-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
                    <Calendar className="w-3 h-3 text-white/80" />
                    {formatDate(workshop.start_time)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-white/90 bg-white/10 border border-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
                    <Clock className="w-3 h-3 text-white/80" />
                    {formatTime(workshop.start_time)}
                  </span>
                  {workshop.price_earlybirds && workshop.price_earlybirds > 0 && (earlybirdSlotsLeft ?? 0) > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-white/90 rounded-full px-3 py-1 backdrop-blur-sm bg-blue-500/80 border border-blue-400/80">
                      🎯 Earlybird
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* YouTube Video Overlay */}
            {workshop.youtube_url && isPast(workshop.end_time) && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <a
                  href={workshop.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Play size={16} className="mr-2" />
                  রেকর্ডিং দেখুন
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">এই ওয়ার্কশপ সম্পর্কে</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{workshop.description}</p>
            
            {/* Full Content */}
            <div className="prose max-w-none">
              <div className="text-gray-700 whitespace-pre-wrap">{workshop.full_content}</div>
            </div>
          </div>

          {/* Speaker Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">স্পিকার সম্পর্কে</h2>
            <div className="flex items-start gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{workshop.speaker_name}</h3>
                <p className="text-gray-600 mt-1">{workshop.speaker_bio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Workshop Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">ওয়ার্কশপের বিবরণ</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">শুরু</p>
                  <p className="font-bold">{formatDate(workshop.start_time)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">শেষ</p>
                  <p className="font-bold">{formatDate(workshop.end_time)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">সময়</p>
                  <p className="font-bold">
                    {formatTime(workshop.start_time)}
                  </p>
                </div>
              </div>

              {workshop.capacity && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">ধারণক্ষমতা</p>
                    <p className="font-bold">{workshop.capacity.toLocaleString('bn-BD')} জন</p>
                  </div>
                </div>
              )}

              {/* Earlybird Information - show only when slots available */}
              {workshop.price_earlybirds && workshop.price_earlybirds > 0 && (earlybirdSlotsLeft ?? 0) > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center text-blue-500">🎯</div>
                  <div>
                    <p className="text-sm text-gray-600">Earlybird Offer</p>
                    <p className="font-bold text-blue-600">৳{workshop.price_earlybirds.toLocaleString('bn-BD')}</p>
                    <p className="text-xs text-gray-500">{earlybirdSlotsLeft} spots available</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="text-2xl font-bold text-gray-900">
                  {workshop.price_regular === 0 ? (
                    <span className="text-green-600">ফ্রি</span>
                  ) : workshop.price_offer > 0 ? (
                    <div>
                      <span className="text-gray-500 line-through text-sm">৳{workshop.price_regular.toLocaleString('bn-BD')}</span>
                      <span className="text-red-600 ml-2">৳{workshop.price_offer.toLocaleString('bn-BD')}</span>
                    </div>
                  ) : (
                    `৳${workshop.price_regular.toLocaleString('bn-BD')}`
                  )}
                </div>
                
                {/* Earlybird Pricing - show only when slots available */}
                {workshop.price_earlybirds && workshop.price_earlybirds > 0 && (earlybirdSlotsLeft ?? 0) > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Earlybird Price</p>
                        <p className="text-lg font-bold text-blue-600">৳{workshop.price_earlybirds.toLocaleString('bn-BD')}</p>
                        {workshop.price_regular > 0 && (
                          <p className="text-xs text-green-600 font-medium">
                            Save ৳{(workshop.price_regular - workshop.price_earlybirds).toLocaleString('bn-BD')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Limited Spots</p>
                        <p className="text-sm font-semibold text-gray-700">{earlybirdSlotsLeft} available</p>
                      </div>
                    </div>
                    <div className="mt-2 p-2 rounded-lg bg-blue-50">
                      <p className="text-xs text-center text-blue-700">
                        🎯 Earlybird pricing available! Book early to save money.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {isPast(workshop.end_time) ? (
              <div className="text-center py-4">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">এই ওয়ার্কশপটি ইতিমধ্যে শেষ হয়ে গেছে।</p>
                {workshop.youtube_url && (
                  <a
                    href={workshop.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Play size={16} className="mr-2" />
                    রেকর্ডিং দেখুন
                  </a>
                )}
              </div>
            ) : isLive(workshop.start_time, workshop.end_time) ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Play className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-gray-600 mb-3">এই ওয়ার্কশপটি এখনই লাইভ চলছে!</p>
                {isEnrolled ? (
                  <div className="flex items-center justify-center text-green-600 mb-3">
                    <CheckCircle size={16} className="mr-2" />
                    আপনি জয়েন করেছেন
                  </div>
                ) : (
                <Link href={`/workshops/${workshop.slug}/enroll`}>
                  <Button 
                    className="bg-yellow-400 w-full hover:bg-yellow-500 text-black rounded-lg font-semibold text-lg"
                  >
                    এখনই জয়েন করুন
                  </Button>
                </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                {isEnrolled ? (
                  <div className="flex items-center justify-center text-green-600">
                    <CheckCircle size={16} className="mr-2" />
                    আপনি জয়েন করেছেন
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href={`/workshops/${workshop.slug}/enroll`}>
                      <Button 
                        className="bg-yellow-400 w-full hover:bg-yellow-500 text-black rounded-lg font-semibold text-lg"
                      >
                        এখনই জয়েন করুন
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          {workshop.tags && workshop.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">আলোচ্য বিষয়</h2>
              <div className="flex flex-wrap gap-2">
                {workshop.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
                  >
                    <Tag size={12} className="mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Enroll Button for Mobile */}
      <StickyEnrollButton
        workshopSlug={workshop.slug}
        price={workshop.price_offer > 0 ? workshop.price_offer : workshop.price_regular}
        originalPrice={workshop.price_offer > 0 ? workshop.price_regular : undefined}
        earlybirdPrice={earlybirdSlotsLeft && earlybirdSlotsLeft > 0 ? workshop.price_earlybirds : undefined}
        earlybirdSpotsLeft={earlybirdSlotsLeft || undefined}
        enrolled={isEnrolled}
        isLive={isLive(workshop.start_time, workshop.end_time)}
        isPast={isPast(workshop.end_time)}
        youtubeUrl={workshop.youtube_url}
      />
    </div>
  );
} 