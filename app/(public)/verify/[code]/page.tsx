'use client'

import { notFound } from 'next/navigation'
import { CheckCircle, Calendar, User, Award, Hash } from 'lucide-react'
import { useEffect, useState } from 'react'

type Certificate = {
  id: string
  user_id: string
  entity_type: string
  entity_id: string
  certificate_type: string
  title: string
  tracking_code: string
  issued_at: string
  pdf_url: string | null
  users: {
    id: string
    name: string | null
  }
}

export default function VerifyCertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const [cert, setCert] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchCertificate() {
      try {
        const { code } = await params
        const res = await fetch(`/api/certificates/verify/${code}`, { cache: 'no-store' })
        const data = await res.json()
        
        if (!res.ok || !data.valid) {
          setError(true)
          return
        }

        setCert(data.certificate)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchCertificate()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900">Verifying Certificate...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (error || !cert) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Certificate Verified</h1>
          <p className="text-gray-600">This certificate is authentic and valid</p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Status Bar */}
          <div className="bg-green-50 border-b border-green-100 px-8 py-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-green-800 font-medium">Verified Certificate</span>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="p-8">
            {/* Certificate Holder */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Certificate Holder</h2>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{cert.users?.name || 'Student'}</h3>
            </div>

            {/* Certificate Info Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="flex items-center mb-3">
                  <Award className="w-5 h-5 text-gray-400 mr-2" />
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Certificate</h4>
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-1">{cert.title}</p>
                <p className="text-sm text-gray-600 capitalize">{cert.certificate_type} Certificate</p>
              </div>

              <div>
                <div className="flex items-center mb-3">
                  <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Issued</h4>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(cert.issued_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(cert.issued_at).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            {/* Tracking Code */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-center mb-3">
                <Hash className="w-5 h-5 text-gray-400 mr-2" />
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tracking Code</h4>
              </div>
              <p className="text-xl font-mono font-bold text-gray-900 bg-white px-4 py-2 rounded-lg border">
                {cert.tracking_code}
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            Issued by <span className="font-medium text-gray-900">Insilicology</span> • 
            <a href="mailto:insilicology@gmail.com" className="ml-1 hover:text-gray-700 transition-colors">
              insilicology@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}


