"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await forgotPasswordAction(new FormData(e.currentTarget));
    if (result.error) setError(result.error);
    else setMessage("Password reset link sent to your email.");
  }

  return (
    <div className="py-16 px-4 max-w-md mx-auto">
      <h1 className="font-serif text-3xl text-center mb-8">Reset Password</h1>
      {message && (
        <p className="text-sm text-green-700 bg-green-50 p-3 mb-4">{message}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 mb-4">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <Button type="submit" className="w-full">
          Send Reset Link
        </Button>
      </form>
      <p className="text-sm text-center mt-4">
        <Link href="/login" className="text-primary underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
