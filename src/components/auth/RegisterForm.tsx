"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/actions/auth";

function formatActionError(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["message", "msg", "error", "error_description", "code"]) {
      const field = record[key];
      if (typeof field === "string" && field.trim()) return field;
    }
  }
  return "Registration failed. Please try again.";
}

type RegisterResult = {
  error?: unknown;
  message?: string;
  ok?: boolean;
  redirectTo?: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const result = (await registerAction(
      new FormData(e.currentTarget)
    )) as RegisterResult | undefined;

    setLoading(false);

    if (!result) {
      setError("Registration failed. Please try again.");
      return;
    }

    if (result.error) {
      setError(formatActionError(result.error));
      return;
    }

    if (result.message) {
      setSuccess(result.message);
      return;
    }

    if (result.ok && result.redirectTo) {
      router.push(result.redirectTo);
      router.refresh();
      return;
    }

    setSuccess("Account created successfully.");
    router.push("/login");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 p-3 rounded">
          {success}
        </p>
      )}
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" name="fullName" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" required className="mt-1" />
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
        {loading ? "Creating account..." : "Create Account"}
      </Button>
      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
