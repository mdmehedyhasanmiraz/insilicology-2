'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  DollarSign, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Eye,
  Calendar,
  BookOpen,
  GraduationCap,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllPayments, updatePaymentStatus, AdminPayment, updatePaymentDetails } from './actions';

// Using AdminPayment interface from actions.ts

interface PaymentStats {
  total: number;
  pending: number;
  successful: number;
  failed: number;
  refunded: number;
  totalAmount: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedChannel] = useState<string>('all');
  const [stats, setStats] = useState<PaymentStats>({
    total: 0,
    pending: 0,
    successful: 0,
    failed: 0,
    refunded: 0,
    totalAmount: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AdminPayment>>({});

  const openDetails = (p: AdminPayment) => {
    setSelectedPayment(p);
    setIsModalOpen(true);
    setIsEditing(false);
    setEditForm({
      amount: p.amount,
      currency: p.currency,
      payment_channel: p.payment_channel,
      status: p.status,
      transaction_id: p.transaction_id || '',
      bkash_payment_id: p.bkash_payment_id || '',
      paid_at: p.paid_at || '',
      is_verified: p.is_verified,
    });
  };
  const closeDetails = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
    setIsEditing(false);
  };

  const handleSavePayment = async () => {
    if (!selectedPayment) return;
    
    try {
      setSaving(true);
      const success = await updatePaymentDetails(selectedPayment.id, {
        amount: editForm.amount,
        currency: editForm.currency,
        payment_channel: editForm.payment_channel,
        status: editForm.status as 'pending' | 'successful' | 'failed' | 'refunded',
        transaction_id: (editForm.transaction_id as string) || undefined,
        bkash_payment_id: (editForm.bkash_payment_id as string) || undefined,
        paid_at: (editForm.paid_at as string) || undefined,
        is_verified: !!editForm.is_verified,
      });
      if (!success) {
        toast.error('আপডেট ব্যর্থ হয়েছে');
        return;
      }
      // Refresh UI state locally without refetch
      const updated: AdminPayment = {
        ...selectedPayment,
        amount: editForm.amount ?? selectedPayment.amount,
        currency: editForm.currency ?? selectedPayment.currency,
        payment_channel: editForm.payment_channel ?? selectedPayment.payment_channel,
        status: (editForm.status as 'pending' | 'successful' | 'failed' | 'refunded') ?? selectedPayment.status,
        transaction_id: (editForm.transaction_id as string) || undefined,
        bkash_payment_id: (editForm.bkash_payment_id as string) || undefined,
        paid_at: (editForm.paid_at as string) || selectedPayment.paid_at,
        is_verified: editForm.is_verified ?? selectedPayment.is_verified,
      };
      setSelectedPayment(updated);
      setPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
      setFilteredPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
      setIsEditing(false);
      toast.success('পেমেন্ট আপডেট হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      console.log('Fetching payments...');
      
      // Fetch payments using server action
      const data = await getAllPayments();
      console.log('Payments fetched:', data?.length || 0);

      if (!data || data.length === 0) {
        console.log('No payments data received');
        setPayments([]);
        calculateStats([]);
        return;
      }

      setPayments(data);
      calculateStats(data);
      console.log('Payments state updated successfully');
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('পেমেন্ট ডেটা লোড করতে সমস্যা হয়েছে');
      setPayments([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentData: AdminPayment[]) => {
    const stats = {
      total: paymentData.length,
      pending: paymentData.filter(p => p.status === 'pending').length,
      successful: paymentData.filter(p => p.status === 'successful').length,
      failed: paymentData.filter(p => p.status === 'failed').length,
      refunded: paymentData.filter(p => p.status === 'refunded').length,
      totalAmount: paymentData
        .filter(p => p.status === 'successful')
        .reduce((sum, p) => sum + p.amount, 0)
    };
    setStats(stats);
  };

  const filterPayments = () => {
    let filtered = payments;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.user?.name?.toLowerCase().includes(term) ||
        p.user?.email?.toLowerCase().includes(term) ||
        p.transaction_id?.toLowerCase().includes(term) ||
        p.bkash_payment_id?.toLowerCase().includes(term)
      );
    }
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }
    
    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => {
        if (selectedType === 'course' && p.course) return true;
        if (selectedType === 'workshop' && p.workshop) return true;
        if (selectedType === 'book' && p.book) return true;
        return false;
      });
    }
    
    // Filter by channel
    if (selectedChannel !== 'all') {
      filtered = filtered.filter(p => p.payment_channel === selectedChannel);
    }
    
    setFilteredPayments(filtered);
  };

  useEffect(() => {
    // Load payments on component mount
    fetchPayments();
  }, []);

  // Debug: Log payments when they change
  useEffect(() => {
    console.log('Payments loaded:', payments.length);
    if (payments.length > 0) {
      console.log('Sample payment:', payments[0]);
    }
  }, [payments]);

  useEffect(() => {
    filterPayments();
  }, [searchTerm, selectedStatus, selectedType, selectedChannel, payments]);

  const handleUpdatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      const success = await updatePaymentStatus(paymentId, newStatus);

      if (!success) {
        toast.error('পেমেন্ট স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
        return;
      }

      toast.success('পেমেন্ট স্ট্যাটাস আপডেট হয়েছে');
      fetchPayments(); // Refresh data
    } catch (error) {
      console.error('Error:', error);
      toast.error('পেমেন্ট স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'অপেক্ষমান' },
      'successful': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'সফল' },
      'failed': { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'ব্যর্থ' },
      'refunded': { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, text: 'ফেরত' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: Clock, 
      text: status 
    };
    
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'course': { color: 'bg-blue-100 text-blue-800', icon: GraduationCap, text: 'কোর্স' },
      'workshop': { color: 'bg-purple-100 text-purple-800', icon: Building, text: 'ওয়ার্কশপ' },
      'book': { color: 'bg-green-100 text-green-800', icon: BookOpen, text: 'বই' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: BookOpen, 
      text: type 
    };
    
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const getChannelBadge = (channel: string) => {
    const channelConfig = {
      'bkash': { color: 'bg-pink-100 text-pink-800', text: 'bKash' },
      'nagad': { color: 'bg-green-100 text-green-800', text: 'Nagad' },
      'rocket': { color: 'bg-orange-100 text-orange-800', text: 'Rocket' },
      'card': { color: 'bg-blue-100 text-blue-800', text: 'Card' },
      'manual': { color: 'bg-gray-100 text-gray-800', text: 'Manual' }
    };
    
    const config = channelConfig[channel as keyof typeof channelConfig] || { 
      color: 'bg-gray-100 text-gray-800', 
      text: channel 
    };
    
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString('bn-BD')}`;
  };

  return (
    <div className="min-h-screen max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="px-4 md:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">পেমেন্ট ম্যানেজমেন্ট</h1>
              <p className="text-sm text-gray-600">সকল পেমেন্ট দেখুন এবং পরিচালনা করুন</p>
            </div>
          </div>
          <button 
            onClick={fetchPayments}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            রিফ্রেশ
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-0 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">মোট পেমেন্ট</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">অপেক্ষমান</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">সফল</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successful}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">ব্যর্থ</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">মোট টাকা</p>
                <p className="text-2xl font-bold text-gray-900">
                  ৳{stats.totalAmount.toLocaleString('bn-BD')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="ট্রানজেকশন ID, bKash ID, ইউজার নাম, ইমেইল বা টাইটেল দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">সকল স্ট্যাটাস</option>
              <option value="pending">অপেক্ষমান</option>
              <option value="successful">সফল</option>
              <option value="failed">ব্যর্থ</option>
              <option value="refunded">ফেরত</option>
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">সকল ধরন</option>
              <option value="course">কোর্স</option>
              <option value="workshop">ওয়ার্কশপ</option>
              <option value="book">বই</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
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
                  পেমেন্ট লিস্ট ({filteredPayments.length} টি)
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        পেমেন্ট তথ্য
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        ইউজার
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        আইটেম
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        স্ট্যাটাস
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        তারিখ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        অ্যাকশন
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => openDetails(payment)}
                        onKeyDown={(e) => { if (e.key === 'Enter') openDetails(payment); }}
                        tabIndex={0}
                        role="button"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                {formatAmount(payment.amount, payment.currency)}
                              </span>
                              {getTypeBadge(payment.type)}
                            </div>
                            <div className="flex items-center gap-2">
                              {getChannelBadge(payment.payment_channel)}
                              {payment.transaction_id && (
                                <span className="text-xs text-gray-500 font-mono">
                                  ID: {payment.transaction_id.slice(0, 8)}...
                                </span>
                              )}
                            </div>
                            {payment.bkash_payment_id && (
                              <div className="text-xs text-gray-500">
                                bKash: {payment.bkash_payment_id}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {payment.user?.name?.charAt(0)?.toUpperCase() || payment.user?.email?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.user?.name || 'নাম নেই'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.user?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="space-y-1">
                            {payment.course && (
                              <div className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-900">{payment.course.title}</span>
                              </div>
                            )}
                            {payment.workshop && (
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-purple-500" />
                                <span className="text-sm text-gray-900">{payment.workshop.title}</span>
                              </div>
                            )}
                            {payment.book && (
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-900">{payment.book.title}</span>
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              ID: {payment.id.slice(0, 8)}...
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="space-y-2">
                            {getStatusBadge(payment.status)}
                            {payment.is_verified && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                <CheckCircle className="w-3 h-3" />
                                যাচাইকৃত
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(payment.created_at)}
                            </div>
                            {payment.paid_at && (
                              <div className="text-xs text-green-600">
                                পেইড: {formatDate(payment.paid_at)}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => { e.stopPropagation(); openDetails(payment); }}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              দেখুন
                            </button>
                            
                            {/* Status Update Dropdown */}
                            <select
                              value={payment.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleUpdatePaymentStatus(payment.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="pending">অপেক্ষমান</option>
                              <option value="successful">সফল</option>
                              <option value="failed">ব্যর্থ</option>
                              <option value="refunded">ফেরত</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredPayments.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">কোন পেমেন্ট পাওয়া যায়নি</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || selectedStatus !== 'all' || selectedType !== 'all'
                      ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোন পেমেন্ট নেই।' 
                      : 'এখনও কোন পেমেন্ট নেই।'
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeDetails}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-lg shadow-xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">পেমেন্ট ডিটেইলস</h3>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 rounded border border-gray-300 text-sm">এডিট</button>
                )}
                {isEditing && (
                  <>
                    <button disabled={saving} onClick={handleSavePayment} className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm disabled:opacity-60">{saving ? 'সেভ হচ্ছে...' : 'সেভ'}</button>
                    <button disabled={saving} onClick={() => { setIsEditing(false); setEditForm({
                      amount: selectedPayment.amount,
                      currency: selectedPayment.currency,
                      payment_channel: selectedPayment.payment_channel,
                      status: selectedPayment.status,
                      transaction_id: selectedPayment.transaction_id || '',
                      bkash_payment_id: selectedPayment.bkash_payment_id || '',
                      paid_at: selectedPayment.paid_at || '',
                      is_verified: selectedPayment.is_verified,
                    }); }} className="px-3 py-1.5 rounded border border-gray-300 text-sm">ক্যানসেল</button>
                  </>
                )}
                <button onClick={closeDetails} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">ইউজার তথ্য</h4>
                <p className="text-sm text-gray-800">নাম: {selectedPayment.user?.name || '—'}</p>
                <p className="text-sm text-gray-800">ইমেইল: {selectedPayment.user?.email || '—'}</p>
                <p className="text-sm text-gray-800">ফোন/WhatsApp: {selectedPayment.user?.whatsapp || '—'}</p>
                <p className="text-sm text-gray-800">ডিস্ট্রিক্ট: {selectedPayment.user?.district || '—'}</p>
                <p className="text-sm text-gray-800">ইউনিভার্সিটি: {selectedPayment.user?.university || '—'}</p>
                <p className="text-sm text-gray-800">ডিপার্টমেন্ট: {selectedPayment.user?.department || '—'}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">পেমেন্ট তথ্য</h4>
                {!isEditing ? (
                  <>
                    <p className="text-sm text-gray-800">অ্যামাউন্ট: {formatAmount(selectedPayment.amount, selectedPayment.currency)}</p>
                    <p className="text-sm text-gray-800">চ্যানেল: {selectedPayment.payment_channel}</p>
                    <p className="text-sm text-gray-800">স্ট্যাটাস: {selectedPayment.status}</p>
                    {selectedPayment.transaction_id && (
                      <p className="text-sm text-gray-800">ট্রানজেকশন ID: {selectedPayment.transaction_id}</p>
                    )}
                    {selectedPayment.bkash_payment_id && (
                      <p className="text-sm text-gray-800">bKash ID: {selectedPayment.bkash_payment_id}</p>
                    )}
                    <p className="text-sm text-gray-800">ক্রিয়েটেড: {formatDate(selectedPayment.created_at)}</p>
                    {selectedPayment.paid_at && (
                      <p className="text-sm text-gray-800">পেইড: {formatDate(selectedPayment.paid_at)}</p>
                    )}
                  </>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex gap-2">
                      <input type="number" value={editForm.amount as number | undefined ?? 0} onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })} className="w-full border px-3 py-2 rounded text-sm" placeholder="অ্যামাউন্ট" />
                      <input type="text" value={editForm.currency as string || ''} onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })} className="w-24 border px-3 py-2 rounded text-sm" placeholder="কারেন্সি" />
                    </div>
                    <select value={editForm.payment_channel as string || ''} onChange={(e) => setEditForm({ ...editForm, payment_channel: e.target.value })} className="w-full border px-3 py-2 rounded text-sm">
                      <option value="">চ্যানেল নির্বাচন করুন</option>
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                      <option value="card">Card</option>
                      <option value="manual">Manual</option>
                    </select>
                    <select value={editForm.status as string || ''} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'pending' | 'successful' | 'failed' | 'refunded' })} className="w-full border px-3 py-2 rounded text-sm">
                      <option value="pending">অপেক্ষমান</option>
                      <option value="successful">সফল</option>
                      <option value="failed">ব্যর্থ</option>
                      <option value="refunded">ফেরত</option>
                    </select>
                    <input type="text" value={editForm.transaction_id as string || ''} onChange={(e) => setEditForm({ ...editForm, transaction_id: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" placeholder="ট্রানজেকশন ID" />
                    <input type="text" value={editForm.bkash_payment_id as string || ''} onChange={(e) => setEditForm({ ...editForm, bkash_payment_id: e.target.value })} className="w-full border px-3 py-2 rounded text-sm" placeholder="bKash ID" />
                    <input type="datetime-local" value={editForm.paid_at ? new Date(editForm.paid_at as string).toISOString().slice(0,16) : ''} onChange={(e) => setEditForm({ ...editForm, paid_at: new Date(e.target.value).toISOString() })} className="w-full border px-3 py-2 rounded text-sm" />
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!editForm.is_verified} onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })} />
                      যাচাইকৃত
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">আইটেম</h4>
                {selectedPayment.course && <p className="text-sm">কোর্স: {selectedPayment.course.title}</p>}
                {selectedPayment.workshop && <p className="text-sm">ওয়ার্কশপ: {selectedPayment.workshop.title}</p>}
                {selectedPayment.book && <p className="text-sm">বই: {selectedPayment.book.title}</p>}
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">অন্যান্য</h4>
                <p className="text-sm">ID: {selectedPayment.id}</p>
                <p className="text-sm">ভেরিফাইড: {selectedPayment.is_verified ? 'হ্যাঁ' : 'না'}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {!isEditing ? (
                <>
                  <button onClick={closeDetails} className="px-4 py-2 rounded border border-gray-300">বন্ধ করুন</button>
                  <button onClick={() => handleUpdatePaymentStatus(selectedPayment.id, selectedPayment.status === 'successful' ? 'refunded' : 'successful')} className="px-4 py-2 rounded bg-blue-600 text-white">
                    {selectedPayment.status === 'successful' ? 'Refund Mark' : 'Mark Successful'}
                  </button>
                </>
              ) : (
                <button disabled={saving} onClick={handleSavePayment} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60">{saving ? 'সেভ হচ্ছে...' : 'সেভ'}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
