import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// In-memory storage for demo (replace with database in production)
const newsletterSubscribers: Array<Record<string, unknown>> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = newsletterSchema.parse(body);

    // Check if already subscribed
    const exists = newsletterSubscribers.find(
      (s) => s.email === validated.email
    );

    if (exists) {
      return NextResponse.json(
        { success: false, message: "You are already subscribed to our newsletter." },
        { status: 409 }
      );
    }

    const subscriber = {
      id: Date.now().toString(),
      email: validated.email,
      subscribedAt: new Date().toISOString(),
      status: "active",
    };

    newsletterSubscribers.push(subscriber);

    // TODO: Add to email marketing service (Mailchimp, ConvertKit, etc.)
    // TODO: Send welcome email

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed to our newsletter!",
        data: subscriber,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: newsletterSubscribers,
    count: newsletterSubscribers.length,
  });
}
