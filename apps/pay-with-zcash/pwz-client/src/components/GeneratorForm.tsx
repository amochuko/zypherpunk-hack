import { config } from "@/config";
import { useState } from "react";

interface GeneratedConfig {
  address: string;
  amount: number;
  label: string;
  qrData?: unknown;
}

interface Props {
  onGenerated: (config: GeneratedConfig) => void;
}

const BASE_URL = config.VITE_API_HOST;
export default function GeneratorForm({ onGenerated }: Props) {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`api/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          from: currency,
          to: "zec",
        }),
      });

      const data = await res.json();
      console.log({ BASE_URL, data });

      const qrRes = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, amount: data.amount, label }),
      });

      const qrData = await qrRes.json();

      onGenerated({
        address,
        amount: data.amount,
        label,
        qrData,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to generate. Check inputs or API connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-widget-light-surface to-white dark:from-widget-dark-surface dark:to-widget-dark-bg border border-widget-light-border dark:border-widget-dark-border shadow-xl"
    >
      {/* Decorative gradient orb */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-zcash-gold/20 to-zcash-amber/10 rounded-full blur-3xl" />

      <div className="relative p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-widget-light-border dark:border-widget-dark-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zcash-gold to-zcash-amber flex items-center justify-center shadow-lg shadow-zcash-gold/20">
            <span className="text-widget-dark-bg font-bold text-lg">Z</span>
          </div>
          <div>
            <h3 className="font-semibold text-widget-light-text dark:text-widget-dark-text">
              Generate Payment Button
            </h3>
            <p className="text-xs text-widget-light-muted dark:text-widget-dark-muted">
              Create embeddable Zcash payment widgets
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Address Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-widget-light-text dark:text-widget-dark-text">
              Zcash Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="u1abc123xyz..."
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-widget-dark-bg border border-widget-light-border dark:border-widget-dark-border text-widget-light-text dark:text-widget-dark-text placeholder:text-widget-light-muted/50 dark:placeholder:text-widget-dark-muted/50 focus:outline-none focus:ring-2 focus:ring-zcash-gold/50 focus:border-zcash-gold transition-all duration-200"
            />
          </div>

          {/* Amount and Currency Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-widget-light-text dark:text-widget-dark-text">
                Amount
              </label>
              <input
                type="number"
                step={0.01}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-widget-dark-bg border border-widget-light-border dark:border-widget-dark-border text-widget-light-text dark:text-widget-dark-text placeholder:text-widget-light-muted/50 dark:placeholder:text-widget-dark-muted/50 focus:outline-none focus:ring-2 focus:ring-zcash-gold/50 focus:border-zcash-gold transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-widget-light-text dark:text-widget-dark-text">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-widget-dark-bg border border-widget-light-border dark:border-widget-dark-border text-widget-light-text dark:text-widget-dark-text focus:outline-none focus:ring-2 focus:ring-zcash-gold/50 focus:border-zcash-gold transition-all duration-200 cursor-pointer"
              >
                <option value="usd">USD</option>
                <option value="zec">ZEC</option>
              </select>
            </div>
          </div>

          {/* Label Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-widget-light-text dark:text-widget-dark-text">
              Label{" "}
              <span className="text-widget-light-muted dark:text-widget-dark-muted font-normal">
                (optional)
              </span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Buy T-Shirt"
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-widget-dark-bg border border-widget-light-border dark:border-widget-dark-border text-widget-light-text dark:text-widget-dark-text placeholder:text-widget-light-muted/50 dark:placeholder:text-widget-dark-muted/50 focus:outline-none focus:ring-2 focus:ring-zcash-gold/50 focus:border-zcash-gold transition-all duration-200"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-widget-dark-bg bg-gradient-to-r from-zcash-gold to-zcash-amber hover:from-zcash-amber hover:to-zcash-gold shadow-lg shadow-zcash-gold/25 hover:shadow-zcash-gold/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </span>
          ) : (
            "Generate Button"
          )}
        </button>
      </div>
    </form>
  );
}
