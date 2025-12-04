import { Router } from "express";
import { nanoid } from "nanoid";
import { config } from "../../config";

const router = Router();

// TODO: Using memory store (can be changed to db)
export const urlStore: Record<string, string> = {}; // shortId => full URI

router.post("/", async (req, res) => {
  const { uri } = req.body;

  if (!uri) {
    return res.status(400).json({ error: "Missing uri" });
  }
  const shortId = nanoid(8);
  urlStore[shortId] = uri;

  const shortUrl = `${config.baseUrl || "http://localhost:3000"}/s/${shortId}`;
  res.status(200).json({shortUrl})
});

export default router;
