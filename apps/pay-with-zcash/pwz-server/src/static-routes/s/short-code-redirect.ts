import { Router } from "express";
import { urlStore } from "../../modules/shorten/routes";

const shortCodRedirectRouter = Router();

shortCodRedirectRouter.get("/s/:id", async (req, res) => {
  const id = req.params.id;
  const uri = urlStore[id];

  if (!uri) {
    return res.status(400).json({ error: "Invalid or expired payment link." });
  }

  // res.status(302).redirect(uri);
  res.setHeader("Content-Type", "text/html");
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Open Zcash Wallet</title>
  <style>
    body {
      background: #f9fafb;
      padding: 40px;
      text-align: center;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin: 0;
    }
    .card {
      max-width: 420px;
      background: white;
      padding: 24px;
      margin: auto;
      border-radius: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    a {
      background: #E5A420;
      color:  #333;
      padding: 14px 20px;
      display: inline-block;
      border-radius: 10px;
      text-decoration: none;
      font-size: 16px;
      margin-top: 20px;
      font-weight: 800;
    }
  </style>

  <script>
    // Try to deep-link automatically after 300ms
    window.onload = function () {
      setTimeout(() => {
        window.location.href = "${uri}";
      }, 300);

      // If nothing happens in 2.5 seconds → show fallback button
      setTimeout(() => {
        document.getElementById("fallback").style.display = "block";
      }, 2500);
    };
  </script>
</head>
<body>
  <div class="card">

    <h2>Open Your Zcash Wallet</h2>
    <p>Your device should automatically open a Zcash wallet to complete the payment.</p>

    <div id="fallback" style="display:block;">
      <p>If nothing happened, tap the button below:</p>
      <a href="${uri}">Open Zcash Wallet</a>
    </div>
  </div>
</body>
</html>
  `);
});

export default shortCodRedirectRouter;
