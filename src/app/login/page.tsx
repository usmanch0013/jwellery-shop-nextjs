import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Login | Lumière Jewellery" };

export default function LoginPage() {
  return (
    <div className="py-16 px-4">
      <h1 className="font-serif text-3xl text-center mb-8">Sign In</h1>
      <LoginForm />
    </div>
  );
}
