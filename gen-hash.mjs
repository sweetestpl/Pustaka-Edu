// Generate hash untuk .env.local
// Usage: node gen-hash.mjs
import { scryptSync, randomBytes } from "crypto";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 32).toString("hex");
  return `scrypt$${salt}$${key}$32`;
}

const entries = [
  ["admin", "admin123"],
  ["123456", "123456"],
  ["234567", "234567"],
  ["345678", "345678"],
  ["456789", "456789"],
];

const lines = entries.map(([user, pass]) => {
  const h = hashPassword(pass);
  return `${user}:${h}`;
}).join(",");

console.log("USERS=" + lines);
