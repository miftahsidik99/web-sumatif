/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth } from "@/src/lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut, GraduationCap, User } from "lucide-react";
import { motion } from "motion/react";

export default function Navbar({ user }: { user: any }) {
  const handleLogout = () => signOut(auth);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-gray-100 h-16 flex items-center px-6 justify-between">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="bg-blue-600 p-2 rounded-xl">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">
          Web Sumatif <span className="text-blue-600">Sukatinggal</span>
        </span>
      </motion.div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                {user.email}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
