import { redirect } from "next/navigation";
import { BillingPageContent } from "./billing-page-content";

function isCommercialMode(): boolean {
  return process.env.NEXT_PUBLIC_COMMERCIAL_MODE === "true";
}

export default function BillingPage() {
  if (!isCommercialMode()) {
    redirect("/dashboard");
  }

  return <BillingPageContent />;
}
