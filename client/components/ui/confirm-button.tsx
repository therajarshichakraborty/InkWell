"use client";

import { useState, useTransition } from "react";
import { Button } from "./button";

type ConfirmButtonProps = {
  label: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
};

export function ConfirmButton({ label, confirmLabel, onConfirm }: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    startTransition(onConfirm);
  }

  return (
    <Button
      variant='danger'
      className='px-0'
      disabled={pending}
      onClick={handleClick}
      onBlur={() => setConfirming(false)}>
      {confirming ? confirmLabel : label}
    </Button>
  );
}
