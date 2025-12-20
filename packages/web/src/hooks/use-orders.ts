import useSWR from "swr";
import type { CustomerOrder } from "@polar-sh/sdk/models/components/customerorder";
import { authClient } from "@/lib/auth-client";

async function fetchOrders(): Promise<CustomerOrder[]> {
  const response = await authClient.customer.orders.list();

  if (!response.data) {
    return [];
  }

  const page = await response.data.next();
  if (page.done || !page.value) {
    return [];
  }

  return page.value.result.items;
}

export function useOrders() {
  return useSWR("customer-orders", fetchOrders);
}
