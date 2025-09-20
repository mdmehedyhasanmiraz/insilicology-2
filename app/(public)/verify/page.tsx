'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Shield, AlertCircle } from 'lucide-react'

export default function VerifyPage() {
  const [trackingCode, setTrackingCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingCode.trim()) {
      setError('Please enter a tracking code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/certificates/verify/${trackingCode.trim()}`)
      const data = await response.json()

      if (data.valid) {
        router.push(`/verify/${trackingCode.trim()}`)
      } else {
        setError('Certificate not found. Please check the tracking code and try again.')
      }
    } catch (err) {
      setError('An error occurred while verifying the certificate. Please try again.')
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Verify Certificate</h1>
          <p className="text-lg text-gray-600">
            Enter the tracking code to verify the authenticity of a Insilicology certificate
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="trackingCode" className="block text-sm font-semibold text-gray-700 mb-2">
                Tracking Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="trackingCode"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Enter certificate tracking code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-md font-mono"
                  disabled={isLoading}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                The tracking code can be found at the bottom of your certificate
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !trackingCode.trim()}
              className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Verify Certificate
                </>
              )}
            </button>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
          <div className="space-y-2 text-blue-800">
            <p>• The tracking code is a unique identifier found on your certificate</p>
            <p>• It&apos;s usually located at the bottom of the PDF certificate</p>
            <p>• If you can&apos;t find your tracking code, contact the certificate issuer</p>
            <p>• For technical support, email us at{' '}
              <a href="mailto:insilicology@gmail.com" className="underline hover:no-underline">
                insilicology@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 mt-8">
          <p>
            Powered by <span className="font-semibold text-purple-600">Insilicology</span> Certificate Verification System
          </p>
        </div>
      </div>
    </div>
  )
}
