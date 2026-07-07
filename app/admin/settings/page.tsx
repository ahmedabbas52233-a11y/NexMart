import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST, TAX_RATE } from "@/lib/utils";
import { Info } from "lucide-react";

export default function AdminSettingsPage() {
  const settings = [
    { label: "Store Name", value: "NexMart" },
    { label: "Currency", value: "USD" },
    { label: "Free Shipping Threshold", value: `$${FREE_SHIPPING_THRESHOLD.toFixed(2)}` },
    { label: "Standard Shipping Cost", value: `$${STANDARD_SHIPPING_COST.toFixed(2)}` },
    { label: "Tax Rate", value: `${(TAX_RATE * 100).toFixed(0)}%` },
    { label: "Google Sign-In", value: process.env.GOOGLE_CLIENT_ID ? "Enabled" : "Disabled (no client ID configured)" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Store configuration</p>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-6 flex gap-3">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-text-secondary">
          These values are currently defined as constants in <code className="text-xs bg-white px-1 py-0.5 rounded border border-border">lib/utils.ts</code> and
          environment variables rather than stored in the database, so this page is read-only for now.
          Making them editable would mean adding a <code className="text-xs bg-white px-1 py-0.5 rounded border border-border">StoreSettings</code> model
          and wiring a form to it — a natural next step, but out of scope until the store needs more than one configuration.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="divide-y divide-border-light">
          {settings.map((setting) => (
            <div key={setting.label} className="flex items-center justify-between px-5 py-4">
              <span className="text-sm text-text-secondary">{setting.label}</span>
              <span className="text-sm font-medium text-text-primary">{setting.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
