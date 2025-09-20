import CampusAmbassadorReg from '@/components/career/CampusAmbassadorReg';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Be a Campus Ambassador | Career',
	description: 'Join our mission to empower students with cutting-edge tech education and build your network',
	openGraph: {
		title: 'Be a Campus Ambassador | Career',
		description: 'Join our mission to empower students with cutting-edge tech education and build your network',
		images: ['/images/og-ca.webp'],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Be a Campus Ambassador | Career',
		description: 'Join our mission to empower students with cutting-edge tech education and build your network',
		images: ['/images/og-ca.webp'],
	},
};

export default function CampusAmbassadorPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div 
				className="bg-gray-50 py-2"
				style={{
					backgroundImage:
						"radial-gradient(circle, rgba(255,255,255,0.2) 1.5px, transparent 1px)",
					backgroundSize: "15px 15px",
					backgroundPosition: "center",
				}}
			>
        <div className="container mx-auto px-4 text-center">
		  <Image src="/images/og-ca.webp" alt="Campus Ambassador" width={1000} height={1000} className="w-full h-full max-w-2xl mx-auto object-cover rounded-lg" />
        </div>
      </div>

      {/* Application Section */}
      <div className="pt-2 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <CampusAmbassadorReg />
        </div>
      </div>

			{/* Benefits Section */}
			<div className="py-16 bg-white">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">Why Join Our Program?</h2>
					<p className="text-gray-600 max-w-2xl mx-auto">
							As a Campus Ambassador, you&apos;ll be part of an exclusive community of student leaders
					</p>
				</div>
					
				<div className="grid md:grid-cols-3 gap-8 mb-12">
					<div className="text-center p-6">
						<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-2xl">🎯</span>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">Leadership Development</h3>
						<p className="text-gray-600">Develop essential leadership and communication skills that will benefit your career</p>
				</div>
					
					<div className="text-center p-6">
						<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-2xl">🌐</span>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">Network Building</h3>
						<p className="text-gray-600">Connect with industry professionals, mentors, and fellow ambassadors</p>
					</div>
					
					<div className="text-center p-6">
						<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<span className="text-2xl">🏆</span>
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">Exclusive Benefits</h3>
						<p className="text-gray-600">Get access to premium courses, events, and career opportunities</p>
					</div>
					</div>
			</div>
			</div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What are the requirements to become a Campus Ambassador?</h3>
              <p className="text-gray-600">You should be a current university student with strong communication skills, leadership potential, and a passion for technology education.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What will be my responsibilities?</h3>
              <p className="text-gray-600">You&apos;ll represent our platform at your university, organize events, promote our courses, and help fellow students discover learning opportunities.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is this a paid position?</h3>
              <p className="text-gray-600">While this is primarily a leadership development opportunity, there are performance-based incentives and exclusive benefits for active ambassadors.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How long is the commitment?</h3>
              <p className="text-gray-600">The program runs for one academic year, with the option to continue based on performance and mutual interest.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
