import crypto from "node:crypto";
import { config } from "../config";

export function encrypt(txt: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(config.MASTER_KEY.padEnd(32).slice(0, 32)),
    iv
  );
  const encrypted = Buffer.concat([cipher.update(txt, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(base64: string) {
  const data = Buffer.from(base64, "base64");

  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const encrypted = data.slice(28);

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(config.MASTER_KEY.padEnd(32).slice(0, 32)),
    iv
  );
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
