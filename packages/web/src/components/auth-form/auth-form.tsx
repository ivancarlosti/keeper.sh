import { Form } from "@base-ui-components/react/form";
import { Field } from "@base-ui-components/react/field";
import { Input } from "@base-ui-components/react/input";
import { Button } from "@base-ui-components/react/button";
import styles from "./auth-form.module.css";

export { styles as authFormStyles };

export function AuthFormContainer({ children }: { children: React.ReactNode }) {
  return <main className={styles.container}>{children}</main>;
}

export function AuthForm({
  onSubmit,
  children,
}: {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <Form className={styles.form} onSubmit={onSubmit}>
      {children}
    </Form>
  );
}

export function AuthFormTitle({ children }: { children: React.ReactNode }) {
  return <h1 className={styles.title}>{children}</h1>;
}

export function AuthFormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className={styles.error}>{message}</div>;
}

export function AuthFormField({
  name,
  label,
  type = "text",
  required = false,
  autoComplete,
  minLength,
  maxLength,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
}) {
  return (
    <Field.Root name={name} className={styles.field}>
      <Field.Label className={styles.label}>{label}</Field.Label>
      <Input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        className={styles.input}
      />
    </Field.Root>
  );
}

export function AuthFormSubmit({
  isLoading,
  children,
  loadingText,
}: {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText: string;
}) {
  return (
    <Button type="submit" disabled={isLoading} className={styles.submitButton}>
      {isLoading ? loadingText : children}
    </Button>
  );
}

export function AuthFormFooter({ children }: { children: React.ReactNode }) {
  return <p className={styles.footer}>{children}</p>;
}

export { styles };
