"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import { Separator } from "@base-ui/react/separator";
import { useAuth } from "@/components/auth-provider";
import { Toast } from "@/components/toast-provider";
import { updateUser, changePassword, deleteAccount, signOut } from "@/lib/auth";
import {
  button,
  input,
  label,
  settingsSection,
  settingsCard,
  settingsLabel,
  settingsValue,
} from "@/styles";

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const toastManager = Toast.useToastManager();

  const [isEditingName, setIsEditingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [nameValue, setNameValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdateName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await updateUser({ name: nameValue });
      await refresh();
      setIsEditingName(false);
      toastManager.add({ title: "Name updated" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setIsChangingPassword(false);
      toastManager.add({ title: "Password changed" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    try {
      await deleteAccount(password);
      await signOut();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setIsSubmitting(false);
    }
  }

  function openEditName() {
    setNameValue(user?.name ?? "");
    setError("");
    setIsEditingName(true);
  }

  function openChangePassword() {
    setError("");
    setIsChangingPassword(true);
  }

  function openDeleteAccount() {
    setError("");
    setIsDeletingAccount(true);
  }

  return (
    <div className="flex-1 flex flex-col gap-8">
      <section className={settingsSection()}>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your personal information
          </p>
        </div>

        <div className={settingsCard()}>
          <div className="flex items-center justify-between">
            <div>
              <div className={settingsLabel()}>Display Name</div>
              <div className={settingsValue()}>{user?.name || "Not set"}</div>
            </div>
            <Button
              onClick={openEditName}
              className={button({ variant: "secondary" })}
            >
              Edit
            </Button>
          </div>
          <Separator className="bg-gray-200 h-px" />
          <div>
            <div className={settingsLabel()}>Username</div>
            <div className={settingsValue()}>{user?.username}</div>
          </div>
        </div>
      </section>

      <section className={settingsSection()}>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your password and account security
          </p>
        </div>

        <div className={settingsCard()}>
          <div className="flex items-center justify-between">
            <div>
              <div className={settingsLabel()}>Password</div>
              <div className={settingsValue()}>••••••••</div>
            </div>
            <Button
              onClick={openChangePassword}
              className={button({ variant: "secondary" })}
            >
              Change
            </Button>
          </div>
        </div>
      </section>

      <section className={settingsSection()}>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Irreversible actions for your account
          </p>
        </div>

        <div className="flex flex-col gap-4 p-4 border border-red-300 bg-red-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-red-500">Delete Account</div>
              <div className="text-sm text-red-400">
                Permanently delete your account and all data
              </div>
            </div>
            <Button
              onClick={openDeleteAccount}
              className="inline-flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium border border-red-300 text-red-500 bg-transparent hover:bg-red-100 transition-colors cursor-pointer"
            >
              Delete
            </Button>
          </div>
        </div>
      </section>

      {/* Edit Name Dialog */}
      <Dialog.Root open={isEditingName} onOpenChange={setIsEditingName}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Popup className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-1">
              Edit Display Name
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mb-4">
              This is how your name appears across the app.
            </Dialog.Description>
            <form onSubmit={handleUpdateName} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className={label()}>
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className={input()}
                  autoComplete="name"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <div className="flex gap-2 justify-end mt-2">
                <Dialog.Close className={button({ variant: "secondary" })}>
                  Cancel
                </Dialog.Close>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={button({ variant: "primary" })}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Change Password Dialog */}
      <Dialog.Root open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Popup className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-1">
              Change Password
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mb-4">
              Enter your current password and choose a new one.
            </Dialog.Description>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="currentPassword" className={label()}>
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  className={input()}
                  autoComplete="current-password"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="newPassword" className={label()}>
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  className={input()}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="confirmPassword" className={label()}>
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  className={input()}
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <div className="flex gap-2 justify-end mt-2">
                <Dialog.Close className={button({ variant: "secondary" })}>
                  Cancel
                </Dialog.Close>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={button({ variant: "primary" })}
                >
                  {isSubmitting ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Account Dialog */}
      <Dialog.Root open={isDeletingAccount} onOpenChange={setIsDeletingAccount}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Popup className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-1">
              Delete Account
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mb-4">
              This action cannot be undone. All your calendars, integrations, and
              data will be permanently deleted.
            </Dialog.Description>
            <form onSubmit={handleDeleteAccount} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="deletePassword" className={label()}>
                  Enter your password to confirm
                </label>
                <input
                  id="deletePassword"
                  name="password"
                  type="password"
                  required
                  className={input()}
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <div className="flex gap-2 justify-end mt-2">
                <Dialog.Close className={button({ variant: "secondary" })}>
                  Cancel
                </Dialog.Close>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium border border-red-300 text-red-600 bg-transparent hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
