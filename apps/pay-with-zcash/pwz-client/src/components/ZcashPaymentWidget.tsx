import { useState } from "react";
import { ZcashPaymentModal } from "./ZcashPaymentModal";

interface ZcashPaymentWidgetProps {
  address: string;
  amount: string;
  label?: string;
  theme?: "light" | "dark";
  memo?: string;
}

export const ZcashPaymentWidget = ({
  address,
  amount,
  label = "Pay with Zcash",
  theme = "light",
  memo = "",
}: ZcashPaymentWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        disabled={Number(amount) === 0}
        onClick={() => setIsOpen(true)}
        className="group relative overflow-hidden px-8 py-4 rounded-2xl font-semibold text-widget-dark-bg transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-zcash-gold/30 hover:shadow-2xl hover:shadow-zcash-gold/40"
        style={{
          background:
            "linear-gradient(135deg, #F4B728 0%, #E5A420 50%, #D4940F 100%)",
        }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </div>

        {/* Icon + Text */}
        <span className="relative flex items-center gap-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h-2v-2h2v2zm0-4h-2V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z" />
          </svg>
          {label}
        </span>
      </button>

      <ZcashPaymentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        address={address}
        amount={amount}
        label={label}
        theme={theme}
        memo={memo}
      />
    </>
  );
};
