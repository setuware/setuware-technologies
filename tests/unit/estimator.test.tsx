import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Estimator } from "@/components/interactive/estimator";
import { estimateProject } from "@/lib/pricing";
import { formatINRCompact } from "@/lib/utils";

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/estimate");
});

/** The headline range lives in the sticky summary panel. */
function headline(): string {
  return screen.getByText(/–/, { selector: "p" }).textContent ?? "";
}

describe("Estimator", () => {
  it("shows a priced range for the default configuration", async () => {
    render(<Estimator />);

    const expected = estimateProject({
      service: "web-development",
      scope: 8,
      design: "custom",
      features: ["auth", "seo"],
      timeline: "standard",
      platforms: ["web"],
      retainer: true,
    });

    await waitFor(() => {
      expect(headline()).toContain(formatINRCompact(expected.low));
    });
  });

  it("raises the price when a feature is added", async () => {
    const user = userEvent.setup();
    render(<Estimator />);

    const before = headline();
    await user.click(screen.getByLabelText("Features"));
    await user.click(screen.getByLabelText(/Payments & billing/i));

    await waitFor(() => expect(headline()).not.toBe(before));
  });

  it("reveals the platform picker only for app builds", async () => {
    const user = userEvent.setup();
    render(<Estimator />);

    expect(screen.queryByLabelText("Platforms")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Service"), "app-development");
    expect(await screen.findByLabelText("Platforms")).toBeInTheDocument();
  });

  it("never lets every platform be deselected", async () => {
    const user = userEvent.setup();
    render(<Estimator />);

    await user.selectOptions(screen.getByLabelText("Service"), "app-development");
    await user.click(await screen.findByLabelText("Platforms"));
    const web = screen.getByRole("checkbox", { name: "Web" });

    // Deselecting the only selected platform must keep it selected.
    await user.click(web);
    expect(web).toBeChecked();
  });

  it("shortens the timeline when delivery is accelerated", async () => {
    const user = userEvent.setup();
    render(<Estimator />);

    const weeksBefore = screen.getByText(/~\d+ weeks/).textContent;
    await user.selectOptions(screen.getByLabelText("Timeline"), "accelerated");

    await waitFor(() => {
      expect(screen.getByText(/~\d+ weeks/).textContent).not.toBe(weeksBefore);
    });
  });

  it("mirrors the configuration into the URL so it can be shared", async () => {
    const user = userEvent.setup();
    render(<Estimator />);

    await user.selectOptions(screen.getByLabelText("Service"), "managed-hosting");

    await waitFor(() => {
      expect(window.location.search).toContain("s=managed-hosting");
    });
  });

  it("restores a configuration from a shared URL", async () => {
    window.history.replaceState(
      null,
      "",
      "/estimate?s=app-development&n=20&d=premium&t=accelerated&f=payments&p=ios,android&r=0",
    );

    render(<Estimator />);

    await waitFor(() => {
      expect(screen.getByLabelText("Service")).toHaveValue("app-development");
    });
    expect(screen.getByLabelText(/Payments & billing/i)).toBeChecked();
    expect(screen.getByLabelText("Design")).toHaveValue("premium");
  });

  it("ignores junk in the URL rather than breaking", async () => {
    window.history.replaceState(null, "", "/estimate?s=nonsense&n=abc&f=fake,auth");

    render(<Estimator />);

    await waitFor(() => {
      expect(headline()).toMatch(/₹/);
    });
    expect(screen.getByLabelText(/Accounts & authentication/i)).toBeChecked();
  });

  it("persists the configuration across a remount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Estimator />);

    await user.selectOptions(screen.getByLabelText("Service"), "product-design");
    await waitFor(() => {
      expect(window.localStorage.getItem("setuware.estimate.v1")).toContain("product-design");
    });

    unmount();
    window.history.replaceState(null, "", "/estimate");
    render(<Estimator />);

    await waitFor(() => {
      expect(screen.getByLabelText("Service")).toHaveValue("product-design");
    });
  });

  it("resets back to the default configuration", async () => {
    const user = userEvent.setup();
    render(<Estimator />);

    await user.selectOptions(screen.getByLabelText("Service"), "managed-hosting");
    await user.click(screen.getByRole("button", { name: /start over/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("Service")).toHaveValue("web-development");
    });
    expect(window.location.search).toBe("");
  });

  it("shows payment milestones that sum to roughly the total", () => {
    render(<Estimator />);

    const milestones = screen.getByText("Payment milestones").closest("div")!;
    expect(within(milestones).getByText(/Discovery & architecture/)).toBeInTheDocument();
    expect(within(milestones).getByText(/QA, launch & handover/)).toBeInTheDocument();
  });

  it("emails the quote and confirms it was sent", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: { reference: "STW-QT1234", total: 500_000 },
          message: "Quote on its way to your inbox.",
        }),
        { status: 201, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<Estimator />);
    await user.type(screen.getByLabelText(/^Name/), "Priya Sharma");
    await user.type(screen.getByLabelText(/Work email/), "priya@example.com");
    await user.click(screen.getByRole("button", { name: /send me this quote/i }));

    expect(await screen.findByText("Quote on its way to your inbox.")).toBeInTheDocument();

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.input.service).toBe("web-development");
    expect(body.email).toBe("priya@example.com");
  });

  it("surfaces a server error without losing the configuration", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: false,
            error: { code: "rate_limited", message: "Too many quote requests." },
          }),
          { status: 429, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    render(<Estimator />);
    await user.type(screen.getByLabelText(/^Name/), "Priya");
    await user.type(screen.getByLabelText(/Work email/), "priya@example.com");
    await user.click(screen.getByRole("button", { name: /send me this quote/i }));

    expect(await screen.findByText("Too many quote requests.")).toBeInTheDocument();
    expect(headline()).toMatch(/₹/);
  });
});
