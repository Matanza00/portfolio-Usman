"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EMAIL } from "@/lib/site";

const NAV = [
  ["Live sites", "/#live"],
  ["Case studies", "/#cases"],
  ["About", "/#about"],
];

// Sticky header. `dark` is for the case-study pages, which keep their own dark themes.
export default function SiteHeader({ dark = false }) {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`pf-head${dark ? " pf-head--dark" : ""}`} data-stuck={stuck}>
      <div className="pf-wrap flex h-[68px] items-center gap-6">
        <Link href="/" className="pf-brand mr-auto" aria-label="Usman Nadeem, home">
          <img src="/me/navy-sm.webp" alt="" width={30} height={30} />
          Usman Nadeem
        </Link>
        <nav aria-label="Main" className="pf-nav hidden items-center gap-7 md:flex">
          {NAV.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <a className="pf-btn pf-btn--ink pf-btn--sm" href={`mailto:${EMAIL}`}>
          Email me
        </a>
      </div>
      {/* how far down the page you are; CSS scroll timeline, nothing when unsupported */}
      <span className="pf-progress" aria-hidden="true" />
    </header>
  );
}
