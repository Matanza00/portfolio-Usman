"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ArrowElbowDownLeft, MagnifyingGlass, X } from "@phosphor-icons/react";
import { PROJECTS } from "@/lib/projects";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, PHONE_HREF } from "@/lib/site";
import { scrollToId } from "@/components/motion/SmoothScroll";

const OPEN_EVENT = "palette:open";
export const openPalette = () => window.dispatchEvent(new Event(OPEN_EVENT));

const ITEMS = [
  { group: "Go to", label: "Top", to: "top" },
  { group: "Go to", label: "Selected work", to: "work" },
  ...PROJECTS.map((p) => ({ group: "Projects", label: p.name, hint: p.kind, to: p.slug })),
  { group: "Go to", label: "About", to: "about" },
  { group: "Go to", label: "Skills", to: "skills" },
  { group: "Go to", label: "Experience and education", to: "path" },
  { group: "Go to", label: "Contact", to: "contact" },
  { group: "Actions", label: "Copy email address", hint: EMAIL, copy: EMAIL },
  { group: "Actions", label: "Write an email", href: `mailto:${EMAIL}` },
  { group: "Actions", label: "Call", href: PHONE_HREF },
  { group: "Links", label: "GitHub", href: GITHUB_URL, external: true },
  { group: "Links", label: "LinkedIn", href: LINKEDIN_URL, external: true },
  ...PROJECTS.filter((p) => p.live).map((p) => ({
    group: "Links",
    label: `${p.name} live site`,
    hint: p.domain,
    href: p.live,
    external: true,
  })),
];

const GROUPS = ["Go to", "Projects", "Actions", "Links"];

// Ctrl K, Cmd K or "/" from anywhere. Also the menu on small screens.
export default function CommandPalette() {
  const dialog = useRef(null);
  const input = useRef(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hits = q
      ? ITEMS.filter((it) => `${it.label} ${it.hint ?? ""} ${it.group}`.toLowerCase().includes(q))
      : ITEMS;
    // keep groups together, in a fixed order
    return GROUPS.flatMap((g) => hits.filter((it) => it.group === g));
  }, [query]);

  useEffect(() => {
    const open = () => {
      const d = dialog.current;
      if (!d || d.open) return;
      setQuery("");
      setActive(0);
      setCopied(false);
      d.showModal();
      window.__lenis?.stop();
      input.current?.focus();
    };
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open();
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener(OPEN_EVENT, open);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, open);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // resume smooth scrolling right away: the dialog close event fires later,
  // after the jump below has already been requested
  const close = () => {
    dialog.current?.close();
    window.__lenis?.start();
  };

  const run = async (item) => {
    if (!item) return;
    if (item.copy) {
      try {
        await navigator.clipboard.writeText(item.copy);
        setCopied(true);
        setTimeout(close, 700);
      } catch {
        close();
      }
      return;
    }
    close();
    if (item.to) scrollToId(item.to);
    else if (item.external) window.open(item.href, "_blank", "noopener,noreferrer");
    else if (item.href) window.location.href = item.href;
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[active]);
    }
  };

  // keep the highlighted row in view
  useEffect(() => {
    document.getElementById(`palette-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let lastGroup = null;

  return (
    <dialog
      ref={dialog}
      aria-label="Search and navigate"
      onClose={() => window.__lenis?.start()}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
      className="palette mx-auto mb-auto mt-[12vh] w-[min(560px,92vw)] overflow-hidden rounded-[14px] border border-ink/[0.12] bg-surface p-0 text-ink shadow-[0_40px_100px_-30px_rgb(0_0_0/0.9)]"
    >
      <div className="flex items-center gap-3 border-b border-ink/10 px-4">
        <MagnifyingGlass size={17} className="shrink-0 text-muted" aria-hidden="true" />
        <input
          ref={input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={results.length ? `palette-opt-${active}` : undefined}
          aria-label="Search sections, projects and links"
          placeholder="Search sections, projects and links"
          autoComplete="off"
          spellCheck={false}
          className="h-[52px] w-full bg-transparent text-[15px] outline-none placeholder:text-muted/70"
        />
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="-mr-2 grid h-11 min-w-11 shrink-0 place-items-center rounded-[9px] text-muted transition-colors duration-150 hover:text-ink"
        >
          <kbd className="kbd hidden md:inline-flex">Esc</kbd>
          <X size={18} className="md:hidden" aria-hidden="true" />
        </button>
      </div>

      <ul id="palette-list" role="listbox" aria-label="Results" className="max-h-[min(52vh,420px)] overflow-y-auto p-2">
        {results.length === 0 && (
          <li role="presentation" className="px-3 py-8 text-center text-sm text-muted">
            Nothing matches &ldquo;{query}&rdquo;. Try &ldquo;work&rdquo; or &ldquo;email&rdquo;.
          </li>
        )}
        {results.map((item, i) => {
          const heading = item.group !== lastGroup ? item.group : null;
          lastGroup = item.group;
          const isCopied = copied && item.copy;
          return (
            <li key={`${item.group}-${item.label}`} role="presentation">
              {heading && <p className="label px-3 pb-1.5 pt-3">{heading}</p>}
              <div
                id={`palette-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onPointerMove={() => i !== active && setActive(i)}
                onClick={() => run(item)}
                className={`flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-[9px] px-3 py-2.5 text-[15px] ${
                  i === active ? "bg-ink/[0.08]" : ""
                }`}
              >
                <span className="truncate">{isCopied ? "Copied" : item.label}</span>
                <span className="flex shrink-0 items-center gap-2 text-[13px] text-muted">
                  {item.hint && <span className="hidden max-w-[220px] truncate sm:inline">{item.hint}</span>}
                  {item.external ? (
                    <ArrowUpRight size={13} aria-hidden="true" />
                  ) : (
                    i === active && <ArrowElbowDownLeft size={13} aria-hidden="true" />
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </dialog>
  );
}
