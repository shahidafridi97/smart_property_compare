"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "../icons";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === "/login") return null;

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  return (
    <header className="w-full bg-white border-b border-brand-border sticky top-0 z-50">

      <div className="container-padding py-5">

        <div className="flex items-center justify-between">

          {/* 🔥 LOGO (PI ICON — CLEAN) */}
          <Link href="/" className="flex items-center gap-3">

            <div className="w-9 h-9 flex items-center justify-center border border-brand-border rounded-md text-sm font-primarybold text-brand-dark tracking-widest">
              PI
            </div>

            <span className="text-2xl md:text-3xl font-secondary text-brand-dark tracking-tight">
              PropIQ
            </span>

          </Link>

          {/* 🔥 NAV */}
          <nav className="hidden md:flex items-center gap-12 text-base font-primary text-brand-muted">

            {[
              "Listing",
              "Compare",
              "Analysis",
              "Reports"
            ].map((item) => (
              <Link
                key={item}
                href="#"
                className="relative group"
              >
                <span className="group-hover:text-brand-dark transition duration-300">
                  {item}
                </span>

                {/* underline animation */}
                <span className="absolute left-0 -bottom-2 w-0 h-[2px] bg-brand-dark transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}

          </nav>

          {/* 🔥 RIGHT */}
          <div className="flex items-center gap-4">

            <button
              onClick={handleLogout}
              className="hidden md:block px-6 py-2.5 rounded-md bg-brand-dark text-white text-sm font-primarymedium hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
            >
              Logout
            </button>

            {/* 🔥 MENU ICON (proper) */}
         <button
  onClick={() => setMenuOpen(!menuOpen)}
  className="md:hidden w-10 h-10 flex items-center justify-center border border-brand-border rounded-md"
>
  <Icon name="menu" size={20} className="text-brand-dark" />
</button>

          </div>

        </div>

        {/* 🔥 MOBILE MENU */}
        {menuOpen && (
          <div className="md:hidden mt-5 border-t border-brand-border pt-5 flex flex-col gap-5 text-base font-primary text-brand-dark">

            <Link href="#" onClick={() => setMenuOpen(false)}>Listing</Link>
            <Link href="#" onClick={() => setMenuOpen(false)}>Compare</Link>
            <Link href="#" onClick={() => setMenuOpen(false)}>Analysis</Link>
            <Link href="#" onClick={() => setMenuOpen(false)}>Reports</Link>

            <button
              onClick={handleLogout}
              className="mt-3 px-4 py-2 rounded-md bg-brand-dark text-white"
            >
              Logout
            </button>

          </div>
        )}

      </div>

    </header>
  );
}