'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Award, Calendar, Hash, Download, Loader2, AlertCircle } from 'lucide-react'

type CertRow = {
  id: string
  title: string
  issued_at: string
  tracking_code: string
  certificate_type: string
}

export default function CertificateSection() {
  const supabase = createClientComponentClient()
  const [certs, setCerts] = useState<CertRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingCerts, setDownloadingCerts] = useState<Set<string>>(new Set())

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { 
          setError('Please log in to view your certificates')
          setLoading(false)
          return 
        }
        
        const { data, error: certError } = await supabase
          .from('certificates')
          .select('id, title, issued_at, tracking_code, certificate_type')
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false })
        
        if (certError) {
          setError('Failed to load certificates')
        } else {
          setCerts((data as CertRow[] | null) || [])
        }
      } catch (err) {
        setError('An error occurred while loading certificates')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  const handleDownloadCertificate = async (certId: string) => {
    // Add to downloading set
    setDownloadingCerts(prev => new Set(prev).add(certId))
    
    try {
      const response = await fetch(`/api/certificates/generate/${certId}`)
      if (!response.ok) throw new Error('Failed to generate certificate')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Check if user is on mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (isMobile) {
        // For mobile users, show notification and download
        const a = document.createElement('a')
        a.href = url
        a.download = `certificate-${certId}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        
        // Show mobile notification
        alert('Certificate is downloading...')
      } else {
        // For desktop users, open in new tab
        window.open(url, '_blank')
      }
      
      // Clean up after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
      
    } catch (err) {
      setError('Failed to download certificate')
      console.error(err)
    } finally {
      // Remove from downloading set
      setDownloadingCerts(prev => {
        const newSet = new Set(prev)
        newSet.delete(certId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading your certificates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Certificates</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 md:p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">সার্টিফিকেট সমূহ</h1>

      {/* Content */}
      <div className="w-full">
        {certs.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">কোনো সার্টিফিকেট নেই</h2>
            <p className="text-gray-600 mb-6">কোর্স বা ওয়ার্কশপ সম্পন্ন করলে আপনার প্রথম সার্টিফিকেট পাবেন!</p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              কোর্স দেখুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certs.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Certificate Header */}
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium uppercase tracking-wide text-gray-600">
                      {cert.certificate_type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{cert.title}</h3>
                </div>

                {/* Certificate Details */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(cert.issued_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Hash className="w-4 h-4" />
                      <span className="font-mono text-xs">{cert.tracking_code}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    <button
                      onClick={() => handleDownloadCertificate(cert.id)}
                      disabled={downloadingCerts.has(cert.id)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingCerts.has(cert.id) ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          ডাউনলোড হচ্ছে...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          ডাউনলোড
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}