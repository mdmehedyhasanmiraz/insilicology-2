'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ArrowLeft, Download, ExternalLink, Loader2, AlertCircle } from 'lucide-react'

type Certificate = {
  id: string
  title: string
  tracking_code: string
  certificate_type: string
  issued_at: string
  users: {
    id: string
    name: string | null
    email: string
  }
}

export default function CertificateViewerPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('Unauthorized')
          return
        }

        const { data, error: certError } = await supabase
          .from('certificates')
          .select('id, title, tracking_code, certificate_type, issued_at, users:users!inner(id, name, email)')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single()

        if (certError || !data) {
          setError('Certificate not found')
          return
        }

        setCertificate(data as unknown as Certificate)
      } catch (err) {
        setError('Failed to load certificate')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadCertificate()
  }, [params.id, supabase])

  const handleGenerateCertificate = async () => {
    if (!certificate) return
    
    setGenerating(true)
    try {
      const response = await fetch(`/api/certificates/generate/${certificate.id}`)
      if (!response.ok) {
        throw new Error('Failed to generate certificate')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${certificate.tracking_code}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('Failed to generate certificate')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const handleViewCertificate = () => {
    if (!certificate) return
    window.open(`/api/certificates/generate/${certificate.id}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading certificate...</p>
        </div>
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Certificates</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleViewCertificate}
                disabled={generating}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ExternalLink className="w-4 h-4" />
                View Certificate
              </button>
              
              <button
                onClick={handleGenerateCertificate}
                disabled={generating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {generating ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Details */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Certificate Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8 text-white">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Certificate of {certificate.certificate_type.charAt(0).toUpperCase() + certificate.certificate_type.slice(1)}</h1>
              <p className="text-purple-100">This is to certify that</p>
            </div>
          </div>

          {/* Certificate Content */}
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{certificate.users.name || 'Student'}</h2>
              <p className="text-lg text-gray-600 mb-2">has successfully completed</p>
              <h3 className="text-2xl font-semibold text-purple-600 mb-4">{certificate.title}</h3>
              <p className="text-gray-500">with dedication and commitment to advancing knowledge</p>
            </div>

            {/* Certificate Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Issued Date</h4>
                <p className="text-gray-600">
                  {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Tracking Code</h4>
                <p className="text-gray-600 font-mono">{certificate.tracking_code}</p>
              </div>
            </div>

            {/* Verification Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Verify This Certificate</h4>
              <p className="text-blue-700 text-sm mb-2">
                This certificate can be verified online using the tracking code above.
              </p>
              <a
                href={`/verify/${certificate.tracking_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Verify Certificate
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>Issued by <span className="font-semibold text-gray-700">Skilltori</span></p>
              <p>For verification, visit <span className="font-mono">skilltori.com/verify</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
