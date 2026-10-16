import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// In-memory storage for demo (replace with database in production)
const contactSubmissions: Array<Record<string, unknown>> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    const submission = {
      id: Date.now().toString(),
      ...validated,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    contactSubmissions.push(submission);

    // TODO: Send email notification using Resend, SendGrid, or Nodemailer
    // TODO: Save to database (PostgreSQL, MongoDB, etc.)

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your message! We'll get back to you within 24 hours.",
        data: submission,
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
    data: contactSubmissions,
    count: contactSubmissions.length,
  });
}
