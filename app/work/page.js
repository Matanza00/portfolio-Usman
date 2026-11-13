import Link from "next/link";
import { CASE_STUDIES, caseMeta } from "@/lib/caseStudies";
import SiteHeader from "@/components/pf/SiteHeader";
import CaseList from "@/components/pf/CaseList";
import { SiteFooter } from "@/components/pf/Sections";

const title = "Case studies | Usman Nadeem";
const description =
  "Nine products from brief to build: the problem, the process, the features and every screen. Mobile apps, SaaS platforms and custom business software.";

export const metadata = {
  title,
  description,
  alternates: { canonical: "/work" },
  openGraph: { title, description, url: "/work" },
};

export default function WorkIndex() {
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
      <main id="main" tabIndex={-1} className="pb-28 pt-14 sm:pb-36 sm:pt-20">
        <div className="pf-wrap">
          <h1 className="pf-display max-w-[12ch] text-[clamp(2.8rem,7vw,5.4rem)]">How the work was made.</h1>
          <p className="pf-lead mt-6">{description}</p>
          <p className="pf-small mt-3">
            Looking for the live sites? <Link className="font-semibold text-[var(--ink)] underline underline-offset-4" href="/#live">See them on the home page</Link>.
          </p>
          <div className="mt-14">
            <CaseList cases={cases} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
