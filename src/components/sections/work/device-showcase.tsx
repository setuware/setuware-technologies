import Image from "next/image";

import type { CaseStudyPhoto } from "@/lib/case-study-photos";
import { cn } from "@/lib/utils";

/** Live-site screenshot in a browser frame, with the phone view overlapping it. */
export function DeviceShowcase({
  photo,
  url,
  preload = false,
  className,
}: {
  photo: CaseStudyPhoto;
  url?: string;
  preload?: boolean;
  className?: string;
}) {
  const host = url ? new URL(url).host.replace(/^www\./, "") : undefined;
  return (
    <div className={cn("relative pb-8 pr-6 sm:pr-14", className)}>
      <div className="overflow-hidden rounded-xl border border-[#dfe5f3] bg-white shadow-[0_30px_70px_-30px_rgba(15,23,60,0.45)] dark:border-white/10 dark:bg-[#0d1226]">
        <div className="flex items-center gap-3 border-b border-[#e8ecf6] bg-[#f6f8fc] px-4 py-2.5 dark:border-white/10 dark:bg-white/5">
          <span aria-hidden className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          {host ? (
            <span className="mx-auto truncate rounded-md bg-white px-3 py-0.5 text-[11px] text-slate-500 ring-1 ring-[#e3e8f3] dark:bg-white/10 dark:text-slate-300 dark:ring-white/10">
              {host}
            </span>
          ) : null}
        </div>
        <div className="relative aspect-[16/10]">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            preload={preload}
            sizes="(min-width: 1280px) 720px, (min-width: 1024px) 55vw, 92vw"
            className="object-cover object-top"
          />
        </div>
      </div>
      {photo.mobile ? (
        <div className="absolute bottom-0 right-0 w-[26%] max-w-[9.5rem] overflow-hidden rounded-[1.4rem] border-[5px] border-[#0f1330] bg-[#0f1330] shadow-[0_24px_50px_-18px_rgba(15,23,60,0.6)]">
          <div className="relative aspect-[390/780] overflow-hidden rounded-[1rem]">
            <Image
              src={photo.mobile.src}
              alt=""
              fill
              sizes="160px"
              className="object-cover object-top"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
