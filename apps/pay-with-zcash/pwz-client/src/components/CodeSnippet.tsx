import { useState } from "react";
import type { FormConfig } from "../App";

interface Props {
  config: FormConfig;
}

export default function CodeSnippet({ config }: Props) {
  const [copied, setcopied] = useState(false);

  const snippet = `<script src='https://paywithz.cash/pay-with-zcash.embed.js' data-address='${config.address}' data-amount='${config.amount}' data-label='${config.label}'></script>
  `;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setcopied(true);
    setTimeout(() => setcopied(false), 1500);
  };

  return (
    <div
      style={{
        backgroundColor: "gray",
        color: "GrayText",
        padding: 8,
        border: "1px solid #333",
        borderRadius: "80%",
        fontSize: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 8,
        }}
      >
        <span style={{ fontWeight: 400, color: "#666" }}>Embed Code</span>
        <button
          onClick={handleCopy}
          style={{
            background: "#eee",
            paddingRight: 12,
            paddingLeft: 12,
            paddingTop: 1,
            fontSize: "12px",
            borderRadius: 8,
            border: "1px solid #999",
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>

        <pre
          style={{
            fontSize: 12,
            overflowX: "auto",
          }}
        >
          {snippet}
        </pre>
      </div>
    </div>
  );
}
