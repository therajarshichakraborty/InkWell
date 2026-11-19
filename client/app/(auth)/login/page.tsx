import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthShell
      title='Welcome back'
      description='Sign in to pick up the draft you left behind.'
      footer={
        <>
          New here?{" "}
          <Link
            href='/signup'
            className='font-medium text-foreground underline-offset-4 hover:underline'>
            Create an account
          </Link>
        </>
      }>
      <SignInForm />
    </AuthShell>
  );
}
