import { ABOUT, EDUCATION, ROLES, SKILL_GROUPS } from "@/lib/profile";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, PHONE, PHONE_HREF } from "@/lib/site";
import CopyButton from "./CopyButton";
import Portrait from "./Portrait";
import { VoiceButton } from "./VoiceButton";
import { CountUp, Reveal, Words } from "./Motion";

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-20 overflow-x-clip border-t border-[var(--rule)] py-24 sm:py-32">
      <div className="pf-wrap grid items-start gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-24" y={60}>
          <Portrait />
        </Reveal>
        <div>
          <Words as="h2" id="about-title" className="pf-h2 max-w-[16ch]" text={ABOUT.heading} />
          <div className="mt-8 space-y-5 text-[17px] leading-[1.65] text-[var(--sub)]">
            {ABOUT.paragraphs.map((p, i) => (
              <Reveal as="p" key={p.slice(0, 24)} delay={i * 0.08} className="max-w-[62ch]">{p}</Reveal>
            ))}
          </div>
          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
            {ABOUT.facts.map((f) => (
              <div key={f.label}>
                <dt className="sr-only">{f.label}</dt>
                <dd>
                  <CountUp value={f.value} className="block text-[34px] font-bold leading-none tracking-[-0.03em] tabular-nums" style={{ fontVariationSettings: '"opsz" 72, "wdth" 90' }} />
                  <span className="pf-small mt-2 block">{f.label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-16 text-[19px] font-semibold">Experience</h3>
          <ol className="mt-5">
            {ROLES.map((r, i) => (
              <Reveal as="li" key={r.org} delay={i * 0.06} y={24} className="border-t border-[var(--rule)] py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="text-[17px] font-semibold">
                    {r.title}, {r.org}
                  </p>
                  <p className="pf-small tabular-nums">{r.period}</p>
                </div>
                <p className="pf-small mt-2 max-w-[58ch]">{r.lines[0]}</p>
              </Reveal>
            ))}
            {EDUCATION.slice(0, 1).map((e) => (
              <li key={e.org} className="border-y border-[var(--rule)] py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <p className="text-[17px] font-semibold">
                    {e.title}, {e.org}
                  </p>
                  <p className="pf-small tabular-nums">{e.period}</p>
                </div>
              </li>
            ))}
          </ol>

          <h3 className="mt-12 text-[19px] font-semibold">What I work with</h3>
          <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {SKILL_GROUPS.map((g) => (
              <div key={g.title}>
                <dt className="text-[14px] font-semibold">{g.title}</dt>
                <dd className="pf-small mt-1">{g.skills.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 bg-[var(--ink)] py-24 text-white sm:py-32">
      <div className="pf-wrap">
        <Words as="h2" id="contact-title" className="pf-display max-w-[14ch] text-[clamp(2.6rem,7vw,5.6rem)]" text="Have something to build?" stagger={0.09} />
        <p className="mt-6 max-w-[48ch] text-[18px] leading-relaxed text-white/70">
          Tell me what it should do and who it is for. I reply within a day, usually with questions and a rough plan.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a className="pf-btn bg-white text-[var(--ink)] hover:bg-white/90" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          <CopyButton text={EMAIL} />
          <VoiceButton />
        </div>
        <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-[15px] text-white/70">
          <li><a className="underline-offset-4 hover:text-white hover:underline" href={LINKEDIN_URL} target="_blank" rel="noopener">LinkedIn</a></li>
          <li><a className="underline-offset-4 hover:text-white hover:underline" href={GITHUB_URL} target="_blank" rel="noopener">GitHub</a></li>
          <li><a className="underline-offset-4 hover:text-white hover:underline" href={PHONE_HREF}>{PHONE}</a></li>
          <li><a className="underline-offset-4 hover:text-white hover:underline" href="https://nxcsol.com" target="_blank" rel="noopener">NXCSOL</a></li>
        </ul>
      </div>
    </section>
  );
}

export function SiteFooter({ dark = false }) {
  return (
    <footer className={dark ? "border-t border-white/10 bg-[#0a0b0d] text-[#9297a0]" : "bg-[var(--ink)] text-white/50"}>
      <div className="pf-wrap flex flex-wrap items-center justify-between gap-4 py-8 text-[14px]">
        <p>© 2026 Usman Nadeem. Kalispell, Montana.</p>
        <a className="hover:text-white" href="#main">Back to top</a>
      </div>
    </footer>
  );
}
