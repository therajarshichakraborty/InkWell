import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/auth-forms";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <AuthShell
      title='Start your blog'
      description='Write in Markdown, group posts into series, publish when ready.'
      footer={
        <>
          Already have an account?{" "}
          <Link
            href='/login'
            className='font-medium text-foreground underline-offset-4 hover:underline'>
            Sign in
          </Link>
        </>
      }>
      <SignUpForm />
    </AuthShell>
  );
}
