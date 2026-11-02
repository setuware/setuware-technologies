"use client";

import dynamic from "next/dynamic";

import { CommandMenu } from "./command-menu";

/**
 * Non-essential UI, kept out of the first load.
 *
 * `ssr: false` is only valid inside a Client Component, which is the reason
 * this thin wrapper exists rather than importing these directly in the layout.
 *
 * `CommandMenu` is imported eagerly on purpose — it is only a keyboard
 * listener, and lazy-loading it meant ⌘K pressed in the first moment after
 * load silently did nothing. The dialog it opens is still fetched on demand.
 * The audit offer only mounts after a visitor has engaged with the page.
 *
 * Bottom-right stack, from the bottom: WhatsApp, the assistant launcher (its
 * panel is fetched on first open), then back-to-top.
 */
const ExitIntentOffer = dynamic(
  () =>
    import("@/components/interactive/exit-intent-offer").then(
      (mod) => mod.ExitIntentOffer,
    ),
  { ssr: false },
);

const ScrollProgress = dynamic(
  () => import("./scroll-progress").then((mod) => mod.ScrollProgress),
  { ssr: false },
);

const WhatsAppButton = dynamic(
  () => import("@/components/interactive/whatsapp-button").then((mod) => mod.WhatsAppButton),
  { ssr: false },
);

const ChatLauncher = dynamic(
  () => import("@/components/interactive/chatbot/launcher").then((mod) => mod.ChatLauncher),
  { ssr: false },
);

export function DeferredWidgets() {
  return (
    <>
      <ScrollProgress />
      <CommandMenu />
      <WhatsAppButton />
      <ChatLauncher />
      <ExitIntentOffer />
    </>
  );
}
