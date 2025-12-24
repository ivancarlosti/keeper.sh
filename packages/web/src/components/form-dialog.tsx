"use client";

import { Button } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import { button, dialogPopup } from "@/styles";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  size: "sm" | "md" | "lg";
  children: React.ReactNode;
  error: string | null;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  submitVariant: "primary" | "danger";
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  trigger?: React.ReactElement;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  size,
  children,
  error,
  isSubmitting,
  submitLabel,
  submittingLabel,
  submitVariant,
  onSubmit,
  trigger,
}: FormDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger render={trigger} />}
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Popup className={dialogPopup({ size })}>
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 mb-4">
            {description}
          </Dialog.Description>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {children}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 justify-end mt-2">
              <Dialog.Close className={button({ variant: "secondary" })}>
                Cancel
              </Dialog.Close>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={button({ variant: submitVariant })}
              >
                {isSubmitting ? submittingLabel : submitLabel}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
