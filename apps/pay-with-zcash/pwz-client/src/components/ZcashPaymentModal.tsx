import { useState, useEffect } from "react";
import { X, Copy, Check, Link2, ExternalLink } from "lucide-react";

interface ZcashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
  amount: string;
  label?: string;
  theme?: "light" | "dark";
  memo?: string;
}

export const ZcashPaymentModal = ({
  isOpen,
  onClose,
  address,
  amount,
  label,
  theme = "light",
  memo = "",
}: ZcashPaymentModalProps) => {
  const [copied, setCopied] = useState<"address" | "uri" | null>(null);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const baseURI = `zcash:${address}?amount=${amount}${memo ? `&memo=${encodeURIComponent(memo)}` : ""}`;

  useEffect(() => {
    if (!isOpen) {
      setCopied(null);
      setShortUrl(null);
    }
  }, [isOpen]);

  const handleCopy = async (text: string, type: "address" | "uri") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };

  const handleGenerateShortUrl = async () => {
    setIsGenerating(true);
    // Simulated - replace with actual API call
    setTimeout(() => {
      setShortUrl("https://zec.sh/abc123");
      setIsGenerating(false);
    }, 1000);
  };

  if (!isOpen) return null;

  const isDark = theme === "dark";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className={`absolute inset-0 ${isDark ? "bg-black/80" : "bg-black/50"} backdrop-blur-sm`} />
      
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md rounded-3xl p-8 shadow-2xl animate-scale-in ${
          isDark 
            ? "bg-widget-dark-modal text-widget-dark-text" 
            : "bg-widget-light-modal text-widget-light-text"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isDark 
              ? "hover:bg-widget-dark-surface text-widget-dark-muted hover:text-widget-dark-text" 
              : "hover:bg-widget-light-surface text-widget-light-muted hover:text-widget-light-text"
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-zcash-gold to-zcash-amber flex items-center justify-center shadow-lg shadow-zcash-gold/30">
            <span className="text-widget-dark-bg font-bold text-2xl">Z</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Pay with Zcash</h2>
          {label && (
            <p className={`text-sm ${isDark ? "text-widget-dark-muted" : "text-widget-light-muted"}`}>
              {label}
            </p>
          )}
        </div>

        {/* QR Code */}
        <div className={`relative p-4 rounded-2xl mb-6 ${isDark ? "bg-white" : "bg-widget-light-surface"}`}>
          <div className="aspect-square w-full max-w-[200px] mx-auto bg-white rounded-xl flex items-center justify-center">
            {/* Placeholder QR - replace with actual QR generation */}
            <div className="w-full h-full p-3">
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-xs text-center px-4">QR Code<br/>for {address.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Display */}
        <div className={`text-center p-4 rounded-2xl mb-4 ${isDark ? "bg-widget-dark-surface" : "bg-widget-light-surface"}`}>
          <p className={`text-xs uppercase tracking-wider mb-1 ${isDark ? "text-widget-dark-muted" : "text-widget-light-muted"}`}>
            Amount
          </p>
          <p className="text-2xl font-bold">
            <span className="text-zcash-gold">{amount}</span>
            <span className={`text-lg ml-2 ${isDark ? "text-widget-dark-muted" : "text-widget-light-muted"}`}>ZEC</span>
          </p>
        </div>

        {/* Address */}
        <div className="mb-4">
          <label className={`text-xs uppercase tracking-wider mb-2 block ${isDark ? "text-widget-dark-muted" : "text-widget-light-muted"}`}>
            Address
          </label>
          <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? "bg-widget-dark-surface" : "bg-widget-light-surface"}`}>
            <p className="flex-1 text-sm font-mono truncate">{address}</p>
            <button
              onClick={() => handleCopy(address, "address")}
              className={`p-2 rounded-lg transition-all ${
                copied === "address"
                  ? "bg-green-500/20 text-green-500"
                  : isDark
                    ? "hover:bg-widget-dark-bg text-widget-dark-muted hover:text-widget-dark-text"
                    : "hover:bg-widget-light-bg text-widget-light-muted hover:text-widget-light-text"
              }`}
            >
              {copied === "address" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Memo */}
        {memo && (
          <div className="mb-4">
            <label className={`text-xs uppercase tracking-wider mb-2 block ${isDark ? "text-widget-dark-muted" : "text-widget-light-muted"}`}>
              Memo
            </label>
            <div className={`p-3 rounded-xl text-sm ${isDark ? "bg-widget-dark-surface" : "bg-widget-light-surface"}`}>
              {memo}
            </div>
          </div>
        )}

        {/* URI Field */}
        <div className="mb-6">
          <label className={`text-xs uppercase tracking-wider mb-2 block ${isDark ? "text-widget-dark-muted" : "text-widget-light-muted"}`}>
            Payment URI
          </label>
          <div className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? "bg-widget-dark-surface" : "bg-widget-light-surface"}`}>
            <input
              type="text"
              value={shortUrl || baseURI}
              readOnly
              className="flex-1 bg-transparent text-sm font-mono outline-none truncate"
            />
            <button
              onClick={() => handleCopy(shortUrl || baseURI, "uri")}
              className={`p-2 rounded-lg transition-all ${
                copied === "uri"
                  ? "bg-green-500/20 text-green-500"
                  : isDark
                    ? "hover:bg-widget-dark-bg text-widget-dark-muted hover:text-widget-dark-text"
                    : "hover:bg-widget-light-bg text-widget-light-muted hover:text-widget-light-text"
              }`}
            >
              {copied === "uri" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              isDark 
                ? "bg-widget-dark-surface hover:bg-widget-dark-surface/80 text-widget-dark-text" 
                : "bg-widget-light-surface hover:bg-gray-200 text-widget-light-text"
            }`}
          >
            Close
          </button>
          <button
            onClick={handleGenerateShortUrl}
            disabled={isGenerating || !!shortUrl}
            className="flex-1 py-3 px-4 rounded-xl font-medium transition-all bg-gradient-to-r from-zcash-gold to-zcash-amber text-widget-dark-bg hover:shadow-lg hover:shadow-zcash-gold/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-widget-dark-bg/30 border-t-widget-dark-bg rounded-full animate-spin" />
            ) : shortUrl ? (
              <>
                <Check className="w-4 h-4" />
                Generated
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                Short URL
              </>
            )}
          </button>
        </div>

        {/* Open in Wallet */}
        <a
          href={baseURI}
          className={`mt-4 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
            isDark ? "text-widget-dark-muted hover:text-widget-dark-text" : "text-widget-light-muted hover:text-widget-light-text"
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          Open in Zcash Wallet
        </a>
      </div>
    </div>
  );
};
