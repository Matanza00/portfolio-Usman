import Link from "next/link";
import SiteHeader from "@/components/pf/SiteHeader";

export const metadata = {
  title: "Page not found | Usman Nadeem",
};

export default function NotFound() {
  return (
    <div className="pf">
      <SiteHeader />
      <main id="main" className="pf-wrap grid min-h-[80dvh] content-center py-24">
        <h1 className="pf-display max-w-[14ch] text-[clamp(2.6rem,6.5vw,4.8rem)]">This page doesn&apos;t exist.</h1>
        <p className="pf-lead mt-5">The link may be old or mistyped. The live sites, case studies and contact details are all on the home page.</p>
        <div className="mt-9">
          <Link href="/" className="pf-btn pf-btn--ink">
            Go to the home page
          </Link>
        </div>
      </main>
    </div>
  );
}
