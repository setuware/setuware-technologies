import Link from "next/link";

/**
 * Mid-page conversion band (Figma 24:2679, 24:2687, buttons 24:2808).
 *
 * Deliberately plain: it sits between two dense sections, so the contrast
 * comes from the whitespace rather than another gradient.
 */
export function ChallengeCta() {
  return (
    <section
      aria-labelledby="challenge-cta-title"
      className="bg-background pt-20 md:pt-24 lg:pt-[calc(var(--s)*139)]"
    >
      <div className="container-figma">
        <div className="mx-auto flex flex-col items-center text-center">
          <h2
            id="challenge-cta-title"
            className="max-w-[807px] text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-black text-balance sm:text-[44px] lg:text-wrap lg:max-w-[calc(var(--s)*807)] lg:text-[calc(var(--s)*56)] lg:leading-[calc(var(--s)*72)] dark:text-white"
          >
            Have a challenge to solve or an idea to explore?
          </h2>
          <p className="mt-4 max-w-[1067px] text-[16px] font-medium leading-[28px] text-black/70 lg:mt-[calc(var(--s)*19)] lg:max-w-none lg:text-[calc(var(--s)*17)] lg:leading-[calc(var(--s)*32)] dark:text-white/70">
            Book a free consultation with our team to discuss your needs and
            discover how the right software can help your business work smarter.
          </p>

          <div className="mt-8 flex w-full flex-col items-center justify-center gap-[18px] sm:w-auto sm:flex-row lg:mt-[calc(var(--s)*33)] lg:gap-[calc(var(--s)*18)]">
            <Link
              href="/contact"
              className="inline-flex h-10 w-full max-w-[280px] items-center justify-center gap-2.5 rounded-[50px] bg-setu text-[15px] font-semibold leading-5 text-white transition-[background-color,transform] duration-200 hover:bg-setu-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu motion-safe:hover:-translate-y-0.5 sm:w-[202px] lg:h-[calc(var(--s)*40)] lg:w-[calc(var(--s)*202)] lg:gap-[calc(var(--s)*10)] lg:text-[calc(var(--s)*15)] lg:leading-[calc(var(--s)*20)]"
            >
              Start A Project
              {/* Figma vector 24:2814 — 13 × 10 arrow. */}
              <svg
                viewBox="0 0 13 10"
                fill="none"
                aria-hidden
                className="h-2.5 w-[13px] lg:h-[calc(var(--s)*10)] lg:w-[calc(var(--s)*13)]"
              >
                <path
                  d="M1 5h11M8 1l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="/contact?intent=consultation"
              className="inline-flex h-10 w-full max-w-[280px] items-center justify-center rounded-[50px] border-[1.5px] border-setu text-[15px] font-semibold leading-5 text-black transition-[background-color,color,transform] duration-200 hover:bg-setu hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu motion-safe:hover:-translate-y-0.5 sm:w-[246px] lg:h-[calc(var(--s)*40)] lg:w-[calc(var(--s)*246)] lg:text-[calc(var(--s)*15)] lg:leading-[calc(var(--s)*20)] dark:text-white"
            >
              Book a Free Consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
