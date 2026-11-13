import Image from "next/image";
import { isPhone } from "@/lib/shots";

/*
  Device frames for case-study screens. Each frame can hold several screens
  stacked on top of each other; `on` picks the one that shows, and the others
  fade out (see .pf-screens in pf.css).
*/

function Screens({ srcs, on = 0, alt, sizes, priority }) {
  return srcs.map((src, i) => (
    <Image
      key={src}
      src={src}
      alt={i === on ? alt : ""}
      aria-hidden={i === on ? undefined : true}
      fill
      sizes={sizes}
      quality={85}
      priority={priority && i === 0}
      draggable={false}
      data-on={i === on}
      className="object-cover object-top"
    />
  ));
}

export function BrowserFrame({ srcs, on, alt = "", domain, sizes = "(min-width: 1024px) 60vw, 92vw", priority = false, className = "", style }) {
  return (
    <div className={`pf-browser ${className}`} style={style}>
      <div className="pf-browser-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        {domain && <span>{domain}</span>}
      </div>
      <div className="pf-screens aspect-[16/10]">
        <Screens srcs={srcs} on={on} alt={alt} sizes={sizes} priority={priority} />
      </div>
    </div>
  );
}

export function PhoneFrame({ srcs, on, alt = "", sizes = "320px", priority = false, className = "", style }) {
  return (
    <div className={`pf-phone ${className}`} style={style}>
      <div className="pf-screens pf-phone-screen">
        <Screens srcs={srcs} on={on} alt={alt} sizes={sizes} priority={priority} />
        <span aria-hidden="true" className="pf-phone-island" />
      </div>
    </div>
  );
}

export function Frame({ src, srcs, ...rest }) {
  const list = srcs ?? [src];
  return isPhone(list[0]) ? <PhoneFrame srcs={list} {...rest} /> : <BrowserFrame srcs={list} {...rest} />;
}
