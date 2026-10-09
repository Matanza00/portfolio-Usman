"use client";

import { motion } from "motion/react";
import { useReduced } from "@/components/motion/useReduced";

export const LAND = [0.16, 1, 0.3, 1];

// Enter once when scrolled into view: opacity, a short rise and a little blur.
export default function Reveal({
  as = "div",
  children,
  delay = 0,
  y = 14,
  className,
  amount = 0.3,
  ...rest
}) {
  const reduce = useReduced();
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      data-reveal=""
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.45, delay, ease: LAND }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
