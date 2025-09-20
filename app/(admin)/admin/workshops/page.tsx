"use client";

import { useEffect, useState, Suspense } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Search, Calendar, Clock, Users, Filter, Plus, Edit, Eye, Trash2 } from "lucide-react";

interface Workshop {
  id: string;
  title: string;
  slug: string;
  description: string;
  full_content: string;
  tags: string[];
  speaker_name: string;
  speaker_bio: string;
  price_regular: number;
  price_offer: number;
  price_earlybirds?: number;
  earlybirds_count?: number;
  capacity: number;
  start_time: string;
  end_time: string;
  status: string;
  banner_image_path: string;
  youtube_url?: string;
  group_link?: string;
  category?: string;
  created_at: string;
}

function AdminWorkshopsContent() {
  const searchParams = useSearchParams();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [allTags, setAllTags] = useState<string[]>([]);

  // Initialize filters from URL parameters
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const tagParam = searchParams.get('tag');
    if (statusParam) setStatusFilter(statusParam);
    if (tagParam) setTagFilter(tagParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchWorkshops = async () => {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setWorkshops(data);
        
        // Extract all unique tags
        const tags = new Set<string>();
        data.forEach(workshop => {
          if (workshop.tags) {
            workshop.tags.forEach((tag: string) => tags.add(tag));
          }
        });
        setAllTags(Array.from(tags).sort());
      }
      setLoading(false);
    };
    fetchWorkshops();
  }, []);

  const handleStatusChange = async (workshopId: string, newStatus: string) => {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("workshops")
      .update({ status: newStatus })
      .eq("id", workshopId);

    if (!error) {
      setWorkshops(workshops.map(workshop => 
        workshop.id === workshopId 
          ? { ...workshop, status: newStatus }
          : workshop
      ));
    }
  };

  const handleDelete = async (workshopId: string) => {
    if (!confirm("Are you sure you want to delete this workshop? This action cannot be undone.")) {
      return;
    }

    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("workshops")
      .delete()
      .eq("id", workshopId);

    if (!error) {
      setWorkshops(workshops.filter(workshop => workshop.id !== workshopId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'published':
        return 'Published';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Draft';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getTimeStatus = (startTime: string, endTime: string) => {
    if (isLive(startTime, endTime)) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          🔴 Live Now
        </span>
      );
    }
    if (isUpcoming(startTime)) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ⏰ Upcoming
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        📺 Past
      </span>
    );
  };

  // Filter workshops
  const filteredWorkshops = workshops.filter(workshop => {
    const matchesSearch = 
      workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.speaker_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || workshop.status === statusFilter;
    const matchesTag = tagFilter === "all" || (workshop.tags && workshop.tags.includes(tagFilter));
    const matchesCategory = categoryFilter === "all" || workshop.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesTag && matchesCategory;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🎓 Workshop Management</h1>
          <p className="text-gray-600 mt-2">Manage all workshops and their content</p>
        </div>
        <Link href="/admin/workshops/new">
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-0">
            <Plus size={16} className="mr-2" />
            Add Workshop
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

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

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
          >
            <option value="all">All Categories</option>
            <option value="academic">Academic</option>
            <option value="professional">Professional</option>
            <option value="technical">Technical</option>
            <option value="creative">Creative</option>
            <option value="business">Business</option>
            <option value="other">Other</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="mr-2" size={16} />
            {filteredWorkshops.length} of {workshops.length} workshops
          </div>
        </div>
      </div>

      {/* Workshops List */}
      {filteredWorkshops.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No workshops found</h3>
          <p className="text-gray-600 mb-4">
            {workshops.length === 0 ? "No workshops have been created yet." : "No workshops match your filters."}
          </p>
          <Link href="/admin/workshops/new">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-0">
              <Plus size={16} className="mr-2" />
              Create Your First Workshop
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWorkshops.map((workshop) => (
            <div
              key={workshop.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{workshop.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workshop.status)}`}>
                      {getStatusText(workshop.status)}
                    </span>
                    {getTimeStatus(workshop.start_time, workshop.end_time)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{workshop.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{workshop.speaker_name}</span>
                    </div>
                    {workshop.category && (
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          workshop.category === 'academic' ? 'bg-blue-100 text-blue-800' :
                          workshop.category === 'professional' ? 'bg-green-100 text-green-800' :
                          workshop.category === 'technical' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {workshop.category}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(workshop.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>
                        {workshop.price_offer > 0 ? (
                          <>
                            <span className="line-through text-gray-400">৳{workshop.price_regular}</span>
                            <span className="text-red-600 ml-1">৳{workshop.price_offer}</span>
                          </>
                        ) : (
                          `৳${workshop.price_regular}`
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/workshops/${workshop.slug}`} target="_blank">
                    <Button size="sm" variant="outline">
                      <Eye size={16} className="mr-2" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/admin/workshops/${workshop.slug}`}>
                    <Button size="sm" variant="outline">
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(workshop.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Status:
                  </span>
                  <select
                    value={workshop.status}
                    onChange={(e) => handleStatusChange(workshop.id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="text-sm text-gray-500">
                  ID: {workshop.id.slice(0, 8)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminWorkshopsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <AdminWorkshopsContent />
    </Suspense>
  );
} 