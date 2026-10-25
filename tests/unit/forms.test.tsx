import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ContactForm } from "@/components/interactive/contact-form";
import { NewsletterForm } from "@/components/interactive/newsletter-form";

/** Builds a fetch stub returning our standard API envelope. */
function mockFetch(
  response: { status?: number; body: unknown } | Error,
): ReturnType<typeof vi.fn> {
  const fn =
    response instanceof Error
      ? vi.fn().mockRejectedValue(response)
      : vi.fn().mockResolvedValue(
          new Response(JSON.stringify(response.body), {
            status: response.status ?? 200,
            headers: { "content-type": "application/json" },
          }),
        );
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});

describe("NewsletterForm", () => {
  it("submits the address and shows the confirmation", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({
      status: 201,
      body: { ok: true, data: { email: "a@b.com" }, message: "You're on the list." },
    });

    render(<NewsletterForm source="footer" />);
    await user.type(screen.getByLabelText(/email/i), "a@b.com");
    await user.click(screen.getByRole("button", { name: /subscribe/i }));

    expect(await screen.findByRole("status")).toHaveTextContent("You're on the list.");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toMatchObject({ email: "a@b.com", source: "footer" });
  });

  it("shows the server's field error against the input", async () => {
    const user = userEvent.setup();
    mockFetch({
      status: 422,
      body: {
        ok: false,
        error: {
          code: "validation_failed",
          message: "Check the fields",
          fields: { email: "That email address looks incomplete" },
        },
      },
    });

    render(<NewsletterForm />);
    await user.type(screen.getByLabelText(/email/i), "broken@");
    await user.click(screen.getByRole("button", { name: /subscribe/i }));

    expect(
      await screen.findByText("That email address looks incomplete"),
    ).toBeInTheDocument();
  });

  it("explains a rate limit rather than failing silently", async () => {
    const user = userEvent.setup();
    mockFetch({
      status: 429,
      body: {
        ok: false,
        error: { code: "rate_limited", message: "Too many attempts. Try again in 60s." },
      },
    });

    render(<NewsletterForm />);
    await user.type(screen.getByLabelText(/email/i), "a@b.com");
    await user.click(screen.getByRole("button", { name: /subscribe/i }));

    expect(await screen.findByText(/too many attempts/i)).toBeInTheDocument();
  });

  it("recovers from a network failure with a readable message", async () => {
    const user = userEvent.setup();
    mockFetch(new TypeError("Failed to fetch"));

    render(<NewsletterForm />);
    await user.type(screen.getByLabelText(/email/i), "a@b.com");
    await user.click(screen.getByRole("button", { name: /subscribe/i }));

    expect(await screen.findByText(/couldn't reach the server|offline/i)).toBeInTheDocument();
  });

  it("survives an HTML error page where JSON was expected", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html>502</html>", {
          status: 502,
          headers: { "content-type": "text/html" },
        }),
      ),
    );

    render(<NewsletterForm />);
    await user.type(screen.getByLabelText(/email/i), "a@b.com");
    await user.click(screen.getByRole("button", { name: /subscribe/i }));

    expect(await screen.findByText(/went wrong on our side/i)).toBeInTheDocument();
  });
});

describe("ContactForm", () => {
  const fill = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/your name/i), "Priya Sharma");
    await user.type(screen.getByLabelText(/work email/i), "priya@example.com");
    await user.type(
      screen.getByLabelText(/about the project/i),
      "We run 14 retail stores and need an ordering platform.",
    );
    await user.click(screen.getByRole("checkbox"));
  };

  it("sends the brief and shows the reference on success", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch({
      status: 201,
      body: {
        ok: true,
        data: { reference: "STW-7F3K2A" },
        message: "Thanks — your brief is with us.",
      },
    });

    render(<ContactForm />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /send project brief/i }));

    expect(await screen.findByText("STW-7F3K2A")).toBeInTheDocument();
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toMatchObject({ name: "Priya Sharma", consent: true });
    expect(typeof body.elapsedMs).toBe("number");
  });

  it("maps server field errors back onto the inputs", async () => {
    const user = userEvent.setup();
    mockFetch({
      status: 422,
      body: {
        ok: false,
        error: {
          code: "validation_failed",
          message: "Please check the highlighted fields.",
          fields: { message: "A sentence or two about the project helps" },
        },
      },
    });

    render(<ContactForm />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /send project brief/i }));

    expect(
      await screen.findByText("A sentence or two about the project helps"),
    ).toBeInTheDocument();
  });

  it("saves the draft as you type so a refresh does not lose it", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ContactForm />);

    await user.type(screen.getByLabelText(/your name/i), "Priya");
    await waitFor(() => {
      expect(window.localStorage.getItem("setuware.contact-draft.v1")).toContain("Priya");
    });

    unmount();
    render(<ContactForm />);

    expect(await screen.findByDisplayValue("Priya")).toBeInTheDocument();
  });

  it("clears the saved draft once the brief is delivered", async () => {
    const user = userEvent.setup();
    mockFetch({
      status: 201,
      body: { ok: true, data: { reference: "STW-ABCDEF" } },
    });

    render(<ContactForm />);
    await fill(user);
    await user.click(screen.getByRole("button", { name: /send project brief/i }));

    await screen.findByText("STW-ABCDEF");
    expect(window.localStorage.getItem("setuware.contact-draft.v1")).toBeNull();
  });

  it("preselects the service named in the URL", async () => {
    window.history.replaceState(null, "", "/contact?service=managed-hosting");
    render(<ContactForm />);

    await waitFor(() => {
      expect(screen.getByLabelText(/what do you need/i)).toHaveValue("managed-hosting");
    });
  });

  it("prefills the audit request when arriving from the exit offer", async () => {
    window.history.replaceState(null, "", "/contact?intent=audit");
    render(<ContactForm />);

    expect(
      await screen.findByDisplayValue(/free performance audit/i),
    ).toBeInTheDocument();
  });

  it("keeps a hidden honeypot in the form", () => {
    const { container } = render(<ContactForm />);
    expect(container.querySelector("#contact-honeypot")).toBeInTheDocument();
  });
});
