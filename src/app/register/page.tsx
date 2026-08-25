import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = { title: "Register | Lumière Jewellery" };

export default function RegisterPage() {
  return (
    <div className="py-16 px-4">
      <h1 className="font-serif text-3xl text-center mb-8">Create Account</h1>
      <RegisterForm />
    </div>
  );
}
