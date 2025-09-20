"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Download, Mail, Phone, Calendar, ExternalLink, Edit, Save } from "lucide-react";
import { JobApplication } from "@/types/job.type";

interface ApplicationWithJob extends JobApplication {
  job: {
    title: string;
    slug: string;
  };
}

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationWithJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    const fetchApplication = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          job:jobs(title, slug)
        `)
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("Error fetching application:", error);
        router.push("/admin/applications");
        return;
      }
      
      if (data) {
        setApplication(data as ApplicationWithJob);
        setAdminNotes(data.admin_notes || "");
      }
      setLoading(false);
    };
    fetchApplication();
  }, [id, router]);

  const handleStatusChange = async (newStatus: string) => {
    if (!application) return;

    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", application.id);

    if (!error) {
      setApplication({ ...application, status: newStatus as "pending" | "reviewed" | "shortlisted" | "rejected" | "hired" });
    }
  };

  const handleSaveNotes = async () => {
    if (!application) return;

    setSaving(true);
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("applications")
      .update({ admin_notes: adminNotes })
      .eq("id", application.id);

    if (!error) {
      setApplication({ ...application, admin_notes: adminNotes });
      setIsEditing(false);
    }
    setSaving(false);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
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

  if (!application) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Application not found</h1>
          <Link href="/admin/applications">
            <Button>Back to Applications</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/applications">
            <Button variant="outline" size="sm">
              <ArrowLeft size={16} className="mr-2" />
              Back to Applications
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Application Details</h1>
            <p className="text-gray-600">ID: {application.id}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {application.resume_url && (
            <a
              href={application.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download size={16} className="mr-2" />
              Download Resume
            </a>
          )}
          <Link href={`/career/${application.job.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink size={16} className="mr-2" />
              View Job
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Applicant Information</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status || 'pending')}`}>
                {getStatusText(application.status || 'pending')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <p className="text-gray-900 font-medium">{application.full_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <a href={`mailto:${application.email}`} className="text-blue-600 hover:text-blue-700">
                    {application.email}
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <a href={`tel:${application.phone}`} className="text-blue-600 hover:text-blue-700">
                    {application.phone}
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <p className="text-gray-900">{formatDate(application.date_of_birth)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
                <a 
                  href={application.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <ExternalLink size={14} />
                  View Profile
                </a>
              </div>

              {application.facebook_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Profile</label>
                  <a 
                    href={application.facebook_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <ExternalLink size={14} />
                    View Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Address Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Present Address */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Present Address</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Division:</span> {application.present_address_division}</p>
                  <p><span className="font-medium">District:</span> {application.present_address_district}</p>
                  <p><span className="font-medium">Upazila:</span> {application.present_address_upazila}</p>
                  <p><span className="font-medium">Details:</span> {application.present_address_detail}</p>
                </div>
              </div>

              {/* Permanent Address */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Permanent Address</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Division:</span> {application.permanent_address_division}</p>
                  <p><span className="font-medium">District:</span> {application.permanent_address_district}</p>
                  <p><span className="font-medium">Upazila:</span> {application.permanent_address_upazila}</p>
                  <p><span className="font-medium">Details:</span> {application.permanent_address_detail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          {application.cover_letter && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cover Letter</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{application.cover_letter}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <p className="text-gray-900 font-medium">{application.job.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applied On</label>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-gray-900">{formatDate(application.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                <select
                  value={application.status || 'pending'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Admin Notes</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-amber-600 hover:text-amber-700"
              >
                {isEditing ? <Save size={16} /> : <Edit size={16} />}
              </button>
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                  placeholder="Add notes about this application..."
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveNotes} disabled={saving} size="sm">
                    {saving ? 'Saving...' : 'Save Notes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setAdminNotes(application.admin_notes || "");
                    }} 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3">
                {application.admin_notes ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{application.admin_notes}</p>
                ) : (
                  <p className="text-gray-500 italic">No notes added yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 