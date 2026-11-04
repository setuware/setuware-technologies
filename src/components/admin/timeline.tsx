import { ArrowRightLeft, Mail, MessageSquare, Settings2, UserRoundCheck } from "lucide-react";

import type { Note } from "@/lib/cms/crm";
import { cn } from "@/lib/utils";

import { formatWhen, timeAgo } from "./ui";

const KINDS: Record<Note["kind"], { Icon: typeof Mail; tone: string; label: string }> = {
  note: { Icon: MessageSquare, tone: "from-[#2f56d8] to-[#4f7cff]", label: "Note" },
  email: { Icon: Mail, tone: "from-[#0a8ea6] to-[#22c3e6]", label: "Email" },
  status: { Icon: ArrowRightLeft, tone: "from-[#7c3aed] to-[#a78bfa]", label: "Status" },
  assign: { Icon: UserRoundCheck, tone: "from-[#f59e0b] to-[#fb923c]", label: "Owner" },
  system: { Icon: Settings2, tone: "from-slate-500 to-slate-400", label: "Update" },
};

/** Notes, emails and changes for a record, newest first. */
export function Timeline({ notes, legacyNote, received }: { notes: Note[]; legacyNote?: string; received: string }) {
  const items = [...notes];
  return (
    <ol className="relative flex flex-col gap-5">
      <span aria-hidden className="absolute bottom-2 left-[15px] top-2 w-px bg-border" />
      {items.map((note) => {
        const kind = KINDS[note.kind] ?? KINDS.system;
        const [first, ...rest] = note.body.split("\n");
        return (
          <li key={note.id} className="relative flex gap-3.5">
            <span className={cn("relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white ring-4 ring-surface", kind.tone)}>
              <kind.Icon className="size-3.5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-sm text-foreground">
                <strong className="font-semibold">{note.author}</strong>
                <span className="text-muted-foreground"> · {kind.label}</span>
                <span className="float-right text-xs text-muted-foreground" title={formatWhen(note.created_at)}>
                  {timeAgo(note.created_at)}
                </span>
              </p>
              <p className={cn("mt-1 whitespace-pre-wrap text-sm leading-relaxed", note.kind === "note" || note.kind === "email" ? "text-foreground/85" : "text-muted-foreground")}>
                {note.kind === "email" ? <span className="font-medium text-foreground">{first}</span> : first}
                {rest.length ? `\n${rest.join("\n")}` : ""}
              </p>
            </div>
          </li>
        );
      })}
      {legacyNote ? (
        <li className="relative flex gap-3.5">
          <span className={cn("relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white ring-4 ring-surface", KINDS.note.tone)}>
            <MessageSquare className="size-3.5" aria-hidden />
          </span>
          <p className="min-w-0 flex-1 whitespace-pre-wrap pt-1.5 text-sm text-foreground/85">{legacyNote}</p>
        </li>
      ) : null}
      <li className="relative flex gap-3.5">
        <span className="relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-xs ring-4 ring-surface">✦</span>
        <p className="pt-1.5 text-sm text-muted-foreground">Received {formatWhen(received)}</p>
      </li>
    </ol>
  );
}
