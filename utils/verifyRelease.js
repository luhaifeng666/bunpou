import fs from "node:fs/promises";
import path from "node:path";

const workspaceRoot = path.resolve(".");
const distRoot = path.join(workspaceRoot, ".vitepress", "dist");
const tauriConfigPath = path.join(workspaceRoot, "src-tauri", "tauri.conf.json");

const requiredFiles = [
  path.join(distRoot, "index.html"),
  path.join(distRoot, "docs", "index.html"),
  path.join(distRoot, "voices"),
  path.join(workspaceRoot, "src-tauri", "icons", "icon.icns"),
  path.join(workspaceRoot, "src-tauri", "icons", "icon.ico"),
];

async function assertExists(targetPath) {
  await fs.access(targetPath);
}

async function main() {
  const failures = [];

  for (const targetPath of requiredFiles) {
    try {
      await assertExists(targetPath);
    } catch {
      failures.push(`Missing required release asset: ${path.relative(workspaceRoot, targetPath)}`);
    }
  }

  const tauriConfig = JSON.parse(await fs.readFile(tauriConfigPath, "utf-8"));
  const productName = tauriConfig.package?.productName;
  const appTitle = tauriConfig.tauri?.windows?.[0]?.title;
  const bundleId = tauriConfig.tauri?.bundle?.identifier;

  if (productName !== "Bunpou") {
    failures.push(`Unexpected product name: ${productName || "<empty>"}`);
  }

  if (appTitle !== "Bunpou · 日语语法学习") {
    failures.push(`Unexpected window title: ${appTitle || "<empty>"}`);
  }

  if (!bundleId) {
    failures.push("Bundle identifier is missing.");
  }

  if (failures.length) {
    console.error("Release verification failed:\n");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log("Release verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});