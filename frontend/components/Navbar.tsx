"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Analyzer", href: "/analyzer" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Batch", href: "/batch" },
  ];

  return (
    <nav className="print:hidden sticky top-0 h-[60px] min-h-[60px] border-b-2 border-ink bg-paper flex items-center justify-between px-4 sm:px-6 select-none z-50">
      <Link href="/" className="flex items-center gap-2 font-sans text-[17px] font-bold tracking-tight text-ink">
        <span className="w-7 h-7 bg-sun border-2 border-ink flex items-center justify-center text-[13px] leading-none">
          R
        </span>
        <span>
          ReviewLens<span className="text-alarm">.</span>
        </span>
      </Link>

      <div className="flex gap-1 sm:gap-2 items-center">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2 sm:px-3 py-1.5 font-sans text-[13px] font-medium border-2 transition-colors duration-150 ${
                active
                  ? "bg-ink text-sun border-ink"
                  : "border-transparent text-ink hover:border-ink hover:bg-sun"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
