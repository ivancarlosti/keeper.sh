"use client";

import { Separator } from "@base-ui-components/react/separator";
import { SubscriptionPlans } from "@/components/subscription-plans";
import { PageContent } from "@/components/page-content";
import { Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";
import { useSubscription } from "@/hooks/use-subscription";
import { useOrders } from "@/hooks/use-orders";
import { TextBody } from "@/components/typography";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function BillingHistory() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) {
    return (
      <Section>
        <SectionHeader
          title="Billing History"
          description="View your past invoices and payment history"
        />
        <div className="py-4 border border-gray-200 rounded-lg">
          <div className="animate-pulse space-y-3 px-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </Section>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Section>
        <SectionHeader
          title="Billing History"
          description="View your past invoices and payment history"
        />
        <TextBody className="py-4 border border-gray-200 rounded-lg text-center">
          No billing history yet
        </TextBody>
      </Section>
    );
  }

  return (
    <Section>
      <SectionHeader
        title="Billing History"
        description="View your past invoices and payment history"
      />
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {order.product?.name ?? order.description}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatCurrency(order.totalAmount, order.currency)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={
                      order.paid
                        ? "text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs font-medium"
                        : "text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium"
                    }
                  >
                    {order.paid ? "Paid" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

export default function BillingPage() {
  const { data: subscription, isLoading, mutate } = useSubscription();

  return (
    <PageContent>
      <SubscriptionPlans
        currentPlan={subscription?.plan}
        currentInterval={subscription?.interval}
        isSubscriptionLoading={isLoading}
        onSubscriptionChange={mutate}
      />
      <Separator className="bg-gray-200 h-px" />
      <BillingHistory />
    </PageContent>
  );
}
