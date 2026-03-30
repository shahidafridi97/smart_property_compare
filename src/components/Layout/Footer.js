"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <footer className="w-full bg-white border-t border-gray-200">

      <div className="container-padding py-6">

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">

          {/* LEFT */}
          <p>© {new Date().getFullYear()} PropIQ</p>

          {/* RIGHT */}
          <div className="flex gap-6">
            <span className="hover:text-black cursor-pointer transition">Privacy</span>
            <span className="hover:text-black cursor-pointer transition">Terms</span>
            <span className="hover:text-black cursor-pointer transition">Contact</span>
          </div>

        </div>

      </div>

    </footer>
  );
}