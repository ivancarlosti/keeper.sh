"use client";

import { Button } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import {
  button,
  dialogBackdrop,
  dialogPopup,
  dialogTitle,
  dialogDescription,
  dialogActions,
} from "@/styles";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmingLabel: string;
  confirmVariant?: "primary" | "danger";
  isConfirming: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmingLabel,
  confirmVariant = "danger",
  isConfirming,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={dialogBackdrop()} />
        <Dialog.Popup className={dialogPopup({ size: "sm" })}>
          <Dialog.Title className={dialogTitle()}>{title}</Dialog.Title>
          <Dialog.Description className={dialogDescription()}>
            {description}
          </Dialog.Description>
          <div className={dialogActions()}>
            <Dialog.Close className={button({ variant: "secondary" })}>
              Cancel
            </Dialog.Close>
            <Button
              disabled={isConfirming}
              onClick={onConfirm}
              className={button({ variant: confirmVariant })}
            >
              {isConfirming ? confirmingLabel : confirmLabel}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
