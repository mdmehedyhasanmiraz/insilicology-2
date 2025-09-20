"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Edit, Trash2, Eye, Calendar, MapPin, Clock, Briefcase, Users } from "lucide-react";
import { Job } from "@/types/job.type";

export default function JobsListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) setJobs(data as Job[]);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const handleTogglePublish = async (jobId: string, currentStatus: boolean) => {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("jobs")
      .update({ is_published: !currentStatus })
      .eq("id", jobId);

    if (!error) {
      setJobs(jobs.map(job => 
        job.id === jobId 
          ? { ...job, is_published: !currentStatus }
          : job
      ));
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে আপনি এই চাকরিটি মুছে ফেলতে চান?")) {
      return;
    }

    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId);

    if (!error) {
      setJobs(jobs.filter(job => job.id !== jobId));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'bg-green-100 text-green-800';
      case 'part-time':
        return 'bg-blue-100 text-blue-800';
      case 'internship':
        return 'bg-yellow-100 text-yellow-800';
      case 'contract':
        return 'bg-orange-100 text-orange-800';
      case 'volunteer':
        return 'bg-amber-100 text-amber-800';
      case 'temporary':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationTypeColor = (locationType: string) => {
    switch (locationType) {
      case 'remote':
        return 'bg-blue-100 text-blue-800';
      case 'on-site':
        return 'bg-purple-100 text-purple-800';
      case 'hybrid':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bn-BD", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">💼 চাকরির বিজ্ঞাপন তালিকা</h1>
        <div className="flex gap-2">
          <Link href="/admin/applications">
            <Button variant="outline">View Applications</Button>
          </Link>
          <Link href="/admin/jobs/new">
            <Button>+ নতুন চাকরি</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-lg bg-white shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">কোনো চাকরি পাওয়া যায়নি</h3>
          <p className="text-gray-600 mb-6">
            প্রথম চাকরির বিজ্ঞাপন তৈরি করুন
          </p>
          <Link href="/admin/jobs/new">
            <Button>+ প্রথম চাকরি যোগ করুন</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-lg bg-white shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-semibold line-clamp-2 flex-1">{job.title}</h2>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleTogglePublish(job.id, job.is_published)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        job.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {job.is_published ? 'প্রকাশিত' : 'অপ্রকাশিত'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                    {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLocationTypeColor(job.location_type)}`}>
                    {job.location_type.charAt(0).toUpperCase() + job.location_type.slice(1).replace('-', ' ')}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {job.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>পোস্ট: {formatDate(job.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>আবেদনের শেষ: {formatDate(job.application_deadline)}</span>
                  </div>
                  {job.job_code && (
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      কোড: {job.job_code}
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-3">
                  {job.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    <Link href={`/admin/applications?job=${job.id}`}>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="View Applications">
                        <Users size={16} />
                      </button>
                    </Link>
                    <Link href={`/career/${job.slug}`} target="_blank">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Job">
                        <Eye size={16} />
                      </button>
                    </Link>
                    <Link href={`/admin/jobs/${job.slug}`}>
                      <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit Job">
                        <Edit size={16} />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Job"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(job.application_deadline) > new Date() ? (
                      <span className="text-green-600">আবেদন খোলা</span>
                    ) : (
                      <span className="text-red-600">আবেদন বন্ধ</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 