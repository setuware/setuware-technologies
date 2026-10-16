import { NextRequest, NextResponse } from "next/server";

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  tech: string[];
  url?: string;
  featured: boolean;
}

// Mock data - replace with database queries in production
const projects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description:
      "Full-stack e-commerce solution with Next.js, Stripe integration, and admin dashboard.",
    image: "/projects/ecommerce.jpg",
    category: "Web Development",
    tech: ["Next.js", "TypeScript", "Stripe", "PostgreSQL", "Tailwind CSS"],
    url: "/projects/ecommerce",
    featured: true,
  },
  {
    id: "2",
    title: "AI Chatbot Assistant",
    description:
      "Intelligent customer support chatbot using OpenAI GPT-4 and vector embeddings.",
    image: "/projects/chatbot.jpg",
    category: "AI & ML",
    tech: ["Next.js", "OpenAI", "Pinecone", "Node.js", "TypeScript"],
    url: "/projects/chatbot",
    featured: true,
  },
  {
    id: "3",
    title: "FinTech Mobile App",
    description:
      "Cross-platform banking app with real-time transactions and biometric authentication.",
    image: "/projects/fintech.jpg",
    category: "Mobile Apps",
    tech: ["React Native", "Firebase", "TypeScript", "Redux"],
    url: "/projects/fintech",
    featured: false,
  },
  {
    id: "4",
    title: "SaaS Analytics Dashboard",
    description:
      "Real-time analytics platform with data visualization and custom reporting.",
    image: "/projects/analytics.jpg",
    category: "Web Development",
    tech: ["Next.js", "Chart.js", "PostgreSQL", "Prisma", "Tailwind CSS"],
    url: "/projects/analytics",
    featured: false,
  },
  {
    id: "5",
    title: "Healthcare Portal",
    description:
      "HIPAA-compliant patient management system with telemedicine capabilities.",
    image: "/projects/healthcare.jpg",
    category: "Web Development",
    tech: ["React", "Node.js", "PostgreSQL", "Docker", "AWS"],
    url: "/projects/healthcare",
    featured: false,
  },
  {
    id: "6",
    title: "Crypto Trading Platform",
    description:
      "Real-time cryptocurrency trading platform with advanced charting and portfolio management.",
    image: "/projects/crypto.jpg",
    category: "Web Development",
    tech: ["Next.js", "WebSocket", "TypeScript", "Redis", "PostgreSQL"],
    url: "/projects/crypto",
    featured: false,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  let filtered = projects;

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (featured === "true") {
    filtered = filtered.filter((p) => p.featured);
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    count: filtered.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newProject: Project = {
      id: Date.now().toString(),
      ...body,
    };
    projects.push(newProject);

    return NextResponse.json(
      { success: true, data: newProject },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
