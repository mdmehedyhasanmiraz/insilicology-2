'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MenuIcon, X, Search, ChevronDown } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import AuthButton from './AuthButton';

const navLinks = [
  { label: "হোম", route: "/" },
  { label: "কোর্স", route: "/courses" },
  { label: "ওয়ার্কশপ", route: "/workshops" },
];

const otherMenuItems = [
  { label: "ক্যারিয়ার", route: "/career" },
  { label: "সার্টিফিকেট ভেরিফিকেশন", route: "/verify" },
  { label: "ব্লগ", route: "/blog" },
  { label: "যোগাযোগ", route: "/contact" },
];

type CourseType = {
  title: string;
  slug: string;
  poster: string;
  type: string;
  duration: string;
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CourseType[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [otherMenuOpen, setOtherMenuOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const otherMenuRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from('courses')
        .select('title,slug,poster,type,duration')
        .ilike('title', `%${searchQuery.trim()}%`)
        .limit(10);

      if (error) {
        console.error('Supabase search error:', error);
        setSearchResults([]);
      } else {
        setSearchResults(data || []);
      }
    }, 10);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const onSearchSelect = (url: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    router.push(url);
  };

  const handleMobileNavClick = (route: string) => {
    setMenuOpen(false);
    router.push(route);
  };

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-3">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 mr-2">
            <Link href="/" className="flex items-center gap-3 justify-center">
              <Image 
                src="/logos/logo-insilicology.svg" 
                alt="Logo" 
                width={130} 
                height={45} 
                className="h-9 w-auto"
                priority
              />
              <span className="text-2xl font-bold text-gray-900">Insilicology</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Search Box */}
            <div className="relative mr-6" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <input
                  type="search"
                  placeholder="কোর্স খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  className="pl-10 pr-4 py-2.5 w-80 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 placeholder:text-gray-500"
                  aria-label="Search courses"
                />
              </div>
              
              {/* Search Results Dropdown */}
              {searchOpen && searchQuery && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-xl rounded-xl mt-2 max-h-80 overflow-y-auto z-50">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>কোনো ফলাফল পাওয়া যায়নি</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {searchResults.map((course, idx) => (
                        <button
                          key={idx}
                          onClick={() => onSearchSelect(`/courses/${course.type}/${course.slug}`)}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
                        >
                          <Image
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/course-banners/${course.poster}`}
                            alt={course.title}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover flex-shrink-0 h-10 w-16"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-gray-900 truncate">{course.title}</span>
                            <span className="text-sm text-gray-500">
                              {course.type.charAt(0).toUpperCase() + course.type.slice(1).toLowerCase()} • {course.duration}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="flex items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.route}
                  className="px-3 py-2.5 text-gray-900 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-all duration-200 relative group"
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Others Dropdown */}
              <div 
                className="relative" 
                ref={otherMenuRef}
                onMouseEnter={() => setOtherMenuOpen(true)}
                onMouseLeave={() => setOtherMenuOpen(false)}
              >
                <button
                  className="px-3 py-2.5 cursor-pointer text-gray-900 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-all duration-200 relative group flex items-center gap-1"
                >
                  অন্যান্য
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${otherMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                <AnimatePresence>
                  {otherMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 w-60 bg-white border border-gray-200 shadow-xl rounded-xl p-2 z-50"
                      onMouseEnter={() => setOtherMenuOpen(true)}
                      onMouseLeave={() => setOtherMenuOpen(false)}
                    >
                      {otherMenuItems.map((item, index) => (
                        <motion.div
                          key={item.route}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={item.route}
                            className="flex items-center px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
                          >
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </nav>

          {/* Auth Button */}
          <div className="hidden lg:block">
            <AuthButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            <AuthButton />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <MenuIcon className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              duration: 0.2, 
              ease: [0.4, 0, 0.2, 1],
              staggerChildren: 0.05
            }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl rounded-b-2xl z-50 overflow-hidden"
          >
            {/* Mobile Search */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 border-b border-gray-100" 
              ref={searchRef}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="search"
                  placeholder="কোর্স খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  className="pl-10 pr-4 py-3 w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 placeholder:text-gray-500"
                />
              </div>
              
              {/* Mobile Search Results */}
              <AnimatePresence>
                {searchOpen && searchQuery && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="relative mt-2 bg-white border border-gray-200 shadow-xl rounded-xl max-h-64 overflow-y-auto z-[60]"
                  >
                    {searchResults.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 text-center text-gray-500"
                      >
                        <Search className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">কোনো ফলাফল পাওয়া যায়নি!</p>
                      </motion.div>
                    ) : (
                      <div className="py-2">
                        {searchResults.map((course, idx) => (
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => onSearchSelect(`/courses/${course.type}/${course.slug}`)}
                            className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
                          >
                            <Image
                              src={course.poster}
                              alt={course.title}
                              width={40}
                              height={28}
                              className="rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-gray-900 truncate text-sm">{course.title}</span>
                              <span className="text-xs text-gray-500">
                                {course.type.charAt(0).toUpperCase() + course.type.slice(1).toLowerCase()} • {course.duration}
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Mobile Navigation */}
            <motion.nav 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="p-4"
            >
              <div className="space-y-1">
                {navLinks.map((item, index) => (
                  <motion.button
                    key={item.route}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    onClick={() => handleMobileNavClick(item.route)}
                    className="flex items-center w-full text-left px-4 py-3.5 text-gray-700 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex-1">{item.label}</span>
                    <motion.div 
                      className="w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                ))}
                
                {/* Others Section */}
                <div className="pt-2 mt-2 border-t border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-2">
                    অন্যান্য
                  </div>
                  {otherMenuItems.map((item, index) => (
                    <motion.button
                      key={item.route}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + (navLinks.length + index) * 0.1 }}
                      onClick={() => handleMobileNavClick(item.route)}
                      className="flex items-center w-full text-left px-4 py-3.5 text-gray-700 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex-1">{item.label}</span>
                      <motion.div 
                        className="w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.nav>

            {/* Mobile Footer */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl"
            >
              <div className="text-center text-xs text-gray-500">
                © {new Date().getFullYear()} Insilicology. All rights reserved.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
