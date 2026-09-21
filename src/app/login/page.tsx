import LoginForm from "@/components/auth/LoginForm";
import { getSupabaseConfigIssue } from "@/lib/supabase/config";

export const metadata = { title: "Login | SHE Collection" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const configIssue = getSupabaseConfigIssue();
  const { redirect } = await searchParams;

  return (
    <div className="py-16 px-4 sm:px-6">
      <h1 className="font-serif text-3xl text-center mb-8">Sign In</h1>
      <LoginForm configIssue={configIssue} redirectTo={redirect} />
    </div>
  );
}
