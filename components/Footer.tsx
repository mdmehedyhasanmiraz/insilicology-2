// components/Footer.js
import Link from 'next/link';
import Image from 'next/image';
import { FacebookIcon, LinkedinIcon, Mail, MapPin, Phone, YoutubeIcon } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 mx-auto border-t border-gray-100 text-white">
      <div className="container max-w-7xl mx-auto py-12 px-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
        {/* Left Column: Logo, Description, Social Media Links */}
        <div className="col-span-1 sm:col-span-2 md:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <Image src="/logos/icon-insilicology.svg"  width={60} height={60} alt="Logo" />
          </div>
          <p className="text-gray-500 mb-4 md:pr-24">
            স্কিল শেখা এখন আরও সহজ। ছোট ছোট লেসনে শিখুন কাজে লাগার মতো স্কিল — জব হোক বা ফ্রিল্যান্সিং, আপনি তৈরি!
          </p>
          <div className="flex space-x-4 mt-4">
            <Link href="https://facebook.com/insilicology" passHref>
              <FacebookIcon className='mr-2 text-gray-500 hover:text-purple-500' width={20} height={20}/>
            </Link>
            <Link href="https://linkedin.com/company/insilicology" passHref>
              <LinkedinIcon className='mr-2 text-gray-500 hover:text-purple-500' width={20} height={20}/>
            </Link>
            <Link href="https://youtube.com/@insilicology" passHref>
              <YoutubeIcon className='mr-2 text-gray-500 hover:text-purple-500' width={20} height={20}/>
            </Link>
          </div>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="font-semibold mb-2 text-purple-500">নেভিগেশন</h4>
          <ul className='space-y-1'>
            <li>
              <Link href="/" passHref>
                <span className="text-gray-500 hover:text-white">হোম</span>
              </Link>
            </li>
            <li>
              <Link href="/courses" passHref>
                <span className="text-gray-500 hover:text-white">কোর্স</span>
              </Link>
            </li>
            <li>
              <Link href="/workshops" passHref>
                <span className="text-gray-500 hover:text-white">ওয়ার্কশপ</span>
              </Link>
            </li>
            <li>
              <Link href="https://wa.me/8801842221872" target="_blank" passHref>
                <span className="text-gray-500 hover:text-white">সাপোর্ট</span>
              </Link>
            </li>
            <li>
              <Link href="/login" passHref>
                <span className="text-gray-500 hover:text-white">লগইন</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="font-semibold mb-2 text-purple-500">প্রোডাক্টসমূহ</h4>
          <ul className='space-y-1'>
            <li>
              <Link href="https://chromewebstore.google.com/detail/email-extractor-free-unli/ombjflplbadmkbbhhdekeaofjibkongn" target="_blank" passHref>
                <span className="text-gray-500 hover:text-white">Email Extractor</span>
              </Link>
            </li>
            <li>
              <Link href="https://chromewebstore.google.com/detail/blurry-blur-images-videos/kaafenccnpjpdofahijcohehkgibmdgn" target="_blank" passHref>
                <span className="text-gray-500 hover:text-white">Blurry (Free)</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Details */}
        <div>
          <h4 className="font-semibold mb-2 text-purple-500">যোগাযোগ</h4>
          <ul className='space-y-1'>
            <li className="inline-flex space-x-2 text-gray-500 mb-1">
              <MapPin size={14} className='mt-1' />
              <span>91/1, গেরুয়া, সাভার, ঢাকা 1340, বাংলাদেশ</span>
            </li>
            <li className="inline-flex space-x-2 text-gray-500 mb-1">
              <Mail size={14} className='mt-1' />
              <span>insilicology@gmail.com</span>
            </li>
            <li className="inline-flex space-x-2 text-gray-500 mb-1">
              <Phone size={14} className='mt-1' />
              <span>+88 01842-221872</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center max-w-7xl mx-auto py-8 px-3 mt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <div className="text-gray-500">
          <p>&copy; {new Date().getFullYear()} <strong>Insilicology</strong>, All rights reserved.</p>
        </div>
        <div className="text-center sm:text-right text-gray-700">
          <p>
            <Link href="/privacy-policy" className="text-gray-500 hover:text-purple-500">Privacy Policy</Link> |{' '}
            <Link href="/terms" className="text-gray-500 hover:text-purple-500">Terms & Conditions</Link> |{' '}
            <Link href="/refund-policy" className="text-gray-500 hover:text-purple-500">Refund Policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
