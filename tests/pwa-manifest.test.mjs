// tests/pwa-manifest.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

test("PWA Manifest & Service Worker Verification", async (t) => {
  const manifestPath = path.join(rootDir, "public", "manifest.json");
  const swPath = path.join(rootDir, "public", "sw.js");
  const offlinePath = path.join(rootDir, "public", "offline.html");

  await t.test("Manifest file exists and has valid JSON", () => {
    assert.equal(fs.existsSync(manifestPath), true);
    const content = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(content);

    assert.equal(manifest.name, "ROBO MATES");
    assert.equal(manifest.display, "standalone");
    assert.equal(manifest.start_url, "/dashboard");
    assert.equal(Array.isArray(manifest.icons), true);
    assert.equal(manifest.icons.length >= 2, true);
  });

  await t.test("Service worker file exists and registers push/fetch handlers", () => {
    assert.equal(fs.existsSync(swPath), true);
    const swContent = fs.readFileSync(swPath, "utf-8");

    assert.equal(swContent.includes('self.addEventListener("fetch"'), true);
    assert.equal(swContent.includes('self.addEventListener("push"'), true);
    assert.equal(swContent.includes('self.addEventListener("notificationclick"'), true);
  });

  await t.test("Offline fallback page exists with informative message", () => {
    assert.equal(fs.existsSync(offlinePath), true);
    const offlineContent = fs.readFileSync(offlinePath, "utf-8");
    assert.equal(offlineContent.includes("ROBO MATES is Offline"), true);
  });

  await t.test("PWA application icons exist on disk", () => {
    const icon192 = path.join(rootDir, "public", "icons", "icon-192.png");
    const icon512 = path.join(rootDir, "public", "icons", "icon-512.png");

    assert.equal(fs.existsSync(icon192), true);
    assert.equal(fs.existsSync(icon512), true);

    const stats192 = fs.statSync(icon192);
    const stats512 = fs.statSync(icon512);

    assert.equal(stats192.size > 100, true);
    assert.equal(stats512.size > 100, true);
  });
});

