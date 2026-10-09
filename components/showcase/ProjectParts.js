import { ArrowUpRight, LockSimple } from "@phosphor-icons/react/ssr";
import Reveal from "@/components/motion/Reveal";

// Kind, year and name. Shared by every showcase so the projects read as a set.
export function ProjectHeader({ project, className = "", size = "lg" }) {
  const scale =
    size === "lg"
      ? "text-[clamp(2.6rem,6.4vw,5rem)]"
      : "text-[clamp(2rem,4.4vw,3.4rem)]";
  return (
    <div className={className}>
      <p className="label">
        <span className="text-accent">{project.kind}</span>
        <span className="mx-2 text-ink/25" aria-hidden="true">
          /
        </span>
        {project.year}
      </p>
      <h2
        id={`${project.slug}-title`}
        className={`mt-3 font-semibold leading-[0.95] tracking-[-0.045em] ${scale}`}
      >
        {project.name}
      </h2>
    </div>
  );
}

// Sits in normal flow under each pinned showcase: my role, the stack, and
// everything the product does, grouped.
export function ProjectDetails({ project }) {
  return (
    <div className="wrap relative grid gap-12 pb-28 pt-14 sm:pb-36 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.9fr)] lg:gap-16">
      <Reveal className="lg:sticky lg:top-24 lg:self-start">
        <p className="label">Role</p>
        <p className="mt-3 text-[17px] leading-snug">{project.role}</p>
        <p className="label mt-8">Built with</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-sm">
              Visit {project.domain}
              <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
          <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
            <LockSimple size={14} aria-hidden="true" />
            Private repository
          </span>
        </div>
      </Reveal>

      <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
        {project.features.map((group, i) => (
          <Reveal key={group.title} delay={0.05 * (i % 2)}>
            <h3 className="border-t border-ink/10 pt-4 text-[17px] font-semibold tracking-[-0.02em]">
              {group.title}
            </h3>
            <ul className="plus-list mt-4 space-y-2.5 text-[15px] leading-relaxed text-ink/80">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
