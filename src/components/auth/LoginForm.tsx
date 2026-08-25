"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/actions/auth";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);
    setLoading(false);
    if (result.error) {
      setError(
        typeof result.error === "string"
          ? result.error
          : "Sign in failed. Please try again."
      );
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
      )}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="mt-1"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
      <p className="text-sm text-center text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="text-primary underline">
          Register
        </Link>
        {" · "}
        <Link href="/forgot-password" className="text-primary underline">
          Forgot password?
        </Link>
      </p>
    </form>
  );
}
