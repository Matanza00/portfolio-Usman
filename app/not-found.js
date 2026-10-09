import Link from "next/link";

export const metadata = {
  title: "Page not found | Usman Nadeem",
};

export default function NotFound() {
  return (
    <main className="wrap grid min-h-[100dvh] place-content-center py-24">
      <p className="label">Error 404</p>
      <h1 className="mt-4 max-w-[16ch] text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[1] tracking-[-0.045em]">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-5 max-w-[44ch] text-lg text-muted">
        The link may be old or mistyped. The work, experience and contact details are
        all on the home page.
      </p>
      <div className="mt-9">
        <Link href="/" className="btn btn-primary">
          Back to the home page
        </Link>
      </div>
    </main>
  );
}
