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

  const navItems = [
    { label: "Listings", href: "/listings" },
    { label: "Compare", href: "/compare" },
    { label: "Analysis", href: "/analysis" },
    { label: "Reports", href: "/reports" },
  ];

  return (
    <header className="w-full bg-white border-b border-brand-border sticky top-0 z-50">

      <div className="container-padding py-5">

        <div className="flex items-center justify-between">

          {/* 🔥 LOGO */}
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

            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative group"
                >
                  <span
                    className={`transition duration-300 ${
                      isActive ? "text-brand-dark font-primarymedium" : "group-hover:text-brand-dark"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* underline */}
                  <span
                    className={`absolute left-0 -bottom-2 h-[2px] bg-brand-dark transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  ></span>
                </Link>
              );
            })}

          </nav>

          {/* 🔥 RIGHT */}
          <div className="flex items-center gap-4">

            <button
              onClick={handleLogout}
              className="hidden md:block px-6 py-2.5 rounded-md bg-brand-dark text-white text-sm font-primarymedium hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
            >
              Logout
            </button>

            {/* 🔥 MOBILE MENU */}
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

            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

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