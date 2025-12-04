/* eslint-disable @typescript-eslint/no-explicit-any */
import { QRCodeCanvas } from "qrcode.react";

export default function ButtonPreview({ config }: { config: any }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 text-center">
      <h2 className="text-xl font-semibold mb-2">Preview</h2>

      <button
        style={{
          color: "white",
          border: "1px solid #eee",
          borderRadius: "12px",
          backgroundColor: "#9eeeee",
          padding: "8px 16px",
        }}
      >
        Pay {config.amount.toFixed(4)} ZEC
      </button>

      <div className="mt-4 flex flex-col items-center">
        <QRCodeCanvas
          value={`zcash:${config.address}?amount=${config.amount}`}
        />
        <p className="text-sm mt-2 text-gray-600 break-all">{config.address}</p>
      </div>
    </div>
  );
}
