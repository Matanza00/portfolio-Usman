import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { CASE_STUDIES, caseMeta, caseStudy, fontsHref } from "@/lib/caseStudies";
import { isPhone, platformLabel } from "@/lib/shots";
import { EMAIL } from "@/lib/site";
import SiteHeader from "@/components/pf/SiteHeader";
import { SiteFooter } from "@/components/pf/Sections";
import CopyButton from "@/components/pf/CopyButton";
import { FeatureSwitch, HeroDevices, ScreenViewer, Swatches } from "@/components/pf/CaseBits";

export const dynamicParams = false;

export const viewport = { themeColor: "#F3F4F7" };

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const c = caseStudy(slug);
  if (!c) return {};
  const image = c.hero.shot ?? c.hero.shots[1];
  const title = `${c.name} case study | Usman Nadeem`;
  return {
    title,
    description: c.overview,
    alternates: { canonical: `/work/${c.slug}` },
    openGraph: { title, description: c.overview, url: `/work/${c.slug}`, type: "article", images: [{ url: image, alt: c.title }] },
    twitter: { card: "summary_large_image", title, description: c.overview, images: [image] },
  };
}

function Section({ id, title, children, className = "" }) {
  return (
    <section aria-labelledby={`${id}-title`} className={`border-t border-[var(--rule)] py-20 sm:py-28 ${className}`}>
      <div className="pf-wrap">
        <h2 id={`${id}-title`} className="pf-h2 max-w-[18ch]">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  const c = caseStudy(slug);
  if (!c) notFound();
  const i = CASE_STUDIES.indexOf(c);
  const next = CASE_STUDIES[(i + 1) % CASE_STUDIES.length];
  const { accent, domain } = caseMeta(c);
  const fonts = fontsHref(c);
  const nextShot = next.hero.shot ?? next.hero.shots[1] ?? next.hero.shots[0];
  const facts = [
    ["Product", c.kind],
    ["Industry", c.industry],
    ["Platform", platformLabel(c)],
    // the credit only adds something when the role does not already name the studio
    ["My role", c.credit && !c.role.includes(c.credit.replace(/^Built at /, "")) ? `${c.role}. ${c.credit}` : c.role],
  ];

  return (
    <div className="pf" style={{ "--site": accent }}>
      {fonts && <link rel="stylesheet" href={fonts} precedence="default" />}
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        {/* hero */}
        <section aria-labelledby="case-title" className="pb-20 pt-8 sm:pb-28 sm:pt-12">
          <div className="pf-wrap">
            <div className="flex flex-wrap items-center justify-between gap-3 text-[14px] font-medium text-[var(--sub)]">
              <Link href="/work" className="inline-flex items-center gap-1.5 hover:text-[var(--ink)]">
                <ArrowLeft size={15} weight="bold" aria-hidden="true" />
                All case studies
              </Link>
              <span className="tabular-nums">
                Case study {i + 1} of {CASE_STUDIES.length}, {c.year}
              </span>
            </div>
            <div className="mt-10 grid gap-x-16 gap-y-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <h1 id="case-title" className="pf-display text-[clamp(3rem,8.4vw,6.6rem)]">
                  {c.name}
                </h1>
                <p className="pf-lead mt-6 max-w-[58ch]">{c.overview}</p>
              </div>
              <div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
                  {facts.map(([k, v]) => (
                    <div key={k}>
                      <dt className="pf-small">{k}</dt>
                      <dd className="mt-1 text-[15px] font-semibold leading-snug">{v}</dd>
                    </div>
                  ))}
                </dl>
                {c.live && (
                  <a className="pf-btn pf-btn--ink pf-btn--sm mt-7" href={`https://${c.live}`} target="_blank" rel="noopener">
                    Visit {c.live}
                    <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
            <div className="pf-stage mt-12" style={{ "--stage": c.theme.bg, "--glow": c.theme.glow ?? accent }}>
              <HeroDevices hero={c.hero} domain={domain} name={c.name} />
            </div>
          </div>
        </section>

        {/* problem and answer */}
        <Section id="problem" title="What was in the way">
          <p className="pf-lead mt-6 max-w-[64ch]">{c.challenge}</p>
          <div className="mt-14 grid gap-12 md:grid-cols-2">
            <div>
              <h3 className="text-[17px] font-semibold">The problems</h3>
              <ul className="mt-4">
                {c.problems.map((p) => (
                  <li key={p} className="pf-point">{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[17px] font-semibold">What I built</h3>
              <ul className="mt-4">
                {c.solutions.map((p) => (
                  <li key={p} className="pf-point pf-point--fix">{p}</li>
                ))}
              </ul>
            </div>
          </div>
          {c.stats?.length > 0 && (
            <dl className="mt-16 grid gap-px overflow-hidden rounded-[18px] bg-[var(--rule)] sm:grid-cols-3">
              {c.stats.map(([n, label]) => (
                <div key={label} className="bg-[var(--card)] p-6 sm:p-8">
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="block text-[44px] font-bold leading-none tracking-[-0.03em]" style={{ fontVariationSettings: '"opsz" 72, "wdth" 90' }}>
                      {n}
                    </span>
                    <span className="pf-small mt-3 block max-w-[28ch]">{label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Section>

        {/* process: a real sequence, so it is numbered */}
        {c.process?.length > 0 && (
          <Section id="process" title="How it came together">
            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {c.process.map(([step, text], k) => (
                <li key={step} className="pf-step">
                  <span className="pf-step-n tabular-nums">{k + 1}</span>
                  <h3 className="mt-4 text-[18px] font-semibold">{step}</h3>
                  <p className="pf-small mt-2 text-[15px]">{text}</p>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* features */}
        <Section id="features" title="What it does">
          <p className="pf-lead mt-5">Pick a line to see the screen that goes with it.</p>
          <div className="mt-16 space-y-24 sm:space-y-32">
            {c.features.map((f, k) => (
              <FeatureSwitch key={f.title} f={f} domain={domain} flip={k % 2 === 1} />
            ))}
          </div>
        </Section>

        {/* every screen */}
        <Section id="screens" title="Every screen">
          <p className="pf-lead mt-5">Use the arrows, the thumbnails, your keyboard or a swipe.</p>
          <div className="mt-12">
            <ScreenViewer shots={c.gallery} domain={domain} name={c.name} />
          </div>
        </Section>

        {/* design system */}
        {(c.palette || c.fonts) && (
          <Section id="design" title="The design system">
            {c.palette && (
              <>
                <p className="pf-lead mt-5">Tap a colour to copy it.</p>
                <div className="mt-10">
                  <Swatches palette={c.palette} />
                </div>
              </>
            )}
            {c.fonts && (
              <div className="mt-16 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <p
                  className="text-[clamp(6rem,16vw,12rem)] leading-[0.85] tracking-[-0.04em]"
                  style={{ fontFamily: `"${c.fonts.display}", var(--font-bricolage)`, fontWeight: c.fonts.weights[0][2] }}
                  aria-hidden="true"
                >
                  Aa
                </p>
                <div>
                  <ul className="border-t border-[var(--rule)]">
                    {c.fonts.weights.map(([family, wname, w]) => (
                      <li
                        key={`${family}${w}`}
                        className="flex items-baseline justify-between gap-4 border-b border-[var(--rule)] py-3.5"
                      >
                        <span className="text-[22px]" style={{ fontFamily: `"${family}", var(--font-bricolage)`, fontWeight: w }}>
                          {family} {wname}
                        </span>
                        <span className="pf-small tabular-nums">{w}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pf-small mt-5 max-w-[60ch] text-[15px]">{c.fonts.note}</p>
                </div>
              </div>
            )}
            {c.stack?.length > 0 && (
              <div className="mt-16">
                <h3 className="text-[17px] font-semibold">Built with</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {c.stack.map((t) => (
                    <li key={t} className="pf-tag text-[14px]">{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
        )}

        {/* closing */}
        <section aria-labelledby="close-title" className="bg-[var(--ink)] py-24 text-white sm:py-32">
          <div className="pf-wrap">
            <h2 id="close-title" className="pf-display max-w-[16ch] text-[clamp(2.4rem,6vw,4.8rem)]">
              {c.closing.join(" ")}
            </h2>
            <p className="mt-6 max-w-[48ch] text-[18px] leading-relaxed text-white/70">
              Tell me what yours should do and who it is for. I reply within a day.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a className="pf-btn bg-white text-[var(--ink)] hover:bg-white/90" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>
              <CopyButton text={EMAIL} />
            </div>

            <Link href={`/work/${next.slug}`} className="pf-next group mt-20" style={{ "--next": caseMeta(next).accent }}>
              <span
                className="relative block aspect-[16/10] w-[132px] shrink-0 overflow-hidden rounded-[12px] sm:w-[200px]"
                style={{ background: next.theme.bg }}
              >
                <Image
                  src={nextShot}
                  alt=""
                  fill
                  sizes="200px"
                  className={isPhone(nextShot) ? "object-contain py-2" : "object-cover object-top"}
                />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] text-white/60">Next case study</span>
                <span className="pf-next-name mt-1 block">{next.name}</span>
                <span className="mt-1 block text-[14px] text-white/60">{next.kind}</span>
              </span>
              <ArrowRight size={24} weight="bold" aria-hidden="true" className="ml-auto shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
