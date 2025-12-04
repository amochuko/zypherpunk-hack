(function () {
  const script = document.currentScript;
  const addr = script?.dataset.address;
  const amount = script?.dataset.amount;
  const label = script?.dataset.label || "Pay with Zcash";
  const color = script?.dataset.color || "#16a34a";
  const theme = script?.dataset.theme || "light";
  const customCSS = script?.dataset.css || null;
  const memo = script?.dataset.memo || ""; // optional

  if (!addr || !amount) {
    console.error("[Pay-with-Zcash] Missing address or amount.");
    return;
  }

  // Load custom CSS if provided
  if (customCSS) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = customCSS;
    document.head.appendChild(link);
  }

  // Theme colors
  const colors = {
    light: {
      bg: "#fff",
      text: "#222",
      modalBg: "#fff",
      overlay: "rgba(0,0,0,0.5)",
    },
    dark: {
      bg: "#111",
      text: "#eee",
      modalBg: "#1e1e1e",
      overlay: "rgba(0,0,0,0.7)",
    },
  };

  // @ts-ignore
  const palette = colors[theme];

  // --- Button
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.style.backgroundColor = color;
  btn.style.color = "#fff";
  btn.style.border = "none";
  btn.style.borderRadius = "8px";
  btn.style.padding = "10px 18px";
  btn.style.fontFamily = "system-ui, sans-serif";
  btn.style.cursor = "pointer";
  btn.style.fontWeight = "600";

  btn.addEventListener("click", openModal);
  script.parentNode?.insertBefore(btn, script.nextSibling);

  // --- Modal
  function openModal() {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:${palette.overlay};display:flex;align-items:center;
      justify-content:center;z-index:9999;
    `;

    const modal = document.createElement("div");
    modal.id = "modal";
     modal.style.cssText = `
      background:${palette.modalBg};
      color:${palette.text};
      border-radius:12px;
      padding:24px;
      max-width:420px;
      width:90%;
      text-align:center;
      box-shadow:0 4px 20px rgba(0,0,0,0.15);
      font-family:system-ui,sans-serif;
      position:relative;
    `;

    const title = document.createElement("h3");
    title.textContent = "Pay with Zcash";
    title.style.marginBottom = "12px";
    modal.appendChild(title);

    // -- Label field (optional)
    if (label) {
      const lbl = document.createElement("p");
      lbl.textContent = label;
      lbl.style.fontWeight = "500";
      lbl.style.marginBottom = "12px";
      modal.appendChild(lbl);
    }

    // -- QRCode
    const baseURI = `zcash:${addr}?amount=${amount}${memo ? `&memo=${encodeURIComponent(memo)}` : ""}`;
    const qr = document.createElement("img");
    // TODO: Replace url before deployment
    qr.src = `http://localhost:4000/api/qr?data=${encodeURIComponent(baseURI)}`;
    qr.alt = "Zcash QR Code";
    qr.style.margin = "0 auto";
    qr.style.display = "block";
    qr.style.borderRadius = "8px";
    modal.appendChild(qr);

    // --- Address + Copy wrapper
    const addrWrapper = document.createElement("div");
    addrWrapper.className = "addrWrapper";
    addrWrapper.style.marginTop = "12px";

    const addrText = document.createElement("p");
    addrText.textContent = String(addr);
    addrText.style.wordBreak = "break-all";
    addrText.style.fontSize = "12px";
    addrText.style.marginTop = "8px";
    addrWrapper.appendChild(addrText);

    const copyBtn = document.createElement("button");
    copyBtn.id = "copyAddressBtn";
    copyBtn.textContent = "Copy Address";
    copyBtn.style.border = "none";
    copyBtn.style.borderRadius = "6px";
    copyBtn.style.background = "#ccc";
    copyBtn.style.color = "#333";
    copyBtn.style.padding = "6px 10px";
    copyBtn.style.fontSize = "12px";
    copyBtn.style.cursor = "pointer";

    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(addr);
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy Address";
        }, 1500);
      } catch (err) {
        console.error("Clipboard error: ", err);
      }
    });

    addrWrapper.appendChild(copyBtn);
    modal.appendChild(addrWrapper);

    // -- Amout
    const amtP = document.createElement("p");
    amtP.textContent = `Amount: ${amount} ZEC`;
    amtP.style.marginTop = "20px";
    amtP.style.fontWeight = "600";
    modal.appendChild(amtP);

    // -- Memo (optional)
    if (memo) {
      const memoBox = document.createElement("div");
      memoBox.style.marginTop = "10px";
      memoBox.style.padding = "10px";
      memoBox.style.border = `1px solid ${theme === "dark" ? "#333" : "#ddd"}`;
      memoBox.style.borderRadius = "6px";
      memoBox.style.fontSize = "16px";
      memoBox.style.textAlign = "left";
      memoBox.textContent = `Memo: ${memo}`;
      modal.appendChild(memoBox);
    }

    // -- Copyable Short URI
    const uriField = document.createElement("input");
    uriField.id = "uriField";
    uriField.type = "text";
    uriField.value = baseURI;
    uriField.style.marginTop = "12px";
    uriField.style.width = "100%";
    uriField.style.fontSize = "12px";
    uriField.style.padding = "4px";
    uriField.style.border = `1px solid ${theme === "dark" ? "#333" : "#ccc"}`;
    modal.appendChild(uriField);

    // -- Close button
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.marginTop = "16px";
    closeBtn.style.padding = "6px 14px";
    closeBtn.style.border = "none";
    closeBtn.style.borderRadius = "6px";
    closeBtn.style.background = "#ccc";
    closeBtn.style.cursor = "pointer";
    closeBtn.addEventListener("click", () => overlay.remove());

    // -- Short URL field
    const shortBtn = document.createElement("button");
    shortBtn.id = "shortBtn";
    shortBtn.textContent = "Generate Short URL";
    shortBtn.style.marginTop = "16px";
    shortBtn.style.padding = "6px 14px";
    shortBtn.style.border = "none";
    shortBtn.style.borderRadius = "6px";
    shortBtn.style.background = "#ccc";
    // shortBtn.style.color = "#fff";
    shortBtn.style.fontSize = "13px";
    shortBtn.style.cursor = "pointer";

    shortBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("http://localhost:4000/api/shorten", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uri: baseURI }),
        });

        const data = await res.json();

        const input = document.createElement("input");
        input.type = "text";
        input.value = data.shortUrl;
        input.readOnly = true;
        input.style.width = "100%";
        input.style.marginTop = "6px";
        input.style.padding = "4px";
        input.style.borderRadius = "4px";
        input.style.border = `1px solid ${theme === "dark" ? "#333" : "#ccc"}`;
        modal.appendChild(input);

        input.select();
        document.execCommand("copy");
        shortBtn.textContent = "Short URL copied!";
        setTimeout(() => {
          shortBtn.textContent = "Generate Short URL";
        }, 2000);
      } catch (err) {
        console.error(err);
        shortBtn.textContent = "Failed, try again";

        setTimeout(() => {
          shortBtn.textContent = "Generate Short URL";
        }, 2000);
      }
    });

    const closeAndShortenWrap = document.createElement("div");
    closeAndShortenWrap.style.cssText = `
      display:flex;align-items:center;
      justify-content:center;gap:12px;
    `;

    closeAndShortenWrap.appendChild(closeBtn);
    closeAndShortenWrap.appendChild(shortBtn);
    modal.appendChild(closeAndShortenWrap);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }
})();
