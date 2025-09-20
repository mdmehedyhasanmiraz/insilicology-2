// app/(public)/contact/page.tsx

import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';

export async function generateMetadata() {
  return {
    title: 'Contact Us',
    description: 'Contact us for any questions or suggestions. We are here to help you succeed.',
    keywords: [
      "Contact Us",
    ],
    metadataBase: new URL('https://insilicology.org'),
    alternates: {
      canonical: '/contact',
    },
    openGraph: {
      title: 'Contact Us',
      description: 'Contact us for any questions or suggestions. We are here to help you succeed.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Contact Us',
      description: 'Contact us for any questions or suggestions. We are here to help you succeed.',
    },
  }
}

export default function ContactPage() {
  return (
    <section 
      className="min-h-screen bg-gray-50 pt-12"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgb(240, 238, 233) 1.5px, transparent 1px)",
        backgroundSize: "15px 15px",
      }}
    >
      {/* Hero Section */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            আমাদের সাথে যোগাযোগ করুন
          </h1>
          <p className="text-sm md:text-base opacity-90 max-w-3xl mx-auto">
            আপনার প্রশ্ন বা পরামর্শ আমাদের জানান। আমরা আপনার সাফল্যের জন্য এখানে আছি।
          </p>
        </div>
      </div>

      {/* Contact Information & Form */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="space-y-6">
              {/* Address */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-2">
                      ঠিকানা
                    </h3>
                    <p className="leading-relaxed">
                      91/1, গেরুয়া বাজার<br />
                      সাভার, ঢাকা-1340, বাংলাদেশ
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-2">
                      মোবাইল নম্বর
                    </h3>
                    <p className="text-gray-600 font-bold">
                      <a href="tel:+8801842221872" className="hover:text-purple-600 transition-colors">
                        ০১৮৪২ ২২২১৮৭২
                      </a>
                    </p>
                    <p className="text-gray-600 font-bold">
                      <a href="tel:+8801907791872" className="hover:text-purple-600 transition-colors">
                        ০১৯০৭ ৭৯১৮৭২
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-2">
                      ইমেইল
                    </h3>
                    <p className="text-gray-600">
                      <a href="mailto:insilicology@gmail.com" className="hover:text-purple-600 transition-colors">
                        insilicology@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-2">
                      কর্ম সময়
                    </h3>
                    <p className="text-gray-600">
                      <span className="font-medium">শনি-বৃহঃ:</span> সকাল ১০টা - বিকাল ৫টা<br />
                      <span className="font-medium">শুক্র:</span> বন্ধ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>
      </div>

      {/* Google Map */}
      <div className="w-full h-96 md:h-[500px] bg-gray-200">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.902442430136!2d90.4066373!3d23.7939108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70c72ea1b76%3A0x6c369d0b5a7b3b1a!2sBanani%2C%20Dhaka%2C%20Bangladesh!5e0!3m2!1sen!2sbd!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Insilicology Location"
          className="w-full h-full"
        ></iframe>
      </div>

      {/* Additional Info */}
      <div className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">
            আমাদের সাথে যোগাযোগ করুন
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            আপনার প্রশ্ন বা পরামর্শ আমাদের জানান। আমরা আপনার সাফল্যের জন্য সর্বদা প্রস্তুত।
            আমাদের বিশেষজ্ঞ দল আপনার প্রশ্নের উত্তর দিতে এবং আপনাকে সাহায্য করতে এখানে আছে।
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            <a
              href="tel:+8801842221872"
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>কল করুন</span>
            </a>
            <a
              href="mailto:insilicology@gmail.com"
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>ইমেইল করুন</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}