// @ts-nocheck

/*! pay-with-zcash.embed.js v0.1.1 | (c) PayWithZcash Widget | Dual-mode: auto + programmatic */
(function () {
  // ---------- Configuration ----------
  const DEFAULT_API_BASE =
    typeof window !== "undefined" &&
    window.ZPWZ_CONFIG &&
    window.ZPWZ_CONFIG.apiBase
      ? window.ZPWZ_CONFIG.apiBase
      : "";

  // ---------- Utility helpers ----------
  function safeDecode(v) {
    try {
      return decodeURIComponent(v);
    } catch (e) {
      return v;
    }
  }

  function createEl(tag, attrs = {}, html = "") {
    const el = document.createElement(tag);
    for (const k in attrs) {
      if (k === "class") el.className = attrs[k];
      else if (k === "style") el.style.cssText = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    if (html) el.innerHTML = html;
    return el;
  }

  function qs(root, sel) {
    return (root || document).querySelector(sel);
  }

  function qsa(root, sel) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function mountAfter(el, ref) {
    if (!ref || !ref.parentNode) return;
    ref.parentNode.insertBefore(el, ref.nextSibling);
  }

  function fetchJson(url, opts) {
    return fetch(url, opts).then((r) => {
      if (!r.ok) throw new Error("Network error");
      return r.json();
    });
  }

  // ---------- CSS injection (singleton) ----------
  const STYLE_ID = "zwg-embed-style-v1";
  if (!document.getElementById(STYLE_ID)) {
    const style = createEl("style", { id: STYLE_ID });
    // style.textContent = `
    //   /* minimal widget styles (isolated class prefix: zwg-) */
    //   .zwg-btn{position:relative;display:inline-flex;align-items:center;gap:10px;padding:14px 28px;background:linear-gradient(135deg,#F4B728 0%,#E5A420 100%);color:#1a1a1a;font:600 15px/1 system-ui,-apple-system,sans-serif;border:0;border-radius:14px;cursor:pointer;box-shadow:0 4px 24px -4px rgba(244,183,40,0.5),inset 0 1px 0 rgba(255,255,255,0.3);transition:all .2s ease;overflow:hidden}
    //   .zwg-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px -4px rgba(244,183,40,0.6),inset 0 1px 0 rgba(255,255,255,0.3)}
    //   .zwg-btn:active{transform:translateY(0) scale(.98)}
    //   .zwg-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);transform:translateX(-100%);transition:transform .6s}
    //   .zwg-btn:hover::after{transform:translateX(100%)}
    //   .zwg-btn svg{width:18px;height:18px}
    //   .zwg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:20px;animation:zwg-fade .25s ease}
    //   @keyframes zwg-fade{from{opacity:0}to{opacity:1}}
    //   .zwg-modal{width:100%;max-width:420px;background:var(--zwg-bg,#fff);color:var(--zwg-text,#111);border-radius:28px;padding:24px;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 32px 64px -16px rgba(0,0,0,.4),0 0 0 1px var(--zwg-border,rgba(0,0,0,.08));animation:zwg-pop .35s cubic-bezier(.16,1,.3,1)}
    //   @keyframes zwg-pop{from{opacity:0;transform:scale(.92) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
    //   .zwg-head{text-align:center;margin-bottom:18px}
    //   .zwg-icon{width:56px;height:56px;margin:0 auto 12px;background:linear-gradient(145deg,#F4B728,#D4940F);border-radius:12px;display:flex;align-items:center;justify-content:center;font:700 22px/1 system-ui;color:#1a1a1a;box-shadow:0 8px 20px -6px rgba(244,183,40,.5)}
    //   .zwg-title{margin:0 0 4px;font:700 20px/1.2 system-ui}
    //   .zwg-label{margin:0;font-size:13px;color:var(--zwg-muted,#6b7280)}
    //   .zwg-qr{background:#fff;border-radius:16px;padding:16px;margin-bottom:16px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.05)}
    //   .zwg-qr img{display:block;width:160px;height:160px;margin:0 auto;border-radius:10px}
    //   .zwg-amt{background:var(--zwg-surface,#f3f4f6);border-radius:12px;padding:12px;text-align:center;margin-bottom:12px}
    //   .zwg-amt-lbl{margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--zwg-muted,#6b7280)}
    //   .zwg-amt-val{margin:0;font:700 26px/1.2 system-ui}
    //   .zwg-amt-val b{color:#F4B728}
    //   .zwg-fld{margin-bottom:12px}
    //   .zwg-fld-lbl{display:block;margin-bottom:6px;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--zwg-muted,#6b7280)}
    //   .zwg-fld-row{display:flex;align-items:center;gap:8px;background:var(--zwg-surface,#f3f4f6);border-radius:10px;padding:8px}
    //   .zwg-fld-txt{flex:1;margin:0;font:500 12px/1.4 ui-monospace,SFMono-Regular,monospace;word-break:break-all;color:var(--zwg-text,#111)}
    //   .zwg-fld-inp{flex:1;background:0;border:0;outline:0;font:500 12px/1.4 ui-monospace,SFMono-Regular,monospace;color:var(--zwg-text,#111);width:100%}
    //   .zwg-copy{flex-shrink:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:0;border:0;border-radius:8px;cursor:pointer;color:var(--zwg-muted,#6b7280);transition:all .15s}
    //   .zwg-copy:hover{background:var(--zwg-bg,#fff);color:var(--zwg-text,#111)}
    //   .zwg-copy.ok{background:rgba(34,197,94,.15);color:#22c55e}
    //   .zwg-acts{display:flex;gap:10px;margin-top:12px}
    //   .zwg-btn2{flex:1;padding:12px;font:600 13px/1 system-ui;border:0;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px}
    //   .zwg-pri{background:linear-gradient(135deg,#F4B728,#E5A420);color:#1a1a1a}
    //   .zwg-sec{background:var(--zwg-surface,#f3f4f6);color:var(--zwg-text,#111)}
    //   .zwg-x{position:absolute;top:12px;right:12px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:0;border:0;border-radius:8px;cursor:pointer;color:var(--zwg-muted,#6b7280)}
    //   .zwg-link{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px;font-size:13px;color:var(--zwg-muted,#6b7280);text-decoration:none}
    //   .zwg-spin{width:14px;height:14px;border:2px solid rgba(26,26,26,.2);border-top-color:#1a1a1a;border-radius:50%;animation:zwg-sp .7s linear infinite}
    //   @keyframes zwg-sp{to{transform:rotate(360deg)}}
    //   @media(max-width:480px){.zwg-modal{padding:18px;border-radius:18px}.zwg-qr img{width:140px;height:140px}}
    //   `;

    style.textContent = `
       /* minimal widget styles (isolated class prefix: zwg-) */
  .zwg-btn{position:relative;display:inline-flex;align-items:center;gap:10px;padding:14px 28px;background:linear-gradient(135deg,#F4B728 0%,#E5A420 100%);color:#1a1a1a;font:600 15px/1 system-ui,-apple-system,sans-serif;border:0;border-radius:14px;cursor:pointer;box-shadow:0 4px 24px -4px rgba(244,183,40,0.5),inset 0 1px 0 rgba(255,255,255,0.3);transition:all .2s ease;overflow:hidden}
  .zwg-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px -4px rgba(244,183,40,0.6),inset 0 1px 0 rgba(255,255,255,0.3)}
  .zwg-btn:active{transform:translateY(0) scale(.98)}
  .zwg-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);transform:translateX(-100%);transition:transform .6s}
  .zwg-btn:hover::after{transform:translateX(100%)}
  .zwg-btn svg{width:18px;height:18px}
  .zwg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;animation:zwg-fade .25s ease}
  @keyframes zwg-fade{from{opacity:0}to{opacity:1}}
  .zwg-modal{width:100%;max-width:400px;background:var(--zwg-bg);color:var(--zwg-text);border-radius:28px;padding:28px;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 32px 64px -16px rgba(0,0,0,.4),0 0 0 1px var(--zwg-border);animation:zwg-pop .35s cubic-bezier(.16,1,.3,1)}
  @keyframes zwg-pop{from{opacity:0;transform:scale(.92) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
  .zwg-light{--zwg-bg:#fff;--zwg-text:#111;--zwg-muted:#6b7280;--zwg-surface:#f3f4f6;--zwg-border:rgba(0,0,0,.08)}
  .zwg-dark{--zwg-bg:#18181b;--zwg-text:#fafafa;--zwg-muted:#a1a1aa;--zwg-surface:#27272a;--zwg-border:rgba(255,255,255,.1)}
  .zwg-head{text-align:center;margin-bottom:24px}
  .zwg-icon{width:56px;height:56px;margin:0 auto 14px;background:linear-gradient(145deg,#F4B728,#D4940F);border-radius:16px;display:flex;align-items:center;justify-content:center;font:700 24px/1 system-ui;color:#1a1a1a;box-shadow:0 8px 20px -6px rgba(244,183,40,.5)}
  .zwg-title{margin:0 0 4px;font:700 22px/1.2 system-ui}
  .zwg-label{margin:0;font-size:13px;color:var(--zwg-muted)}
  .zwg-qr{background:#fff;border-radius:20px;padding:20px;margin-bottom:20px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.05)}
  .zwg-qr img{display:block;width:180px;height:180px;margin:0 auto;border-radius:12px}
  .zwg-amt{background:var(--zwg-surface);border-radius:16px;padding:16px;text-align:center;margin-bottom:16px}
  .zwg-amt-lbl{margin:0 0 2px;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--zwg-muted)}
  .zwg-amt-val{margin:0;font:700 32px/1.2 system-ui}
  .zwg-amt-val b{color:#F4B728}
  .zwg-amt-val small{font-size:16px;color:var(--zwg-muted);margin-left:6px;font-weight:500}
  .zwg-fld{margin-bottom:14px}
  .zwg-fld-lbl{display:block;margin-bottom:6px;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--zwg-muted)}
  .zwg-fld-row{display:flex;align-items:center;gap:8px;background:var(--zwg-surface);border-radius:12px;padding:10px 12px}
  .zwg-fld-txt{flex:1;margin:0;font:500 12px/1.4 ui-monospace,SFMono-Regular,monospace;word-break:break-all;color:var(--zwg-text)}
  .zwg-fld-inp{flex:1;background:0;border:0;outline:0;font:500 12px/1.4 ui-monospace,SFMono-Regular,monospace;color:var(--zwg-text);width:100%}
  .zwg-memo{background:var(--zwg-surface);border-radius:12px;padding:12px 14px;font-size:13px;line-height:1.5;color:var(--zwg-text)}
  .zwg-copy{flex-shrink:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:0;border:0;border-radius:8px;cursor:pointer;color:var(--zwg-muted);transition:all .15s}
  .zwg-copy:hover{background:var(--zwg-bg);color:var(--zwg-text)}
  .zwg-copy.ok{background:rgba(34,197,94,.15);color:#22c55e}
  .zwg-copy svg{width:14px;height:14px}
  .zwg-acts{display:flex;gap:10px;margin-top:20px}
  .zwg-btn2{flex:1;padding:14px;font:600 13px/1 system-ui;border:0;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .15s}
  .zwg-btn2 svg{width:14px;height:14px}
  .zwg-sec{background:var(--zwg-surface);color:var(--zwg-text)}
  .zwg-sec:hover{filter:brightness(1.05)}
  .zwg-pri{background:linear-gradient(135deg,#F4B728,#E5A420);color:#1a1a1a}
  .zwg-pri:hover{box-shadow:0 6px 20px -4px rgba(244,183,40,.5);transform:translateY(-1px)}
  .zwg-pri:disabled{opacity:.5;cursor:not-allowed;transform:none}
  .zwg-spin{width:14px;height:14px;border:2px solid rgba(26,26,26,.2);border-top-color:#1a1a1a;border-radius:50%;animation:zwg-sp .7s linear infinite}
  @keyframes zwg-sp{to{transform:rotate(360deg)}}
  .zwg-link{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:14px;font-size:13px;color:var(--zwg-muted);text-decoration:none;transition:color .15s}
  .zwg-link:hover{color:var(--zwg-text)}
  .zwg-link svg{width:14px;height:14px}
  .zwg-x{position:absolute;top:14px;right:14px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:0;border:0;border-radius:50%;cursor:pointer;color:var(--zwg-muted);transition:all .15s}
  .zwg-x:hover{background:var(--zwg-surface);color:var(--zwg-text)}
  .zwg-x svg{width:16px;height:16px}
  @media(max-width:480px){.zwg-modal{padding:22px;border-radius:24px}.zwg-acts{flex-direction:column}}
`;
    document.head.appendChild(style);
  }

  // ---------- Minimal SVGs ----------
  const ICONS = {
    z: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M8 9h8M8 15h8M15 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
    cp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
    ok: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>`,
    lnk: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
    ext: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>`,
  };

  // ---------- Core renderer ----------
  function createWidgetInstance(rootEl, cfg) {
    // Normalize config
    const config = {
      address: String(cfg.address || cfg.addr || "").trim(),
      amount: cfg.amount != null ? String(cfg.amount) : "",
      label: cfg.label || cfg.text || "Pay with Zcash",
      theme: cfg.theme === "dark" ? "dark" : "light",
      memo: cfg.memo || "",
      apiBase: cfg.apiBase || cfg.api || DEFAULT_API_BASE,
      customCSS: cfg.css || cfg.customCSS || null,
    };

    if (!config.address || !config.amount) {
      console.error(
        "[Pay-with-Zcash] Missing address or amount in config",
        config
      );
      return null;
    }

    // Attach custom CSS if provided
    if (config.customCSS) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = config.customCSS;
      document.head.appendChild(link);
    }

    // Build button
    const btn = createEl("button", {
      class: "zwg-btn",
      type: "button",
      name: "invoke-btn",
    });
    btn.innerHTML = `${ICONS.z}<span>${config.label}</span>`;

    // Insert button into rootEl
    rootEl.appendChild(btn);

    // Track created overlay to allow cleanup
    let overlayEl = null;

    // copy helper
    async function copyToClipboard(text, btnEl) {
      try {
        await navigator.clipboard.writeText(text);
        if (btnEl) {
          btnEl.classList.add("ok");
          btnEl.innerHTML = ICONS.ok;
          setTimeout(() => {
            btnEl.classList.remove("ok");
            btnEl.innerHTML = ICONS.cp;
          }, 1500);
        }
      } catch (e) {
        console.error("copy failed", e);
      }
    }

    // create modal/overlay
    function openModal() {
      if (overlayEl) return; // already open
      const uri = `zcash:${config.address}?amount=${config.amount}${config.memo ? `&memo=${encodeURIComponent(config.memo)}` : ""}`;
      const cls = config.theme === "dark" ? "zwg-dark" : "zwg-light";

      overlayEl = createEl("div", {
        class: "zwg-overlay",
        role: "dialog",
        "aria-modal": "true",
      });
      overlayEl.innerHTML = `
        <div class="zwg-modal ${cls}" style="position:relative">
          <button class="zwg-x" aria-label="Close">${ICONS.x}</button>
          <div class="zwg-head">
            <div class="zwg-icon">Z</div>
            <h2 class="zwg-title">Pay with Zcash</h2>
            ${config.label ? `<p class="zwg-label">${config.label}</p>` : ""}
          </div>
          <div class="zwg-qr">
            <img src="${config.apiBase}/qr?data=${encodeURIComponent(uri)}&size=240x240" alt="QR"/>
          </div>
          <div class="zwg-amt">
            <p class="zwg-amt-lbl">Amount Due</p>
            <p class="zwg-amt-val"><b>${Number(config.amount).toFixed(3)}</b><small>ZEC</small></p>
          </div>
          <div class="zwg-fld">
            <span class="zwg-fld-lbl">Address</span>
            <div class="zwg-fld-row">
              <p class="zwg-fld-txt">${config.address}</p>
              <button class="zwg-copy" data-c="${config.address}">${ICONS.cp}</button>
            </div>
          </div>
          ${config.memo ? `<div class="zwg-fld"><span class="zwg-fld-lbl">Memo</span><div class="zwg-memo">${config.memo}</div></div>` : ""}
          <div class="zwg-fld">
            <span class="zwg-fld-lbl">Payment URI</span>
            <div class="zwg-fld-row">
              <input class="zwg-fld-inp" value="${uri}" readonly>
              <button class="zwg-copy" data-c="${uri}">${ICONS.cp}</button>
            </div>
          </div>
          <div class="zwg-acts">
            <button class="zwg-btn2 zwg-sec zwg-close">Close</button>
            <button class="zwg-btn2 zwg-pri zwg-short">${ICONS.lnk} Short URL</button>
          </div>
          <a href="${uri}" class="zwg-link" rel="noreferrer noopener">${ICONS.ext} Open in Wallet</a>
        </div>
      `;

      overlayEl.addEventListener("click", (e) => {
        if (e.target === overlayEl) cleanupModal();
      });

      document.body.appendChild(overlayEl);

      // wire events
      const closeBtn = qs(overlayEl, ".zwg-x");
      if (closeBtn) closeBtn.addEventListener("click", cleanupModal);
      const closeBtn2 = qs(overlayEl, ".zwg-close");
      if (closeBtn2) closeBtn2.addEventListener("click", cleanupModal);

      qsa(overlayEl, ".zwg-copy").forEach((b) => {
        b.addEventListener("click", function () {
          const txt = this.getAttribute("data-c") || "";
          copyToClipboard(txt, this);
        });
      });

      const shortBtn = qs(overlayEl, ".zwg-short");
      if (shortBtn) {
        shortBtn.addEventListener("click", async function () {
          shortBtn.disabled = true;
          const original = shortBtn.innerHTML;
          shortBtn.innerHTML = `<span class="zwg-spin"></span>`;
          try {
            const res = await fetchJson(`${config.apiBase}/shorten`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uri }),
            });
            const shortUrl =
              res.shortUrl || res.shortUrlFull || res.url || res.short || "";
            shortBtn.innerHTML = `${ICONS.ok} Done`;

            const fld = createEl("div", { class: "zwg-fld" });
            fld.innerHTML = `
              <span class="zwg-fld-lbl">Short URL</span>
              <div class="zwg-fld-row">
                <input class="zwg-fld-inp" value="${shortUrl}" readonly>
                <button class="zwg-copy" data-c="${shortUrl}">${ICONS.cp}</button>
              </div>
            `;
            qs(overlayEl, ".zwg-acts").before(fld);
            qs(fld, ".zwg-copy").addEventListener("click", function () {
              copyToClipboard(shortUrl, this);
            });
          } catch (err) {
            console.error("shorten failed", err);
            shortBtn.innerHTML = `${ICONS.lnk} Retry`;
            shortBtn.disabled = false;
          }
        });
      }
    }

    function cleanupModal() {
      if (overlayEl && overlayEl.parentNode) {
        overlayEl.parentNode.removeChild(overlayEl);
        overlayEl = null;
      }
    }

    // attach click
    btn.addEventListener("click", openModal);

    // return instance API
    return {
      open: openModal,
      close: cleanupModal,
      destroy: function () {
        cleanupModal();
        btn.removeEventListener("click", openModal);
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      },
      root: rootEl,
      config,
    };
  }

  // ---------- Programmatic API exposed on window ----------
  if (!window.renderZcashButton) {
    window.renderZcashButton = function (targetOrSelector, cfg) {
      console.log(" window.renderZcashButton called ", {
        targetOrSelector,
        cfg,
      });

      // if called with single arg and it's a config, mount after current script
      let target = null;
      let config = cfg || {};

      if (!cfg && typeof targetOrSelector === "object") {
        // render into default container next to script tag
        config = targetOrSelector;
        const script = document.currentScript;

        const wrapper = createEl("div");
        mountAfter(wrapper, script);

        return createWidgetInstance(wrapper, config);
      }

      // when targetOrSelector is a selector or element
      if (typeof targetOrSelector === "string") {
        target = document.querySelector(targetOrSelector);
        if (!target) {
          console.error(
            "[Pay-with-Zcash] renderZcashButton: target selector not found:",
            targetOrSelector
          );
          return null;
        }
      } else if (targetOrSelector instanceof HTMLElement) {
        target = targetOrSelector;
      } else {
        console.error("[Pay-with-Zcash] renderZcashButton: invalid arguments");
        return null;
      }

      return createWidgetInstance(target, cfg || {});
    };
  }

  // ---------- Auto-run behavior (preserve current behavior) ----------
  function autodetectAndMount(scriptEl) {
    if (!scriptEl) return;
    // allow opt-out with data-auto="false"
    if (scriptEl.dataset && scriptEl.dataset.auto === "false") return;

    const data = Object.assign({}, scriptEl.dataset || {});
    // normalize dataset keys (data-addr or data-address)
    if (!data.address && data.addr) data.address = data.addr;

    const { pwzWidget } = data;
    const matchId = "#pwz-widget-container"
      .toLowerCase()
      .search("#pwz-widget-container");
      // check widget wrapper is attached to script
    if (matchId < 0) {
      alert(
        `The script should have an attribute of 'data-pwz-widget=#pwz-widget-container' where '#pwz-widget-container' is the attribute value of 'id' on a div tag that the pwz-widget would be mounted. 
        Example: <div id="pwz-widget-container"></div>`
      );

      return;
    }

    const wrapper = pwzWidget.startsWith("#")
      ? document.getElementById(pwzWidget.replace("#", ""))
      : createEl("div", { id: "pwz-widget-container" });

    mountAfter(wrapper, scriptEl);
    // build config from dataset
    const cfg = {
      address: safeDecode(data.address),
      amount: safeDecode(data.amount),
      label: safeDecode(data.label || data.text || ""),
      theme: safeDecode(data.theme || "light"),
      memo: safeDecode(data.memo || ""),
      apiBase: safeDecode(data.api || data.apiBase || DEFAULT_API_BASE),
      css: safeDecode(data.css || ""),
    };

    // attempt mount only if address & amount present
    if (!cfg.address || !cfg.amount) {
      // keep silent: original behavior console.error already did
      // but show a helpful message in dev
      if (
        location.hostname === "localhost" ||
        location.hostname.endsWith(".local")
      ) {
        console.warn(
          "[Pay-with-Zcash] auto-mount skipped — missing data-address / data-amount on script tag."
        );
      }
      return;
    }

    // create instance (auto-managed)
    const inst = createWidgetInstance(wrapper, cfg);
    // store for debug if needed
    (window.__ZWG_INSTANCES__ = window.__ZWG_INSTANCES__ || []).push(inst);
  }

  // find current script that loaded this file (works in typical script tag usage)
  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

  // If script tag present, auto-mount (preserve old behavior)
  if (currentScript) {
    autodetectAndMount(currentScript);
  }

  // end of IIFE
})();
