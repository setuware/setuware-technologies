import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CommandMenuDialog } from "@/components/layout/command-menu-dialog";
import { setChatOpen } from "@/components/interactive/chatbot/state";
import { ExitIntentOffer } from "@/components/interactive/exit-intent-offer";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  push.mockClear();
  window.localStorage.clear();
});

describe("CommandMenuDialog", () => {
  const open = () =>
    render(<CommandMenuDialog open onOpenChange={vi.fn()} />);

  it("renders nothing when closed", () => {
    const { container } = render(
      <CommandMenuDialog open={false} onOpenChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("focuses the search input on open", async () => {
    open();
    await waitFor(() => {
      expect(screen.getByRole("textbox", { name: /search/i })).toHaveFocus();
    });
  });

  it("lists services, work and articles before any typing", () => {
    open();
    // "Services" appears twice: as a group heading and as a nav page entry.
    expect(screen.getAllByText("Services").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Case studies")).toBeInTheDocument();
    expect(screen.getByText("Articles")).toBeInTheDocument();
    expect(screen.getByText("Hosting & domains")).toBeInTheDocument();
  });

  it("filters as you type", async () => {
    const user = userEvent.setup();
    open();

    await user.type(screen.getByRole("textbox", { name: /search/i }), "hosting");

    expect(screen.getByText("Hosting & domains")).toBeInTheDocument();
    expect(screen.queryByText("UI/UX & branding")).not.toBeInTheDocument();
  });

  it("matches a subsequence so 'webdev' finds web development", async () => {
    const user = userEvent.setup();
    open();

    await user.type(screen.getByRole("textbox", { name: /search/i }), "webdev");

    expect(screen.getByText("Web application development")).toBeInTheDocument();
  });

  it("offers a way forward when nothing matches", async () => {
    const user = userEvent.setup();
    open();

    await user.type(screen.getByRole("textbox", { name: /search/i }), "zzzzqqq");

    expect(screen.getByText(/nothing matched/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /just ask us/i })).toBeInTheDocument();
  });

  it("navigates on Enter", async () => {
    const user = userEvent.setup();
    open();

    await user.type(screen.getByRole("textbox", { name: /search/i }), "hosting");
    await user.keyboard("{Enter}");

    expect(push).toHaveBeenCalledWith("/services/managed-hosting");
  });

  it("moves the selection with arrow keys", async () => {
    const user = userEvent.setup();
    open();

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(push).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<CommandMenuDialog open onOpenChange={onOpenChange} />);

    await user.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("is exposed as a modal dialog", () => {
    open();
    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName(/search/i);
  });
});

describe("ExitIntentOffer", () => {
  /** Simulates the pointer leaving through the top of the viewport. */
  function triggerExitIntent() {
    const event = new MouseEvent("mouseout", { bubbles: true, clientY: 0 });
    Object.defineProperty(event, "relatedTarget", { value: null });
    document.dispatchEvent(event);
  }

  it("stays hidden until the visitor has engaged", () => {
    render(<ExitIntentOffer />);
    triggerExitIntent();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("appears on exit intent once engaged", async () => {
    vi.useFakeTimers();
    render(<ExitIntentOffer />);

    vi.advanceTimersByTime(13_000);
    triggerExitIntent();
    vi.useRealTimers();

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(/book a free consultation/i);
  });

  it("records a dismissal so it does not reappear for a fortnight", async () => {
    vi.useFakeTimers();
    const { unmount } = render(<ExitIntentOffer />);
    vi.advanceTimersByTime(13_000);
    triggerExitIntent();
    vi.useRealTimers();

    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: /no thanks/i }));

    const stored = window.localStorage.getItem("setuware.audit-offer.v1");
    expect(stored).toContain("dismissedAt");
    unmount();

    vi.useFakeTimers();
    render(<ExitIntentOffer />);
    vi.advanceTimersByTime(13_000);
    triggerExitIntent();
    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("never shows again once the offer has been taken", async () => {
    window.localStorage.setItem(
      "setuware.audit-offer.v1",
      JSON.stringify({ dismissedAt: null, takenAt: Date.now() }),
    );

    vi.useFakeTimers();
    render(<ExitIntentOffer />);
    vi.advanceTimersByTime(13_000);
    triggerExitIntent();
    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("is not shown while the assistant is open", async () => {
    setChatOpen(true);
    vi.useFakeTimers();
    render(<ExitIntentOffer />);
    vi.advanceTimersByTime(13_000);
    triggerExitIntent();
    vi.useRealTimers();
    setChatOpen(false);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("validates, then sends the enquiry to the contact API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: { reference: "STW-1" } }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    vi.useFakeTimers();
    render(<ExitIntentOffer />);
    vi.advanceTimersByTime(13_000);
    triggerExitIntent();
    vi.useRealTimers();

    const user = userEvent.setup();
    const submit = await screen.findByRole("button", { name: /request a call back/i });
    await user.click(submit);
    expect(await screen.findByText(/tell us your name/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText(/^name/i), "Priya Sharma");
    await user.type(screen.getByLabelText(/email/i), "priya@example.com");
    await user.click(screen.getByRole("button", { name: "Website" }));
    await user.type(screen.getByLabelText(/anything we should know/i), "A new company website with five pages.");
    await user.click(submit);

    expect(await screen.findByText(/we have your enquiry/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/contact", expect.objectContaining({ method: "POST" }));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toMatchObject({ name: "Priya Sharma", email: "priya@example.com", consent: true });
    expect(body.service).toBe("Website");
    expect(body.message).toContain("five pages");
    expect(window.localStorage.getItem("setuware.audit-offer.v1")).toContain("takenAt");
  });
});
