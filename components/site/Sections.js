import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { fieldProps } from "@/lib/field";
import { ALSO_SHIPPED } from "@/lib/projects";
import { ABOUT, CAPABILITIES, EDUCATION, ROLES } from "@/lib/profile";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, PHONE, PHONE_HREF, SOURCE_URL } from "@/lib/site";
import Reveal from "@/components/motion/Reveal";
import CopyEmail from "@/components/contact/CopyEmail";
import CodeWindow from "@/components/showcase/CodeWindow";

const H2 = "text-[clamp(2rem,4.6vw,3.6rem)] font-semibold leading-[1] tracking-[-0.045em]";

export function WorkIntro() {
  return (
    <div id="work" className="wrap pb-10 pt-28 sm:pt-36">
      <Reveal>
        <p className="label">Selected work</p>
        <h2 className={`mt-4 max-w-[18ch] ${H2}`}>Products, shown the way they&apos;re used.</h2>
        <p className="mt-5 max-w-[50ch] text-[17px] leading-relaxed text-muted">
          Keep scrolling to move through each one. Every screen is a real
          capture of the app or site.
        </p>
      </Reveal>
    </div>
  );
}

// A small heading between clusters of showcases: the kind of work that follows.
export function WorkGroup({ label, title, blurb, first = false }) {
  return (
    <div className={`wrap pb-4 ${first ? "pt-4" : "pt-24 sm:pt-32"}`}>
      <Reveal>
        <p className="label">
          <span className="text-accent" aria-hidden="true">
            +
          </span>
          &nbsp; {label}
        </p>
        <h3 className="mt-3 max-w-[22ch] text-[clamp(1.5rem,3.2vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
          {title}
        </h3>
        {blurb && <p className="mt-4 max-w-[54ch] text-[16px] leading-relaxed text-muted">{blurb}</p>}
      </Reveal>
    </div>
  );
}

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative border-t border-ink/10 py-28 sm:py-36"
      {...fieldProps({ shape: "wave", anchor: "back", alpha: 0.13 })}
    >
      <div className="wrap">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <p className="label">About</p>
            <h2 id="about-title" className={`mt-4 max-w-[17ch] ${H2}`}>
              {ABOUT.heading}
            </h2>
            <div className="mt-7 max-w-[60ch] space-y-4 text-[17px] leading-relaxed text-ink/80">
              {ABOUT.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-10 self-end">
            {ABOUT.facts.map((fact, i) => (
              <Reveal key={fact.label} delay={0.06 * i} className="flex flex-col border-t border-ink/10 pt-4">
                <dt className="order-2 mt-2 text-[14px] leading-snug text-muted">{fact.label}</dt>
                <dd className="font-mono text-[clamp(2rem,3.6vw,3rem)] font-medium leading-none tracking-[-0.04em] tabular-nums">
                  {fact.value}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>

        <h3 className="label mt-20">What I do</h3>
        <ul className="mt-5 border-t border-ink/10">
          {CAPABILITIES.map((c, i) => (
            <Reveal
              as="li"
              key={c.title}
              delay={0.05 * i}
              className="grid gap-x-10 gap-y-2 border-b border-ink/10 py-7 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)]"
            >
              <p className="text-[1.3rem] font-semibold tracking-[-0.03em]">{c.title}</p>
              <p className="max-w-[62ch] text-[16px] leading-relaxed text-ink/80">{c.line}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Path() {
  return (
    <section
      id="path"
      aria-labelledby="path-title"
      className="relative border-t border-ink/10 py-28 sm:py-36"
      {...fieldProps({ shape: "wave", anchor: "back", alpha: 0.12 })}
    >
      <div className="wrap">
        {/* the heading, with the tooling I build along the way beside it */}
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            <p className="label">Path</p>
            <h2 id="path-title" className={`mt-4 max-w-[18ch] ${H2}`}>
              Five years, four teams, SaaS that ships early.
            </h2>
            <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-ink/80">
              Not just the screens, the tooling behind them: Obyect runs on a
              custom MCP server I wrote in TypeScript, with tools that scrape,
              classify and search ads, typed schemas and JSON resources, exposed
              to Claude so the whole library stays queryable.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="flex justify-center lg:justify-end">
            <CodeWindow />
          </Reveal>
        </div>

        <div className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <h3 className="label">Experience</h3>
            <p className="sr-only">Most recent first.</p>
            <ol className="mt-5">
              {ROLES.map((r, i) => (
                <Reveal as="li" key={`${r.title}-${r.org}`} delay={0.06 * i} className="border-t border-ink/10 py-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <p className="text-[1.3rem] font-semibold tracking-[-0.03em]">{r.title}</p>
                    <p className="font-mono text-[13px] text-muted">{r.period}</p>
                  </div>
                  <p className="mt-1 text-[15px] text-accent">{r.org}</p>
                  <ul className="plus-list mt-4 space-y-2.5 text-[15px] leading-relaxed text-ink/80">
                    {r.lines.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="label">Education</h3>
            <ol className="mt-5">
              {EDUCATION.map((e, i) => (
                <Reveal
                  as="li"
                  key={e.title}
                  delay={0.05 * i}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-ink/10 py-4"
                >
                  <div>
                    <p className="text-[16px] font-medium tracking-[-0.01em]">{e.title}</p>
                    <p className="mt-0.5 text-[14px] text-muted">{e.org}</p>
                  </div>
                  <p className="font-mono text-[13px] text-muted">{e.period}</p>
                </Reveal>
              ))}
            </ol>

            <h3 className="label mt-12">Also shipped</h3>
            <ul className="mt-5">
              {ALSO_SHIPPED.map((a) => {
                const inner = (
                  <>
                    <span>
                      <span className="block text-[16px] font-medium tracking-[-0.01em]">{a.name}</span>
                      <span className="mt-0.5 block text-[14px] text-muted">{a.line}</span>
                    </span>
                    {a.href && (
                      <ArrowUpRight
                        size={16}
                        aria-hidden="true"
                        className="mt-1 shrink-0 transition-transform duration-150 ease-snap group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    )}
                  </>
                );
                return (
                  <li key={a.name} className="border-t border-ink/10">
                    {a.href ? (
                      <a
                        href={a.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start justify-between gap-6 py-4 transition-colors duration-150 hover:text-accent"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="flex items-start justify-between gap-6 py-4">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

const CHANNELS = [
  { label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
  { label: "Phone", value: PHONE, href: PHONE_HREF },
  { label: "LinkedIn", value: "usmannadeem-dev", href: LINKEDIN_URL, external: true },
  { label: "GitHub", value: "Matanza00", href: GITHUB_URL, external: true },
];

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative border-t border-ink/10 py-28 sm:py-40"
      {...fieldProps({ shape: "monogram", anchor: "right", alpha: 0.85 })}
    >
      <div className="wrap">
        <div className="max-w-[40rem]" data-field-clear="">
          <Reveal>
            <p className="label">Contact</p>
            <h2
              id="contact-title"
              className="mt-4 text-[clamp(2.6rem,7vw,5.6rem)] font-semibold leading-[0.96] tracking-[-0.05em]"
            >
              Have a product to build?
            </h2>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-muted sm:text-lg">
              I&apos;m open to senior full-stack roles and freelance SaaS
              builds. Based in Kalispell, Montana, and comfortable working
              remote.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href={`mailto:${EMAIL}`} className="btn btn-primary">
                Say hello
              </a>
              <CopyEmail email={EMAIL} className="btn btn-ghost" />
            </div>
          </Reveal>

          <ul className="mt-14 border-t border-ink/10">
            {CHANNELS.map((c, i) => (
              <Reveal as="li" key={c.label} delay={0.05 * i} className="border-b border-ink/10">
                <a
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                  className="group flex items-baseline justify-between gap-6 py-4 transition-colors duration-150 hover:text-accent"
                >
                  <span className="label w-20 shrink-0 group-hover:text-accent">{c.label}</span>
                  <span className="min-w-0 flex-1 text-[16px] [overflow-wrap:anywhere]">{c.value}</span>
                  <ArrowUpRight
                    size={15}
                    aria-hidden="true"
                    className="shrink-0 translate-y-0.5 text-muted transition-transform duration-150 ease-snap group-hover:-translate-y-0 group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-ink/10 py-8">
      <div className="wrap flex flex-col gap-4 text-[14px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; 2026 Usman Nadeem. Built in Kalispell, Montana.</p>
        <nav aria-label="Footer" className="-my-3 flex flex-wrap gap-x-6">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="-mx-1 px-1 py-3 hover:text-ink">
            GitHub
          </a>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="-mx-1 px-1 py-3 hover:text-ink">
            LinkedIn
          </a>
          <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="-mx-1 px-1 py-3 hover:text-ink">
            Site source
          </a>
        </nav>
      </div>
    </footer>
  );
}
