import { QRCodeCanvas } from "qrcode.react";

interface Config {
  address: string;
  amount: number;
  label: string;
}

interface Props {
  config: Config;
}

export default function ButtonPreview({ config }: Props) {
  const zcashUri = `zcash:${config.address}?amount=${config.amount}`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-widget-light-surface to-white dark:from-widget-dark-surface dark:to-widget-dark-bg border border-widget-light-border dark:border-widget-dark-border shadow-xl">
      {/* Decorative gradient orb */}
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-zcash-gold/20 to-zcash-amber/10 rounded-full blur-3xl" />
      
      <div className="relative p-6 space-y-5">
        {/* Header */}
        <div className="text-center pb-4 border-b border-widget-light-border dark:border-widget-dark-border">
          <h3 className="font-semibold text-lg text-widget-light-text dark:text-widget-dark-text">
            Preview
          </h3>
          <p className="text-xs text-widget-light-muted dark:text-widget-dark-muted mt-1">
            How your payment button will appear
          </p>
        </div>

        {/* Preview Button */}
        <div className="flex justify-center">
          <button className="px-6 py-3 rounded-xl font-semibold text-widget-dark-bg bg-gradient-to-r from-zcash-gold to-zcash-amber shadow-lg shadow-zcash-gold/25 hover:shadow-zcash-gold/40 transform hover:scale-[1.02] transition-all duration-200">
            Pay {config.amount.toFixed(4)} ZEC
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white rounded-2xl shadow-inner border border-widget-light-border dark:border-widget-dark-border">
            <QRCodeCanvas
              value={zcashUri}
              size={160}
              bgColor="#ffffff"
              fgColor="#1a1a1a"
              level="M"
              includeMargin={false}
            />
          </div>
          
          {/* Address Display */}
          <div className="w-full p-3 rounded-xl bg-widget-light-bg/50 dark:bg-widget-dark-bg/50 border border-widget-light-border dark:border-widget-dark-border">
            <p className="text-xs text-widget-light-muted dark:text-widget-dark-muted text-center break-all font-mono leading-relaxed">
              {config.address || "u1abc123xyz..."}
            </p>
          </div>

          {/* Label if exists */}
          {config.label && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zcash-gold/10 border border-zcash-gold/20">
              <span className="text-xs font-medium text-zcash-gold">
                {config.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
