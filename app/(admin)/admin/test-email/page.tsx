'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface DebugStep {
  step: number;
  status: 'SUCCESS' | 'FAILED';
  message: string;
  error?: string;
  data?: {
    email?: string;
    hasMetadata?: boolean;
    id?: string;
    status?: string;
    purpose?: string;
    amount?: number;
  };
  result?: {
    messageId?: string;
    status?: string;
  };
}

interface DebugResult {
  success: boolean;
  statusCode: number;
  statusMessage: string;
  debugSteps: DebugStep[];
  paymentRecord?: {
    id: string;
    status: string;
    purpose: string;
    amount: number;
  };
  user?: {
    email: string;
    hasMetadata: boolean;
  };
  error?: string;
}

interface TableDebugResult {
  success: boolean;
  statusCode: number;
  statusMessage: string;
  totalRecords: number;
  payments: Array<{
    id: string;
    user_id: string;
    course_id?: string;
    workshop_id?: string;
    amount: number;
    status: string;
    purpose: string;
    bkash_payment_id?: string;
    created_at: string;
    paid_at?: string;
  }>;
  summary: Array<{
    status: string;
    purpose: string;
    count: number;
  }>;
  filters: {
    limit: number;
    status?: string;
    purpose?: string;
  };
  error?: string;
}

export default function TestEmailPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: ''
  });
  const [workshopFormData, setWorkshopFormData] = useState({
    name: '',
    email: '',
    workshopTitle: 'Advanced Web Development Workshop',
    workshopDate: 'Monday, December 30, 2024',
    workshopTime: '10:00 AM - 12:00 PM',
    speakerName: 'John Doe',
    amount: 1500,
    groupLink: 'https://chat.whatsapp.com/example'
  });
  const [loading, setLoading] = useState(false);
  const [workshopLoading, setWorkshopLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [workshopResult, setWorkshopResult] = useState<{ success: boolean; message: string } | null>(null);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [paymentEmailFormData, setPaymentEmailFormData] = useState({
    paymentId: ''
  });
  const [paymentEmailLoading, setPaymentEmailLoading] = useState(false);
  const [paymentEmailResult, setPaymentEmailResult] = useState<{ success: boolean; message: string } | null>(null);
  const [paymentProcessFormData, setPaymentProcessFormData] = useState({
    paymentId: ''
  });
  const [paymentProcessLoading, setPaymentProcessLoading] = useState(false);
  const [paymentProcessResult, setPaymentProcessResult] = useState<{ success: boolean; message: string } | null>(null);
  const [debugFormData, setDebugFormData] = useState({
    paymentId: '',
    testMode: false
  });
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null);
  const [tableDebugResult, setTableDebugResult] = useState<TableDebugResult | null>(null);
  const [searchFormData, setSearchFormData] = useState({
    searchId: ''
  });
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message });
      } else {
        setResult({ success: false, message: data.error });
      }
    } catch (error) {
      setResult({ success: false, message: 'Failed to send test email' });
      console.error('Error sending test email:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkshopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorkshopLoading(true);
    setWorkshopResult(null);

    try {
      const response = await fetch('/api/test-workshop-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: workshopFormData.email,
          fullName: workshopFormData.name
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setWorkshopResult({ success: true, message: data.statusMessage });
      } else {
        setWorkshopResult({ success: false, message: data.statusMessage });
      }
    } catch (error) {
      setWorkshopResult({ success: false, message: 'Failed to send test workshop email' });
      console.error('Error sending test workshop email:', error);
    } finally {
      setWorkshopLoading(false);
    }
  };

  const testSmtpConnection = async () => {
    setSmtpTestResult(null);
    
    try {
      const response = await fetch('/api/test-smtp');
      const data = await response.json();
      
      if (response.ok) {
        setSmtpTestResult({ success: true, message: data.message });
      } else {
        setSmtpTestResult({ success: false, message: data.error });
      }
    } catch (error) {
      setSmtpTestResult({ success: false, message: 'Failed to test SMTP connection' });
      console.error('Error testing SMTP connection:', error);
    }
  };

  const handlePaymentEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentEmailLoading(true);
    setPaymentEmailResult(null);

    try {
      const response = await fetch('/api/test-payment-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentEmailFormData),
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentEmailResult({ success: true, message: data.statusMessage });
      } else {
        setPaymentEmailResult({ success: false, message: data.statusMessage });
      }
    } catch (error) {
      setPaymentEmailResult({ success: false, message: 'Failed to send test payment email' });
      console.error('Error sending test payment email:', error);
    } finally {
      setPaymentEmailLoading(false);
    }
  };

  const handlePaymentProcessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentProcessLoading(true);
    setPaymentProcessResult(null);

    try {
      const response = await fetch('/api/test-payment-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentProcessFormData),
      });

      const data = await response.json();

      if (response.ok) {
        setPaymentProcessResult({ success: true, message: data.statusMessage });
      } else {
        setPaymentProcessResult({ success: false, message: data.statusMessage });
      }
    } catch (error) {
      setPaymentProcessResult({ success: false, message: 'Failed to test payment processing' });
      console.error('Error testing payment processing:', error);
    } finally {
      setPaymentProcessLoading(false);
    }
  };

  const handleDebugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDebugLoading(true);
    setDebugResult(null);

    try {
      const response = await fetch('/api/debug-payment-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(debugFormData),
      });

      const data = await response.json();

      if (response.ok) {
        setDebugResult({ success: true, ...data });
      } else {
        setDebugResult({ success: false, ...data });
      }
    } catch (error) {
      setDebugResult({ 
        success: false, 
        statusCode: 500,
        statusMessage: "Failed to debug payment email",
        debugSteps: [],
        error: 'Failed to debug payment email'
      });
      console.error('Error debugging payment email:', error);
    } finally {
      setDebugLoading(false);
    }
  };

  const handleTableDebug = async () => {
    setTableDebugResult(null);

    try {
      const response = await fetch('/api/debug-payments-table?limit=20&status=successful');
      const data = await response.json();

      if (response.ok) {
        setTableDebugResult({ success: true, ...data });
      } else {
        setTableDebugResult({ success: false, ...data });
      }
    } catch (error) {
      setTableDebugResult({ 
        success: false,
        statusCode: 500,
        statusMessage: "Failed to debug payments table",
        totalRecords: 0,
        payments: [],
        summary: [],
        filters: { limit: 20 },
        error: 'Failed to debug payments table'
      });
      console.error('Error debugging payments table:', error);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);

    try {
      const response = await fetch('/api/debug-payments-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchFormData),
      });

      const data = await response.json();

      if (response.ok) {
        setTableDebugResult({ success: true, ...data });
      } else {
        setTableDebugResult({ success: false, ...data });
      }
    } catch (error) {
      setTableDebugResult({ 
        success: false,
        statusCode: 500,
        statusMessage: "Failed to search payment",
        totalRecords: 0,
        payments: [],
        summary: [],
        filters: { limit: 10 },
        error: 'Failed to search payment'
      });
      console.error('Error searching payment:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test Email Functionality
          </h1>
          <p className="text-gray-600">
            Test various email systems
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campus Ambassador Email Test */}
          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Campus Ambassador Email
              </h2>
              <p className="text-gray-600 text-sm">
                Test the Campus Ambassador confirmation email system
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                  University Name
                </label>
                <input
                  type="text"
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Campus Ambassador Email'}
              </Button>
            </form>

            {result && (
              <div className={`mt-4 p-4 rounded-md ${
                result.success 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <p className="text-sm font-medium">
                  {result.success ? '✅ Success' : '❌ Error'}
                </p>
                <p className="text-sm mt-1">{result.message}</p>
              </div>
            )}
          </div>

          {/* Workshop Payment Email Test */}
          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Workshop Payment Email
              </h2>
              <p className="text-gray-600 text-sm">
                Test the workshop payment confirmation email system with sample data
              </p>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700">
                  <strong>Test Data:</strong> Workshop Title: &quot;Test Workshop Title&quot;, Date: &quot;Monday, January 1, 2025&quot;, 
                  Time: &quot;10:00 AM - 12:00 PM&quot;, Speaker: &quot;Test Speaker&quot;, Amount: ৳1,000, WhatsApp Group: &quot;https://wa.me/1234567890&quot;
                </p>
              </div>
            </div>

            <form onSubmit={handleWorkshopSubmit} className="space-y-4">
              <div>
                <label htmlFor="workshop-name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="workshop-name"
                  value={workshopFormData.name}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="workshop-email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="workshop-email"
                  value={workshopFormData.email}
                  onChange={(e) => setWorkshopFormData({ ...workshopFormData, email: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={workshopLoading}
                className="w-full"
              >
                {workshopLoading ? 'Sending...' : 'Send Workshop Payment Email'}
              </Button>
            </form>

            {workshopResult && (
              <div className={`mt-4 p-4 rounded-md ${
                workshopResult.success 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <p className="text-sm font-medium">
                  {workshopResult.success ? '✅ Success' : '❌ Error'}
                </p>
                <p className="text-sm mt-1">{workshopResult.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Email Test Section */}
        <div className="mt-8 bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Payment Confirmation Email Test
            </h2>
            <p className="text-gray-600 text-sm">
              Test the payment confirmation email system with a specific payment ID
            </p>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> This will send a confirmation email for an existing payment record. 
                Make sure the payment status is &quot;successful&quot; and the payment exists in the database.
              </p>
            </div>
          </div>

          <form onSubmit={handlePaymentEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="payment-id" className="block text-sm font-medium text-gray-700">
                Payment ID (UUID)
              </label>
              <input
                type="text"
                id="payment-id"
                value={paymentEmailFormData.paymentId}
                onChange={(e) => setPaymentEmailFormData({ ...paymentEmailFormData, paymentId: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., f8c5200e-2497-47d7-872e-d365a62ee36e"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={paymentEmailLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {paymentEmailLoading ? 'Sending...' : 'Send Payment Confirmation Email'}
            </Button>
          </form>

          {paymentEmailResult && (
            <div className={`mt-4 p-4 rounded-md ${
              paymentEmailResult.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">
                {paymentEmailResult.success ? '✅ Success' : '❌ Error'}
              </p>
              <p className="text-sm mt-1">{paymentEmailResult.message}</p>
            </div>
          )}
        </div>

        {/* Payment Process Test Section */}
        <div className="mt-8 bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Payment Process Test
            </h2>
            <p className="text-gray-600 text-sm">
              Test the complete payment processing flow including email sending
            </p>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> This will simulate the complete payment processing flow. 
                Enter a bKash payment ID to test the entire process including email sending.
              </p>
            </div>
          </div>

          <form onSubmit={handlePaymentProcessSubmit} className="space-y-4">
            <div>
              <label htmlFor="process-payment-id" className="block text-sm font-medium text-gray-700">
                bKash Payment ID
              </label>
              <input
                type="text"
                id="process-payment-id"
                value={paymentProcessFormData.paymentId}
                onChange={(e) => setPaymentProcessFormData({ ...paymentProcessFormData, paymentId: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., TR00112LcKDBK1751858927006"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the bKash payment ID (starts with TR) or the payment UUID
              </p>
            </div>

            <Button
              type="submit"
              disabled={paymentProcessLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {paymentProcessLoading ? 'Processing...' : 'Test Payment Process'}
            </Button>
          </form>

          {paymentProcessResult && (
            <div className={`mt-4 p-4 rounded-md ${
              paymentProcessResult.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">
                {paymentProcessResult.success ? '✅ Success' : '❌ Error'}
              </p>
              <p className="text-sm mt-1">{paymentProcessResult.message}</p>
            </div>
          )}
        </div>

        {/* Payment Email Debug Section */}
        <div className="mt-8 bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Payment Email Debug
            </h2>
            <p className="text-gray-600 text-sm">
              Comprehensive debugging for payment email issues
            </p>
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-700">
                <strong>Debug Tool:</strong> This will test each step of the email sending process and show exactly where it fails.
              </p>
            </div>
          </div>

          <form onSubmit={handleDebugSubmit} className="space-y-4">
            <div>
              <label htmlFor="debug-payment-id" className="block text-sm font-medium text-gray-700">
                Payment UUID
              </label>
              <input
                type="text"
                id="debug-payment-id"
                value={debugFormData.paymentId}
                onChange={(e) => setDebugFormData({ ...debugFormData, paymentId: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., f8c5200e-2497-47d7-872e-d365a62ee36e"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the payment UUID from the payments table (not the bKash payment ID)
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="test-mode"
                checked={debugFormData.testMode}
                onChange={(e) => setDebugFormData({ ...debugFormData, testMode: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="test-mode" className="ml-2 block text-sm text-gray-900">
                Test Mode (only test email service, do not send actual payment email)
              </label>
            </div>

            <Button
              type="submit"
              disabled={debugLoading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {debugLoading ? 'Debugging...' : 'Debug Payment Email'}
            </Button>
          </form>

          {debugResult && (
            <div className={`mt-4 p-4 rounded-md ${
              debugResult.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">
                {debugResult.success ? '✅ Debug Completed' : '❌ Debug Failed'}
              </p>
              <div className="mt-2 text-xs">
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Payments Table Debug Section */}
        <div className="mt-8 bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Payments Table Debug
            </h2>
            <p className="text-gray-600 text-sm">
              Inspect the payments table and search for specific payments
            </p>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700">
                <strong>Table Inspector:</strong> View recent payments and search for specific payment records.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Button
                onClick={handleTableDebug}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                View Recent Successful Payments
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Search for Specific Payment</h3>
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div>
                  <label htmlFor="search-id" className="block text-sm font-medium text-gray-700">
                    Search ID
                  </label>
                  <input
                    type="text"
                    id="search-id"
                    value={searchFormData.searchId}
                    onChange={(e) => setSearchFormData({ ...searchFormData, searchId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter payment ID, bKash payment ID, or transaction ID"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Search by payment UUID, bKash payment ID, or transaction ID
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={searchLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {searchLoading ? 'Searching...' : 'Search Payment'}
                </Button>
              </form>
            </div>
          </div>

          {tableDebugResult && (
            <div className={`mt-4 p-4 rounded-md ${
              tableDebugResult.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">
                {tableDebugResult.success ? '✅ Debug Completed' : '❌ Debug Failed'}
              </p>
              <div className="mt-2 text-xs">
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(tableDebugResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* SMTP Test Section */}
        <div className="mt-8 bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              SMTP Connection Test
            </h2>
            <p className="text-gray-600 text-sm">
              Test the SMTP connection to ensure emails can be sent
            </p>
          </div>

          <Button
            onClick={testSmtpConnection}
            className="w-full bg-gray-600 hover:bg-gray-700"
          >
            Test SMTP Connection
          </Button>

          {smtpTestResult && (
            <div className={`mt-4 p-4 rounded-md ${
              smtpTestResult.success 
                ? 'bg-blue-50 border border-blue-200 text-blue-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">
                {smtpTestResult.success ? '🔗 SMTP Connection' : '❌ SMTP Error'}
              </p>
              <p className="text-sm mt-1">{smtpTestResult.message}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Email Configuration:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li><strong>SMTP Host:</strong> smtp.stackmail.com</li>
              <li><strong>Port:</strong> 465 (SSL)</li>
              <li><strong>From:</strong> no-reply@skilltori.com</li>
              <li><strong>Reply-to:</strong> info@skilltori.com</li>
              <li><strong>Rate Limit:</strong> 60 seconds between emails</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 