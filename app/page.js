import Link from "next/link";
import { LIVE_SITES } from "@/lib/live";
import { CASE_STUDIES, caseMeta } from "@/lib/caseStudies";
import SiteHeader from "@/components/pf/SiteHeader";
import Deck from "@/components/pf/Deck";
import LiveSites from "@/components/pf/LiveSites";
import CaseList from "@/components/pf/CaseList";
import { About, Contact, SiteFooter } from "@/components/pf/Sections";

export default function Home() {
  const cases = CASE_STUDIES.map((c) => ({
    slug: c.slug,
    name: c.name,
    kind: c.kind,
    year: c.year,
    phone: c.platform === "mobile",
    shot: c.hero.shot ?? c.hero.shots[1] ?? c.hero.shots[0],
    accent: caseMeta(c).accent,
  }));

  return (
    <div className="pf">
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section aria-labelledby="hero-title" className="overflow-x-clip pb-20 pt-10 sm:pt-16 lg:pb-28">
          <div className="pf-wrap grid items-center gap-x-14 gap-y-12 lg:grid-cols-[1fr_1.12fr]">
            <div>
              <h1 id="hero-title" className="pf-display text-[clamp(2.7rem,6.1vw,5rem)]">
                I build websites and apps people use every day.
              </h1>
              <p className="pf-lead mt-7">
                Senior full-stack developer in Kalispell, Montana. {LIVE_SITES.filter((s) => s.status === "live").length} of my sites are live right
                now, from 3D storefronts to a news site that runs itself. Pick one up and look.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link className="pf-btn pf-btn--ink" href="#live">
                  See every live site
                </Link>
                <Link className="pf-btn pf-btn--line" href="#cases">
                  Read the case studies
                </Link>
              </div>
            </div>
            <Deck sites={LIVE_SITES} />
          </div>
        </section>

        <LiveSites sites={LIVE_SITES} />

        <section id="cases" aria-labelledby="cases-title" className="scroll-mt-20 border-t border-[var(--rule)] py-24 sm:py-32">
          <div className="pf-wrap">
            <h2 id="cases-title" className="pf-h2">Case studies</h2>
            <p className="pf-lead mt-4">The problem, the process and every screen, for {cases.length} products I designed and built.</p>
            <div className="mt-12">
              <CaseList cases={cases} />
            </div>
          </div>
        </section>

        <About />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
