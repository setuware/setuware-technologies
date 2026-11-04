import { AuthCard } from "@/components/admin/auth-card";

import { ForgotForm } from "./forgot-form";

export default function ForgotPage() {
  return (
    <AuthCard title="Reset your password" subtitle="We'll email you a link to choose a new one.">
      <ForgotForm />
    </AuthCard>
  );
}
