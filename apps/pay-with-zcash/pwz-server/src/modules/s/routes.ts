import { Router } from "express";
import { urlStore } from "../shorten/routes";

const router = Router();

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const uri = urlStore[id];

  console.log({ id, uri , urlStore});

  if (!uri) {
    return res.status(400).json({ error: "Missing uri" });
  }

  res.status(302).redirect(uri);
});

export default router;
