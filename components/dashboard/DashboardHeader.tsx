"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  User,
  Globe,
  LogOut,
  PanelsTopLeft,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardHeader() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function fetchUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      // Pull Google avatar URL and display name if available
      const avatar = session.user.user_metadata?.avatar_url || null;
      const name = session.user.user_metadata?.display_name || session.user.email || "User";
      
      setAvatarUrl(avatar);
      setUserName(name);

      setLoading(false);
    }

    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session?.user) {
          router.replace("/login");
          return;
        }
        
        const avatar = session.user.user_metadata?.avatar_url || null;
        const name = session.user.user_metadata?.display_name || session.user.email || "User";
        
        setAvatarUrl(avatar);
        setUserName(name);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth, router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) return null;

  return (
    <div className="flex justify-end w-full items-center p-2 md:p-4">
      <div
        className={`${isMobile ? "relative" : "relative group hover:group-hover:block"}`}
        ref={dropdownRef}
      >
        {/* Trigger */}
        <div
          className="flex items-center gap-2 md:gap-3 cursor-pointer bg-white/60 backdrop-blur-md shadow-md rounded-full md:bg-gray-100 md:shadow-none md:backdrop-blur-0 transition-all duration-200 border border-gray-200 hover:border-purple-300"
          onClick={() => isMobile && setDropdownOpen(prev => !prev)}
        >
          {/* Desktop text */}
          {/* <span className="hidden md:inline-block font-semibold text-gray-700 text-sm pl-4">
            একাউন্ট অপশন
          </span> */}

          {/* User name - only show on desktop */}
          <span className="hidden md:inline-block font-medium text-gray-600 text-sm pl-4">
            {userName}
          </span>

          {/* Avatar image or default icon */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User Avatar"
              className={`w-12 h-12 rounded-full object-cover border-2 border-purple-300 transition-all duration-200 ${
                isMobile 
                  ? "shadow-none bg-transparent" 
                  : "shadow-none"
              }`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center border-2 border-purple-300 transition-all duration-200 ${
              isMobile ? "shadow-none" : "shadow-none"
            }`}>
              <User className="text-white w-6 h-6" />
            </div>
          )}
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {dropdownOpen && isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                duration: 0.2, 
                ease: [0.4, 0, 0.2, 1],
                staggerChildren: 0.05
              }}
              className="fixed top-16 bg-white border-t border-gray-100 shadow-xl rounded-b-2xl z-50 overflow-hidden"
              style={{ 
                left: "0",
                right: "0",
                width: "100vw"
              }}
            >
              {/* User info header */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50"
              >
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center border-2 border-purple-300">
                      <User className="text-white w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{userName}</p>
                    <p className="text-xs text-gray-500">আপনার অ্যাকাউন্ট</p>
                  </div>
                </div>
              </motion.div>

              {/* Navigation Items */}
              <motion.nav 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="p-4"
              >
                <div className="space-y-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      href="/dashboard/account"
                      className="flex items-center w-full text-left px-4 py-3.5 text-gray-700 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={20} className="mr-3" />
                      <span className="flex-1">আমার প্রোফাইল</span>
                      <motion.div 
                        className="w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Link
                      href="/dashboard/support"
                      className="flex items-center w-full text-left px-4 py-3.5 text-gray-700 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <PanelsTopLeft size={20} className="mr-3" />
                      <span className="flex-1">সাপোর্ট</span>
                      <motion.div 
                        className="w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      href="/"
                      className="flex items-center w-full text-left px-4 py-3.5 text-gray-700 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Globe size={20} className="mr-3" />
                      <span className="flex-1">মূল ওয়েবসাইট</span>
                      <motion.div 
                        className="w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full text-left px-4 py-3.5 text-red-600 hover:text-red-700 font-medium rounded-xl hover:bg-red-50 transition-all duration-200 group"
                    >
                      <LogOut size={20} className="mr-3" />
                      <span className="flex-1">লগ আউট</span>
                      <motion.div 
                        className="w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </button>
                  </motion.div>
                </div>
              </motion.nav>

              {/* Footer */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl"
              >
                <div className="text-center text-xs text-gray-500">
                  © {new Date().getFullYear()} Insilicology. All rights reserved.
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Dropdown */}
        <div
          className={`absolute right-0 mt-0 mr-2 w-80 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-2xl z-50 transition-all duration-200 origin-top-right
            ${!isMobile ? "opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:pointer-events-auto scale-95 pointer-events-none" : "hidden"}`}
          style={{ top: "100%" }}
        >
          {/* User info header */}
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center border-2 border-purple-300">
                  <User className="text-white w-5 h-5" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm">{userName}</p>
                <p className="text-xs text-gray-500">আপনার অ্যাকাউন্ট</p>
              </div>
            </div>
          </div>

          <ul className="divide-y divide-gray-100">
            <li>
              <Link
                href="/dashboard/account"
                className="flex items-center gap-2 px-5 py-3 hover:bg-white hover:text-purple-700 transition-all text-base font-medium"
              >
                <User size={20} />
                আমার প্রোফাইল
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/support"
                className="flex items-center gap-2 px-5 py-3 hover:bg-white hover:text-purple-700 transition-all text-base font-medium"
              >
                <PanelsTopLeft size={20} />
                সাপোর্ট
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="flex items-center gap-2 px-5 py-3 hover:bg-white hover:text-purple-700 transition-all text-base font-medium"
              >
                <Globe size={20} />
                মূল ওয়েবসাইট
              </Link>
            </li>

            <li>
              <button
                onClick={handleLogout}
                className="flex items-center cursor-pointer rounded-b-xl gap-2 w-full px-5 py-3 hover:bg-red-100 hover:text-red-600 transition-all text-base font-semibold"
              >
                <LogOut size={20} />
                লগ আউট
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
