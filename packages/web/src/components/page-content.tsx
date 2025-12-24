export function PageContent({ children }: { children: React.ReactNode }) {
  return <main className="flex-1 flex flex-col gap-8">{children}</main>;
}
