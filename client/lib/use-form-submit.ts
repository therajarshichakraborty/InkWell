"use client";

import { useState, useTransition, type FormEvent } from "react";
import { errorMessage } from "./utils";

type SubmitHandler = (form: FormData, element: HTMLFormElement) => Promise<string | void>;

export function readText(form: FormData, key: string) {
  return String(form.get(key) ?? "");
}

export function useFormSubmit(handler: SubmitHandler) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const { submitter } = event.nativeEvent as SubmitEvent;
    const form = new FormData(element, submitter);

    setError(null);
    setNotice(null);

    startTransition(async () => {
      try {
        setNotice((await handler(form, element)) ?? null);
      } catch (cause) {
        setError(errorMessage(cause));
      }
    });
  }

  return { pending, error, notice, onSubmit };
}
