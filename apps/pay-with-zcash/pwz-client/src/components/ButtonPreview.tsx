import { GeneratedConfig } from "@/pages/Index";
import { WidgetLivePreview } from "./WidgetLivePreview";

interface Props {
  config: GeneratedConfig;
}

export default function ButtonPreview({ config }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-widget-light-surface to-white dark:from-widget-dark-surface dark:to-widget-dark-bg border border-widget-light-border dark:border-widget-dark-border shadow-xl">
      {/* Decorative gradient orb */}
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-zcash-gold/20 to-zcash-amber/10 rounded-full blur-3xl" />

      <div className="relative p-6 space-y-5">
        {/* Header */}
        <div className="text-center pb-4 border-b border-widget-light-border dark:border-widget-dark-border">
          <h3 className="font-semibold text-lg text-widget-light-text dark:text-widget-dark-text">
            Live Widget Demo
          </h3>
          <p className="text-xs text-widget-light-muted dark:text-widget-dark-muted mt-1">
            Click the button below to see the payment modal in action
          </p>
        </div>

        <div className={`flex justify-center mb-16`}>
          <WidgetLivePreview
            config={{
              address: config.address,
              amount: Number(config.amount),
              label: config.label,
              apiBase: config.apiBase,
              theme: config.theme,
              target: config.target,
              disabled: config.disabled,
            }}
          />
        </div>
      </div>
    </div>
  );
}
