# Pay-With-Zcash Widget

A lightweight embeddable widget for accepting **Zcash payments** with QR codes, payment URIs, and sharable short-links.  
Supports **auto-mount**, **manual mount**, and **framework adapters** (React + Next.js).

---

## Installation

### Option 1 — Auto-mount (Simple)

```html
<div id="pwz-widget-container"></div>

<script
  src="https://cdn.example.com/pay-with-zcash.embed.v2.js"
  data-address="zs1abcd..."
  data-amount="0.25"
  data-label="Donate"
  data-theme="dark"
  data-api-base="https://your-backend.onrender.com/api"
  data-target="#pwz-widget-container"
></script>
```

### Option 2 — Manual Mount (Full Control)

```html
<div id="donate-target"></div>

<script src="https://cdn.example.com/pay-with-zcash.embed.v2.js"></script>

<script>
  const instance = window.renderZcashButton("#donate-target", {
    address: "zs1abcd...",
    amount: "1.75",
    label: "Support",
    theme: "light",
    apiBase: "https://your-backend.onrender.com/api",
    target: "#donate-target",
  });

  // instance.open();
  // instance.close();
  // instance.destroy();
</script>
```

### Configuration Options

| Option     | Type                | Required | Description                               |
| ---------- | ------------------- | -------- | ----------------------------------------- |
| `address`  | `string`            | Yes      | Zcash address (UA recommended)            |
| `amount`   | `number \| string`  | Yes      | ZEC amount                                |
| `label`    | `string`            | No       | Button label                              |
| `theme`    | `"light" \| "dark"` | No       | UI theme                                  |
| `memo`     | `string`            | No       | Optional memo field                       |
| `apiBase`  | `string`            | Yes      | Backend service root URL                  |
| `target`   | `string`            | Yes      | CSS selector for mount container          |
| `disabled` | `boolean`           | No       | Disable interactivity (preview mode only) |


### Instance Methods

| Method      | Description                      |
| ----------- | -------------------------------- |
| `open()`    | Opens modal programmatically     |
| `close()`   | Closes modal                     |
| `destroy()` | Removes widget entirely from DOM |


### Preview Mode (For Widget Generator)

When generating preview UIs (React, Next.js) you can disable the widget until all options are valid:

```javascript
window.renderZcashButton("#pwz-preview", {
  address,
  amount,
  apiBase,
  target: "#pwz-preview",
  disabled: true,
});
```
This prevents wallet opens, QR modal, copying, etc.


## **Framework Adapters**
These adapters wrap the global script API into clean components. Below are **ready-to-use** adapters for React and Next.js.


### **React Adapter — `PayWithZcash.tsx`**

```tsx
import { useEffect, useRef } from "react";
import type { PayWithZcashConfig, PayWithZcashInstance } from "./index";

interface Props extends Omit<PayWithZcashConfig, "target"> {}

export function PayWithZcash(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<PayWithZcashInstance | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = null;
    }

    instanceRef.current = window.renderZcashButton?.(
      "#" + containerRef.current.id,
      {
        ...props,
        target: "#" + containerRef.current.id,
      }
    );

    return () => instanceRef.current?.destroy();
  }, [JSON.stringify(props)]);

  return (
    <div
      id={`pwz-react-${Math.random().toString(36).slice(2)}`}
      ref={containerRef}
    />
  );
}
```

### Next.js Adapter — PayWithZcash.client.tsx

This MUST be a client component

```jsx
"use client";

import { useEffect, useRef } from "react";
import type { PayWithZcashConfig, PayWithZcashInstance } from "./index";

export default function PayWithZcashClient(
  props: Omit<PayWithZcashConfig, "target">
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<PayWithZcashInstance | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy old instance if re-rendering
    instanceRef.current?.destroy();

    instanceRef.current = window.renderZcashButton?.(
      "#" + containerRef.current.id,
      {
        ...props,
        target: "#" + containerRef.current.id,
      }
    );

    return () => instanceRef.current?.destroy();
  }, [JSON.stringify(props)]);

  return (
    <div
      id={`pwz-next-${Math.random().toString(36).slice(2)}`}
      ref={containerRef}
    />
  );
}
```
