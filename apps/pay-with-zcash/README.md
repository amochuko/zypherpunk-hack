# Pay with Zcash Widget

Pay-with-Zcash Button Generator is a beautiful blend of utility, visibility, and community adoption. It empowers merchants and creators, gives Zcash tangible everyday use, and can easily grow into a plugin ecosystem later (Shopify, Ghost, WordPress, etc.).

Let's anyone instantly create a "Pay with Zcash" button for their website or checkout page — no account, no backend wallet, just their ZEC address.

The button opens a small payment modal (or QR popup) showing:

- Payment address
- Amount (in ZEC or USD)
- Description (item name, etc.)
- QR code for mobile wallet
- Optional copy-to-clipboard button

## ⚙️ Core Features (MVP)
Feature	                    Description
--------------------------------------------
Form UI	                    | Merchants enter: Zcash Address, Amount, Currency (ZEC/USD), Label (e.g. “Donate”, “Buy Now”).
Button Generator	        | Generates embeddable <script> snippet or HTML iframe that renders a “Pay with Zcash” button.
QR Payment Modal	        | Clicking the button opens a modal with QR code + amount + memo text.
Clipboard Copy	            | Copy payment address or memo easily.
Optional API	            | Simple /convert/usd-to-zec using CoinGecko API.
No Account Needed	        | Fully client-side MVP; backend optional for rate conversions.



## 🪜 Future Upgrades

- Add webhook / payment verification API.
- Plugin SDK for Shopify / WooCommerce.
- Multi-currency converter (EUR, NGN, etc.).
- Support shielded addresses (Z-addr, unified).
- Integrate with Zcash light wallet for “confirm received” proof.
- White-label “Pay with Zcash” hosted pages.


## Installation

1. Clone or copy this repo
2. Install dependencies:

```bash
npm install
```

3. Run app
```
npm run dev


- Frontend demo: http://localhost:4000
- API endpoints: /api/qr, /api/shorten


### The widget supports:

- Light/dark theme
- Memo & label display
- QR code generated locally
- Copy address button
- Short URL generation

### Deployment

- Deploy independently on **Vercel / Netlify**:
