import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Counter } from "@/components/ui/counter";
import { DeferredSection } from "@/components/ui/deferred-section";
import { Field, Honeypot, Input } from "@/components/ui/field";
import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "@/components/ui/reveal";
import { PostBody } from "@/components/blog/blocks";
import { PipelineAnimation } from "@/components/interactive/pipeline-animation";

describe("Accordion", () => {
  const items = [
    { question: "How much does it cost?", answer: "It depends on scope." },
    { question: "Who owns the code?", answer: "You do, from the first commit." },
  ];

  it("renders every question and answer in the DOM for crawlers", () => {
    render(<Accordion items={items} />);

    expect(screen.getByText("How much does it cost?")).toBeInTheDocument();
    expect(screen.getByText("You do, from the first commit.")).toBeInTheDocument();
  });

  it("opens the requested item by default", () => {
    const { container } = render(<Accordion items={items} defaultOpen={1} />);
    const details = container.querySelectorAll("details");

    expect(details[0]).not.toHaveAttribute("open");
    expect(details[1]).toHaveAttribute("open");
  });

  it("toggles on click using native disclosure behaviour", async () => {
    const user = userEvent.setup();
    const { container } = render(<Accordion items={items} />);
    const first = container.querySelector("details")!;

    expect(first.open).toBe(false);
    await user.click(within(first).getByText("How much does it cost?"));
    expect(first.open).toBe(true);
  });

  it("groups items so only one can be open when single-open", () => {
    const { container } = render(<Accordion items={items} singleOpen />);
    for (const details of container.querySelectorAll("details")) {
      expect(details).toHaveAttribute("name", "faq");
    }
  });
});

describe("Button and ButtonLink", () => {
  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("can be an explicit submit button", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("does not fire when disabled", async () => {
    const user = userEvent.setup();
    let clicks = 0;
    render(
      <Button disabled onClick={() => (clicks += 1)}>
        Send
      </Button>,
    );

    await user.click(screen.getByRole("button"));
    expect(clicks).toBe(0);
  });

  it("renders internal hrefs as links", () => {
    render(<ButtonLink href="/estimate">Quote</ButtonLink>);
    expect(screen.getByRole("link", { name: "Quote" })).toHaveAttribute(
      "href",
      "/estimate",
    );
  });

  it("opens external links safely in a new tab", () => {
    render(<ButtonLink href="https://example.com">Docs</ButtonLink>);
    const link = screen.getByRole("link", { name: "Docs" });

    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("keeps tel: and mailto: links in the same tab", () => {
    render(<ButtonLink href="tel:+919000000000">Call</ButtonLink>);
    expect(screen.getByRole("link", { name: "Call" })).not.toHaveAttribute("target");
  });
});

describe("Counter", () => {
  it("exposes the final value to assistive technology immediately", () => {
    render(<Counter to={120} suffix="+" />);
    expect(screen.getByText("120+", { selector: ".sr-only" })).toBeInTheDocument();
  });

  it("renders the final value before the count starts, never zero", () => {
    render(<Counter to={10} suffix="+" />);
    expect(screen.getByText("10+", { selector: "[aria-hidden]" })).toBeInTheDocument();
    expect(screen.queryByText("0+")).not.toBeInTheDocument();
  });

  it("keeps the decimal precision of a fractional target", () => {
    render(<Counter to={99.95} suffix="%" />);
    expect(screen.getByText("99.95%", { selector: ".sr-only" })).toBeInTheDocument();
  });
});

describe("Reveal", () => {
  it("renders children and becomes visible once observed", () => {
    render(<Reveal>Visible content</Reveal>);
    const node = screen.getByText("Visible content");

    expect(node).toBeInTheDocument();
    expect(node).toHaveAttribute("data-in-view", "true");
  });

  it("can render as a semantic list item", () => {
    render(
      <ul>
        <Reveal as="li">Item</Reveal>
      </ul>,
    );

    expect(screen.getByRole("listitem")).toHaveTextContent("Item");
  });
});

describe("DeferredSection", () => {
  it("keeps content in the DOM while deferring its rendering", () => {
    const { container } = render(
      <DeferredSection minHeight={400}>
        <p>Below the fold</p>
      </DeferredSection>,
    );

    expect(screen.getByText("Below the fold")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveStyle({ contentVisibility: "auto" });
  });
});

describe("Field", () => {
  it("associates the label with its control", () => {
    render(
      <Field label="Work email" htmlFor="email">
        <Input id="email" />
      </Field>,
    );

    expect(screen.getByLabelText(/Work email/)).toBeInTheDocument();
  });

  it("announces an error with role=alert and hides the hint", () => {
    render(
      <Field label="Email" htmlFor="email" error="Required" hint="We never spam">
        <Input id="email" aria-invalid />
      </Field>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    expect(screen.queryByText("We never spam")).not.toBeInTheDocument();
  });

  it("marks optional fields so required ones stand out", () => {
    render(
      <Field label="Phone" htmlFor="phone">
        <Input id="phone" />
      </Field>,
    );

    expect(screen.getByText("optional")).toBeInTheDocument();
  });
});

describe("Honeypot", () => {
  it("is hidden from assistive tech and the tab order", () => {
    const { container } = render(<Honeypot name="trap" />);
    const input = container.querySelector("#trap")!;

    expect(input).toHaveAttribute("tabindex", "-1");
    expect(input.closest("[aria-hidden='true']")).not.toBeNull();
  });
});

describe("Marquee", () => {
  it("duplicates its children and hides the copy from screen readers", () => {
    const { container } = render(
      <Marquee>
        <span>Vanik Retail</span>
      </Marquee>,
    );

    expect(screen.getAllByText("Vanik Retail")).toHaveLength(2);
    expect(container.querySelectorAll("[aria-hidden='true']").length).toBe(1);
  });
});

describe("PipelineAnimation", () => {
  it("is announced as a single labelled image rather than a wall of nodes", () => {
    render(<PipelineAnimation />);
    const figure = screen.getByRole("img");

    expect(figure).toHaveAccessibleName(/pipeline/i);
  });

  it("shows the pipeline stages", () => {
    render(<PipelineAnimation />);
    for (const stage of ["Commit", "Build", "Test", "Deploy"]) {
      expect(screen.getByText(stage)).toBeInTheDocument();
    }
  });
});

describe("PostBody", () => {
  it("renders each block type with the right semantics", () => {
    render(
      <PostBody
        blocks={[
          { type: "h2", text: "A heading" },
          { type: "p", text: "A paragraph." },
          { type: "ul", items: ["One", "Two"] },
          { type: "ol", items: ["First"] },
          { type: "quote", text: "A quote", cite: "Someone" },
          { type: "code", language: "bash", code: "npm test" },
          { type: "callout", tone: "warn", text: "Careful" },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("A heading");
    expect(screen.getByText("A paragraph.")).toBeInTheDocument();
    expect(screen.getAllByRole("list")).toHaveLength(2);
    expect(screen.getByText("A quote")).toBeInTheDocument();
    expect(screen.getByText("npm test")).toBeInTheDocument();
    expect(screen.getByText("Careful")).toBeInTheDocument();
  });

  it("escapes rather than interprets markup in content", () => {
    render(<PostBody blocks={[{ type: "p", text: "<script>alert(1)</script>" }]} />);

    expect(screen.getByText("<script>alert(1)</script>")).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
  });
});

describe("Badge", () => {
  it("renders its tone without losing the content", () => {
    render(<Badge tone="success">Operational</Badge>);
    expect(screen.getByText("Operational")).toBeInTheDocument();
  });
});
