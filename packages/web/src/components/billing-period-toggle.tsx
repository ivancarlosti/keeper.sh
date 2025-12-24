import {
  billingPeriodSchema,
  type BillingPeriod,
} from "@keeper.sh/data-schemas";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";

export type { BillingPeriod };

interface BillingPeriodToggleProps {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
}

export function BillingPeriodToggle({
  value,
  onChange,
}: BillingPeriodToggleProps) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(values) => {
        if (values.length > 0) {
          onChange(billingPeriodSchema.assert(values[0]));
        }
      }}
      className="inline-grid grid-cols-2 rounded-lg border border-gray-200 p-1 bg-gray-50"
    >
      <Toggle
        value="monthly"
        className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-900 data-[pressed]:bg-white data-[pressed]:text-gray-900 data-[pressed]:shadow-sm cursor-pointer"
      >
        Monthly
      </Toggle>
      <Toggle
        value="yearly"
        className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-900 data-[pressed]:bg-white data-[pressed]:text-gray-900 data-[pressed]:shadow-sm cursor-pointer"
      >
        Yearly
        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
          -50%
        </span>
      </Toggle>
    </ToggleGroup>
  );
}
