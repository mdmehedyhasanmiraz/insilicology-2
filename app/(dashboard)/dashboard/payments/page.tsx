'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { Payment } from '@/types/payment.type'

export default function PaymentsPage() {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('Authentication error')
          return
        }

        if (session?.user) {
          setUser(session.user)
          await fetchUserPayments(session.user.id)
        } else {
          setUser(null)
          setPayments([])
        }
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchUserPayments(session.user.id)
        } else {
          setUser(null)
          setPayments([])
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  async function fetchUserPayments(userId: string) {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          course:course_id (id, title, slug),
          workshop:workshop_id (id, title, slug),
          book:book_id (id, title, slug)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching payments:', error)
        setError('Failed to load payments')
        return
      }

      setPayments(payments || [])
    } catch (err) {
      console.error('Error in fetchUserPayments:', err)
      setError('Failed to load payments')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'refunded':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'successful':
        return 'সফল'
      case 'pending':
        return 'অপেক্ষমান'
      case 'failed':
        return 'ব্যর্থ'
      case 'refunded':
        return 'ফেরত'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (err) {
      console.error('Error in formatDate:', err)
      return 'Invalid date'
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT'
    }).format(amount)
  }

  // const getTypeText = (type: string | null | undefined) => {
  //   switch (type) {
  //     case 'course': return 'কোর্স';
  //     case 'workshop': return 'ওয়ার্কশপ';
  //     case 'book': return 'বই';
  //     default: return type || 'অন্যান্য';
  //   }
  // }
  // const getPurposeText = (purpose: string | null | undefined) => {
  //   switch (purpose) {
  //     case 'course': return 'কোর্স';
  //     case 'workshop': return 'ওয়ার্কশপ';
  //     case 'book': return 'বই';
  //     case 'other': return 'অন্যান্য';
  //     default: return purpose || 'অন্যান্য';
  //   }
  // }

  const getChannelText = (channel: string) => {
    switch (channel) {
      case 'bkash': return 'bKash';
      case 'nagad': return 'Nagad';
      case 'rocket': return 'Rocket';
      case 'card': return 'Card';
      case 'manual': return 'Manual';
      case 'other': return 'Other';
      default: return channel;
    }
  }

  if (loading) {
    return (
      <div className="p-2 md:p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">আমার পেমেন্টসমূহ</h1>
          <div className="text-sm text-gray-500">
            মোট পেমেন্ট: {payments.length}
          </div>
        </div>
        <div className="animate-pulse">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-6 bg-gray-200 rounded w-32"></div>
                      <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-5 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-2 md:p-4">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 mb-2">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-2 md:p-4">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🔐</div>
          <p className="text-gray-600 mb-2">দয়া করে লগইন করুন</p>
          <p className="text-sm text-gray-500">পেমেন্ট দেখতে লগইন করুন</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 md:p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold">আমার পেমেন্টসমূহ</h1>
        <div className="text-sm text-gray-500">
          মোট পেমেন্ট: {payments.length}
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💳</div>
          <p className="text-gray-600 mb-2">কোন পেমেন্ট পাওয়া যায়নি</p>
          <p className="text-sm text-gray-500">আপনার প্রথম কোর্স কিনুন</p>
          <a 
            href="/courses" 
            className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            কোর্স দেখুন
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-2xl shadow-sm hover:shadow-lg transition-shadow bg-white p-6 flex flex-col gap-2 border border-gray-100"
              style={{ minHeight: 140 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                    {payment.type === 'course' && payment.course?.title + ' (কোর্স)'}
                    {payment.type === 'workshop' && payment.workshop?.title + ' (ওয়ার্কশপ)'}
                    {payment.type === 'book' && payment.book?.title + ' (বই)'}
                    {!payment.type && (payment.course?.title || payment.workshop?.title || payment.book?.title || 'পেমেন্ট')}
                  </span>
                  <span className="text-2xl font-bold text-purple-700">
                    {formatAmount(payment.amount)}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)} shadow-sm`}>
                  {getStatusText(payment.status)}
                </span>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-gray-50 rounded-xl p-3 flex flex-col items-start justify-center min-w-0">
                    <span className="text-xs text-gray-400 font-medium mb-1">পেমেন্ট মাধ্যম</span>
                    <span className="text-gray-700 font-semibold break-all">{getChannelText(payment.payment_channel)}</span>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3 flex flex-col items-start justify-center min-w-0">
                    <span className="text-xs text-gray-400 font-medium mb-1">ট্রানজেকশন আইডি</span>
                    <span className="text-gray-700 font-mono text-xs bg-gray-100 px-2 py-1 rounded break-all">{payment.transaction_id || 'N/A'}</span>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-3 flex flex-col items-start justify-center min-w-0">
                    <span className="text-xs text-gray-400 font-medium mb-1">তারিখ</span>
                    <span className="text-gray-700">{formatDate(payment.updated_at || payment.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
