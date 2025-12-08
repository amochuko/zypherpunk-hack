// Type definitions for Pay-With-Zcash Widget v2

export interface PayWithZcashConfig {
  /** Zcash address (UA preferred) */
  address: string;

  /** Amount as number or string */
  amount: number | string;

  /** Button label text */
  label?: string;

  /** "light" | "dark" */
  theme?: "light" | "dark";

  /** Optional memo */
  memo?: string;

  /** Backend API base URL */
  apiBase: string;

  /** Selector for mount container */
  target: string;

  /** Disable interactivity (used for preview generator) */
  disabled?: boolean;
}

export interface PayWithZcashInstance {
  open(): void;
  close(): void;
  destroy(): void;
}

export interface PayWithZcashGlobal {
  /**
   * Render the widget into a target container
   */
  renderZcashButton(
    target: string,
    config: PayWithZcashConfig
  ): PayWithZcashInstance | null;
}

declare global {
  interface Window {
    renderZcashButton?: PayWithZcashGlobal["renderZcashButton"];
  }
}

export {};
