"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Search, Calendar, Clock, Users, Tag, Filter } from "lucide-react";
import { Workshop } from "@/types/workshop.type";

interface Props {
  initialWorkshops: Workshop[];
  initialTags: string[];
}

export default function WorkshopsPageClient({ initialWorkshops, initialTags }: Props) {
  const searchParams = useSearchParams();
  const [workshops] = useState<Workshop[]>(initialWorkshops);
  const [loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [allTags] = useState<string[]>(initialTags);

  // Initialize tag filter from URL parameter
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      setTagFilter(tagParam);
    }
  }, [searchParams]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  };

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date();
  };

  const isLive = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    return now >= start && now <= end;
  };

  const getStatusBadge = (startTime: string, endTime: string) => {
    if (isLive(startTime, endTime)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          🔴 Live Now
        </span>
      );
    }
    if (isUpcoming(startTime)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ⏰ Upcoming
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        📺 Recorded
      </span>
    );
  };

  // Filter workshops
  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = 
      workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.speaker_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = tagFilter === "all" || (workshop.tags && workshop.tags.includes(tagFilter));

    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎓 Interactive Workshops
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Join our expert-led workshops to gain hands-on experience and practical skills. 
          From live sessions to recorded content, we have something for everyone.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search workshops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
          </div>
          
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          >
            <option value="all">All Topics</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="mr-2" size={16} />
            {filteredWorkshops.length} of {workshops.length} workshops
          </div>
        </div>
      </div>

      {/* Workshops Grid */}
      {filteredWorkshops.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No workshops found</h3>
          <p className="text-gray-600">
            {workshops.length === 0 ? "No workshops are available at the moment." : "No workshops match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.map((workshop) => (
            <div
              key={workshop.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Banner Image */}
              <div className="relative aspect-[1200/630] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
                {workshop.banner_image_path ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/workshop-banners/${workshop.banner_image_path}`}
                    alt={workshop.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #ffffff 1px, transparent 1px), radial-gradient(circle at 80% 30%, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px, 24px 24px" }} />
                    <div className="relative text-center px-4">
                      <div className="text-white/60 text-[10px] uppercase tracking-[0.2em] mb-1">Workshop</div>
                      <h3 className="text-white font-extrabold text-xl leading-tight line-clamp-2">{workshop.title}</h3>
                    </div>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-1 px-1">
                      {workshop.speaker_name && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-white/90 bg-white/10 border border-white/10 rounded-full px-2.5 py-0.5 backdrop-blur-sm">
                          <Users size={10} className="text-white/80" />
                          <span className="truncate max-w-[120px]">{workshop.speaker_name}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[10px] text-white/90 bg-white/10 border border-white/10 rounded-full px-2.5 py-0.5 backdrop-blur-sm">
                        <Calendar size={10} className="text-white/80" />
                        {formatDate(workshop.start_time)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-white/90 bg-white/10 border border-white/10 rounded-full px-2.5 py-0.5 backdrop-blur-sm">
                        <Clock size={10} className="text-white/80" />
                        {formatTime(workshop.start_time)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  {getStatusBadge(workshop.start_time, workshop.end_time)}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {workshop.title}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {workshop.description}
                </p>

                {/* Speaker */}
                <div className="flex items-center gap-2 mb-4">
                  <Users size={14} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {workshop.speaker_name}
                  </span>
                </div>

                {/* Tags */}
                {workshop.tags && workshop.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {workshop.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                      >
                        <Tag size={10} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                    {workshop.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{workshop.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Date and Time */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>{formatDate(workshop.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} />
                    <span>
                      {formatTime(workshop.start_time)} - {formatTime(workshop.end_time)}
                      <span className="text-gray-500 ml-1">
                        ({getDuration(workshop.start_time, workshop.end_time)})
                      </span>
                    </span>
                  </div>
                </div>

                {/* Price and Capacity */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold text-gray-900">
                    {workshop.price_regular === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : workshop.price_offer > 0 ? (
                      <div>
                        <span className="text-gray-500 line-through text-sm">৳{workshop.price_regular.toLocaleString('bn-BD')}</span>
                        <span className="text-red-600 ml-2">৳{workshop.price_offer.toLocaleString('bn-BD')}</span>
                      </div>
                    ) : (
                      `৳${workshop.price_regular.toLocaleString('bn-BD')}`
                    )}
                  </div>
                  {workshop.capacity && (
                    <div className="text-sm text-gray-600">
                      Capacity: {workshop.capacity} seats
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Link href={`/workshops/${workshop.slug}`} className="block">
                  <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-0">
                    {isLive(workshop.start_time, workshop.end_time) ? 'Join Now' : 
                     isUpcoming(workshop.start_time) ? 'Register Now' : 'Watch Recording'}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
