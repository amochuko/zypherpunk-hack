import { useEffect, useRef } from "react";

interface Props {
  config: {
    address: string;
    amount: number;
    label?: string;
    customCSS?: Record<string, string>;
    apiBase: string;
    theme: string;
    target: string;
    disabled: boolean;
  };
}

export function WidgetLivePreview({ config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const target = config.target.replace("#", "");

  useEffect(() => {
    if (!containerRef.current) return null;

    // clear previous mount;
    containerRef.current.innerHTML = "";

    // remove previous script
    if (scriptRef.current) {
      scriptRef.current.remove();
    }

    // create new script
    const script = document.createElement("script");
    script.src = import.meta.env.VITE_API_BASE_URL_EMBED_CODE;
    script.async = true;

    // required deterministic widget mount container
    script.setAttribute("data-target", config.target);

    script.setAttribute("data-address", config.address);
    script.setAttribute("data-amount", config.amount.toString());
    script.setAttribute("data-label", config.label);
    script.setAttribute("data-theme", config.theme);
    script.setAttribute("data-api-base", config.apiBase);

    script.setAttribute("data-disabled", String(config.disabled));

    scriptRef.current = script;

    containerRef.current.appendChild(script);
  }, [config]);

  return (
    <>
      {/* required container for the embed script */}
      <div id={target} ref={containerRef}></div>
    </>
  );
}
