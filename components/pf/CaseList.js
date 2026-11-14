"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, AnimatePresence } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";

/*
  Case studies as a plain list. With a mouse, the project's main screen follows
  the pointer while you hover its row; on touch each row carries a thumbnail.
*/
export default function CaseList({ cases }) {
  const [hover, setHover] = useState(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 380, damping: 34 });
  const sy = useSpring(y, { stiffness: 380, damping: 34 });
  const move = (e) => {
    if (e.pointerType !== "mouse") return;
    x.set(e.clientX + 24);
    y.set(e.clientY - 110);
  };
  const shown = cases.find((c) => c.slug === hover);

  return (
    <div
      onPointerMove={move}
      onPointerLeave={() => setHover(null)}
    >
      <ul>
        {cases.map((c, i) => (
          <motion.li
            key={c.slug}
            data-reveal=""
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ type: "spring", stiffness: 90, damping: 18, delay: (i % 5) * 0.06 }}
          >
            <Link
              href={`/work/${c.slug}`}
              className="pf-row group"
              style={{ "--row-accent": c.accent }}
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                setHover(c.slug);
              }}
              onFocus={() => setHover(null)}
            >
              <div className="min-w-0">
                <p className="pf-row-name">{c.name}</p>
                <p className="pf-small mt-1.5">
                  {c.kind}, {c.year}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="relative block h-[58px] w-[86px] overflow-hidden rounded-[10px] bg-[#e9ebf1] md:hidden">
                  <Image src={c.shot} alt="" fill sizes="86px" className="object-cover object-top" />
                </span>
                <span className="hidden text-[15px] font-semibold md:inline">Read</span>
                <ArrowRight size={20} weight="bold" aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>

      <motion.div className="pf-preview hidden md:block" style={{ x: sx, y: sy }} aria-hidden="true">
        <AnimatePresence>
          {shown && (
            <motion.div
              key={shown.slug}
              initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="pf-browser absolute inset-x-0 top-0"
            >
              <div className="relative aspect-[16/10]">
                <Image src={shown.shot} alt="" fill sizes="340px" className={shown.phone ? "object-contain bg-[#e9ebf1] p-2" : "object-cover object-top"} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
