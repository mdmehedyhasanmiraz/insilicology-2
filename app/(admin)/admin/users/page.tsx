'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Search, Plus, Eye, Mail, MapPin, GraduationCap, Building, Calendar, Users } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  whatsapp?: string | null;
  district?: string;
  university?: string;
  department?: string;
  academic_year?: string;
  academic_session?: string;
  role?: string;
  created_at?: string;
}

interface EditFormType {
  name: string;
  email: string;
  whatsapp?: string | null;
  role: string;
  district: string;
  university: string;
  department: string;
  academic_year: string;
  academic_session: string;
}

export default function UsersPage() {
  const supabase = createClientComponentClient();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        setFilteredUsers([]);
      }
      else {
        setUsers(data || []);
        setFilteredUsers(data || []);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [supabase]);

  useEffect(() => {
    let filtered = users;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.university || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.district || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, users]);

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'admin': { color: 'bg-red-100 text-red-800', text: 'Admin' },
      'student': { color: 'bg-blue-100 text-blue-800', text: 'Student' },
      'teacher': { color: 'bg-green-100 text-green-800', text: 'Teacher' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { color: 'bg-gray-100 text-gray-800', text: role || 'Unknown' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openDetails = (u: User) => {
    setSelectedUser(u);
    setIsModalOpen(true);
    setIsEditing(false);
    setEditForm({
      name: u.name,
      email: u.email,
      whatsapp: (u as User & { whatsapp?: string }).whatsapp || '',
      role: u.role,
      district: u.district,
      university: u.university,
      department: u.department,
      academic_year: u.academic_year,
      academic_session: u.academic_session,
    });
  };
  const closeDetails = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setIsEditing(false);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      const updatePayload: Partial<User> & { whatsapp?: string | null } = {
        name: editForm.name || '',
        email: editForm.email || '',
        role: editForm.role || undefined,
        district: editForm.district || undefined,
        university: editForm.university || undefined,
        department: editForm.department || undefined,
        academic_year: editForm.academic_year || undefined,
        academic_session: editForm.academic_session || undefined,
        whatsapp: (editForm as EditFormType).whatsapp || null,
      };
      const { error } = await supabase.from('users').update(updatePayload).eq('id', selectedUser.id);
      if (error) {
        alert('আপডেট ব্যর্থ হয়েছে');
        return;
      }
      // Update local lists
      const updatedUser: User = { ...selectedUser, ...updatePayload } as User;
      setSelectedUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setFilteredUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="px-4 md:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ইউজার ম্যানেজমেন্ট</h1>
              <p className="text-sm text-gray-600">সকল ইউজার দেখুন এবং পরিচালনা করুন</p>
            </div>
          </div>
          <Link 
            href="/admin/users/new" 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন ইউজার
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-0 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">মোট ইউজার</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <GraduationCap className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">শিক্ষার্থী</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'student').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">বিশ্ববিদ্যালয়</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(users.filter(u => u.university).map(u => u.university)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">জেলা</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(users.filter(u => u.district).map(u => u.district)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="নাম, ইমেইল, বিশ্ববিদ্যালয়, বিভাগ বা জেলা দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">সকল রোল</option>
                <option value="student">শিক্ষার্থী</option>
                <option value="teacher">শিক্ষক</option>
                <option value="admin">অ্যাডমিন</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">লোড হচ্ছে...</p>
            </div>
          ) : (
            <>
              <div className="px-4 md:px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  ইউজার লিস্ট ({filteredUsers.length} জন)
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ইউজার
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        যোগাযোগ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        শিক্ষাগত তথ্য
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        রোল
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        যোগদান তারিখ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        অ্যাকশন
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => openDetails(user)}
                        onKeyDown={(e) => { if (e.key === 'Enter') openDetails(user); }}
                        tabIndex={0}
                        role="button"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name || 'নাম নেই'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">{user.email}</span>
                          </div>
                          {user.district && (
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500">{user.district}</span>
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="space-y-1">
                            {user.university && (
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{user.university}</span>
                              </div>
                            )}
                            {user.department && (
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{user.department}</span>
                              </div>
                            )}
                            {user.academic_year && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{user.academic_year}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          {getRoleBadge(user.role || 'student')}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {formatDate(user.created_at || '')}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => { e.stopPropagation(); openDetails(user); }}
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              দেখুন
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">কোন ইউজার পাওয়া যায়নি</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || selectedRole !== 'all' 
                      ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোন ইউজার নেই।' 
                      : 'এখনও কোন ইউজার যোগদান করেননি।'
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeDetails}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-lg shadow-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">ইউজার ডিটেইলস</h3>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 rounded border border-gray-300 text-sm">এডিট</button>
                )}
                {isEditing && (
                  <>
                    <button disabled={saving} onClick={handleSaveUser} className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm disabled:opacity-60">{saving ? 'সেভ হচ্ছে...' : 'সেভ'}</button>
                    <button disabled={saving} onClick={() => { setIsEditing(false); setEditForm({
                      name: selectedUser.name,
                      email: selectedUser.email,
                      whatsapp: (selectedUser as User & { whatsapp?: string }).whatsapp || '',
                      role: selectedUser.role,
                      district: selectedUser.district,
                      university: selectedUser.university,
                      department: selectedUser.department,
                      academic_year: selectedUser.academic_year,
                      academic_session: selectedUser.academic_session,
                    }); }} className="px-3 py-1.5 rounded border border-gray-300 text-sm">ক্যানসেল</button>
                  </>
                )}
                <button onClick={closeDetails} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">বেসিক তথ্য</h4>
                {!isEditing ? (
                  <>
                    <p className="text-sm text-gray-800">নাম: {selectedUser.name || '—'}</p>
                    <p className="text-sm text-gray-800">ইমেইল: {selectedUser.email || '—'}</p>
                    <p className="text-sm text-gray-800">ফোন/WhatsApp: {(selectedUser as User & { whatsapp?: string }).whatsapp || '—'}</p>
                    <p className="text-sm text-gray-800">রোল: {selectedUser.role || 'student'}</p>
                    <p className="text-sm text-gray-800">যোগদান: {formatDate(selectedUser.created_at || '')}</p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" placeholder="নাম" />
                    <input value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" placeholder="ইমেইল" />
                    <input value={(editForm as EditFormType).whatsapp || ''} onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" placeholder="WhatsApp" />
                    <select value={editForm.role || ''} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full border px-3 py-2 rounded text-sm">
                      <option value="">রোল নির্বাচন করুন</option>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    <p className="text-xs text-gray-500">যোগদান: {formatDate(selectedUser.created_at || '')}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">শিক্ষাগত তথ্য</h4>
                {!isEditing ? (
                  <>
                    <p className="text-sm">বিশ্ববিদ্যালয়: {selectedUser.university || '—'}</p>
                    <p className="text-sm">বিভাগ: {selectedUser.department || '—'}</p>
                    <p className="text-sm">একাডেমিক ইয়ার: {selectedUser.academic_year || '—'}</p>
                    <p className="text-sm">একাডেমিক সেশন: {selectedUser.academic_session || '—'}</p>
                    <p className="text-sm">জেলা: {selectedUser.district || '—'}</p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <input value={editForm.university || ''} onChange={(e) => setEditForm({ ...editForm, university: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" placeholder="বিশ্ববিদ্যালয়" />
                    <input value={editForm.department || ''} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" placeholder="বিভাগ" />
                    <input value={editForm.academic_year || ''} onChange={(e) => setEditForm({ ...editForm, academic_year: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" placeholder="একাডেমিক ইয়ার" />
                    <input value={editForm.academic_session || ''} onChange={(e) => setEditForm({ ...editForm, academic_session: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" placeholder="একাডেমিক সেশন" />
                    <input value={editForm.district || ''} onChange={(e) => setEditForm({ ...editForm, district: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" placeholder="জেলা" />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              {!isEditing ? (
                <button onClick={closeDetails} className="px-4 py-2 rounded border border-gray-300">বন্ধ করুন</button>
              ) : (
                <button disabled={saving} onClick={handleSaveUser} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60">{saving ? 'সেভ হচ্ছে...' : 'সেভ'}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
