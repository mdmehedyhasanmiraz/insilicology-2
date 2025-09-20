"use client";

import { useEffect, useState, Suspense } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Eye, Download, Filter, Search, Calendar, User, Mail, Phone } from "lucide-react";
import { JobApplication } from "@/types/job.type";

interface ApplicationWithJob extends JobApplication {
  job: {
    title: string;
    slug: string;
  };
}

function ApplicationsListContent() {
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<ApplicationWithJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);

  // Initialize job filter from URL parameter
  useEffect(() => {
    const jobParam = searchParams.get('job');
    if (jobParam) {
      setJobFilter(jobParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClientComponentClient();
      
      // Fetch jobs for filter dropdown
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id, title")
        .order("title");
      
      if (jobsData) setJobs(jobsData);

      // Fetch applications with job details
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          job:jobs(title, slug)
        `)
        .order("created_at", { ascending: false });
      
      if (!error && data) setApplications(data as ApplicationWithJob[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", applicationId);

    if (!error) {
      setApplications(applications.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus as 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired' }
          : app
      ));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'hired':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'reviewed':
        return 'Reviewed';
      case 'shortlisted':
        return 'Shortlisted';
      case 'rejected':
        return 'Rejected';
      case 'hired':
        return 'Hired';
      default:
        return 'Pending';
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

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesJob = jobFilter === "all" || app.job_id === jobFilter;

    return matchesSearch && matchesStatus && matchesJob;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">📋 Job Applications</h1>
        <div className="flex gap-2">
          <Link href="/admin/jobs">
            <Button variant="outline">View Jobs</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, or job..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>

          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
          >
            <option value="all">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="mr-2" size={16} />
            {filteredApplications.length} of {applications.length} applications
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600">
            {applications.length === 0 ? "No applications have been submitted yet." : "No applications match your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{application.full_name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status || 'pending')}`}>
                      {getStatusText(application.status || 'pending')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{application.job.title}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Mail size={14} />
                      <span>{application.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone size={14} />
                      <span>{application.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>Applied: {formatDate(application.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/admin/applications/${application.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye size={16} className="mr-2" />
                      View Details
                    </Button>
                  </Link>
                  {application.resume_url && (
                    <a
                      href={application.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Download size={16} className="mr-2" />
                      Resume
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Status:
                  </span>
                  <select
                    value={application.status || 'pending'}
                    onChange={(e) => handleStatusChange(application.id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                  </select>
                </div>

                <div className="text-sm text-gray-500">
                  ID: {application.id.slice(0, 8)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ApplicationsListPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    }>
      <ApplicationsListContent />
    </Suspense>
  );
} 