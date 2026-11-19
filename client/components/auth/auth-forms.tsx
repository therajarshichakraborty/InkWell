"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { readText, useFormSubmit } from "@/lib/use-form-submit";
import { AuthError, AuthSubmit, InputField, PasswordField } from "./auth-fields";
import { authStagger } from "./auth-shell";

function useAuthRedirect() {
  const router = useRouter();

  return () => {
    router.push("/dashboard");
    router.refresh();
  };
}

export function SignInForm() {
  const redirect = useAuthRedirect();
  const { pending, error, onSubmit } = useFormSubmit(async (form) => {
    const { error } = await authClient.signIn.email({
      email: readText(form, "email"),
      password: readText(form, "password"),
    });

    if (error) throw new Error(error.message ?? "Unable to sign in");
    redirect();
  });

  return (
    <motion.form
      variants={authStagger}
      onSubmit={onSubmit}
      className='mt-8 space-y-4'>
      <InputField
        label='Email'
        name='email'
        type='email'
        autoComplete='email'
        placeholder='you@example.com'
        required
      />
      <PasswordField
        label='Password'
        name='password'
        autoComplete='current-password'
        placeholder='Your password'
        required
      />
      <AuthError message={error} />
      <div className='pt-2'>
        <AuthSubmit pending={pending}>{pending ? "Signing in" : "Sign in"}</AuthSubmit>
      </div>
    </motion.form>
  );
}

export function SignUpForm() {
  const redirect = useAuthRedirect();
  const [username, setUsername] = useState("");
  const { pending, error, onSubmit } = useFormSubmit(async (form) => {
    const { error } = await authClient.signUp.email({
      name: readText(form, "name"),
      username: readText(form, "username"),
      email: readText(form, "email"),
      password: readText(form, "password"),
    });

    if (error) throw new Error(error.message ?? "Unable to create account");
    redirect();
  });

  return (
    <motion.form
      variants={authStagger}
      onSubmit={onSubmit}
      className='mt-8 space-y-4'>
      <InputField
        label='Name'
        name='name'
        autoComplete='name'
        placeholder='Ada Lovelace'
        required
      />
      <InputField
        label='Username'
        name='username'
        autoComplete='username'
        placeholder='ada'
        pattern='[A-Za-z0-9_]{3,30}'
        value={username}
        onChange={(event) => setUsername(event.target.value.replace(/\s/g, ""))}
        hint={
          <>
            Your blog lives at <span className='font-medium text-foreground'>/{username.toLowerCase() || "username"}</span>
          </>
        }
        required
      />
      <InputField
        label='Email'
        name='email'
        type='email'
        autoComplete='email'
        placeholder='you@example.com'
        required
      />
      <PasswordField
        label='Password'
        name='password'
        autoComplete='new-password'
        placeholder='At least 8 characters'
        minLength={8}
        required
      />
      <AuthError message={error} />
      <div className='pt-2'>
        <AuthSubmit pending={pending}>{pending ? "Creating account" : "Create account"}</AuthSubmit>
      </div>
    </motion.form>
  );
}
