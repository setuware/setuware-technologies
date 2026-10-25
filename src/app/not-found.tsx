import { NotFoundView } from "@/components/layout/not-found-view";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView />;
}
