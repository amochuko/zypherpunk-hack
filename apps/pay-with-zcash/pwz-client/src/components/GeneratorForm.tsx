/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

interface Props {
  onGenerated: (data: any) => void;
}

export default function GeneratorForm(props: Props) {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          from: currency,
          to: "zec",
        }),
      });

      const data = await res.json();

      const qrRes = await fetch("/api/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          amount: data.amount,
          label,
        }),
      });

      const qrData = await qrRes.json();

      props.onGenerated({
        address,
        amount: data.amount,
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
      style={{
        backgroundColor: "white",
        border: "1px solid white",
        borderRadius: 12,
        padding: 24,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label
            htmlFor=""
            style={{
              display: "block",
              fontWeight: "bold",
            }}
          >
            Zcash Address
          </label>

          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            style={{
              width: "100%",
              border: "1px solid #333",
              padding: 8,
            }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label htmlFor="" style={{ display: "block", fontWeight: "600" }}>
            Amount
          </label>
          <input
            type="numbet"
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #333",
              padding: 8,
            }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label htmlFor="" style={{ display: "block", fontWeight: "600" }}>
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #333",
              padding: 8,
            }}
          >
            <option value="usd">USD</option>
            <option value="zec">ZEC</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
            }}
          >
            Label (optional)
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Buy T-Shirt"
            style={{
              width: "100%",
              border: "1px solid #333",
              padding: 8,
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            // border: "1px solid #333",
            fontWeight: "bold",
            padding: 12,
          }}
        >
          {loading ? "Generating..." : "Generate Button"}
        </button>
      </div>
    </form>
  );
}
