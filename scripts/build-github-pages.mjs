/**
 * Builds a static export of the Next.js UI for GitHub Pages (/GrowPal).
 * Temporarily moves app/api aside because Route Handlers are not supported in static export.
 */
import { spawnSync } from "child_process"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const root = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.join(root, "..")
const skipDuringExport = [
  "api",
  "admin",
  "expert",
  "my-plant",
  "planner",
  "dashboard",
  "settings",
  "chat",
]

const dirsToBackup = skipDuringExport.map((name) => ({
  src: path.join(projectRoot, "app", name),
  backup: path.join(projectRoot, `.pages-backup-${name}`),
  label: `app/${name}`,
}))
const docsDir = path.join(projectRoot, "docs")
const outDir = path.join(projectRoot, "out")
const docsBackup = path.join(projectRoot, "docs.pre-pages-build")

function run(cmd, args, env = {}) {
  const result = spawnSync(cmd, args, {
    cwd: projectRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
  })
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(" ")}`)
  }
}

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) copyRecursive(from, to)
    else fs.copyFileSync(from, to)
  }
}

function removeRecursive(target) {
  if (!fs.existsSync(target)) return
  fs.rmSync(target, { recursive: true, force: true })
}

try {
  console.log("Extracting shop seed data...")
  run("node", ["scripts/extract-shop-seeds.mjs"])

  console.log("Syncing public assets (Web, images, videos)...")
  run("node", ["scripts/sync-public-assets.mjs"])

  for (const { src, backup, label } of dirsToBackup) {
    if (fs.existsSync(src)) {
      console.log(`Backing up ${label} for static export build...`)
      if (fs.existsSync(backup)) removeRecursive(backup)
      copyRecursive(src, backup)
      removeRecursive(src)
    }
  }

  const publicWeb = path.join(projectRoot, "public", "Web")
  const publicImages = path.join(projectRoot, "public", "images")
  if (!fs.existsSync(publicWeb) || fs.readdirSync(publicWeb).length === 0) {
    throw new Error(
      "public/Web is missing or empty. Copy plant photos into public/Web before build:pages.",
    )
  }
  if (!fs.existsSync(publicImages) || fs.readdirSync(publicImages).length < 2) {
    throw new Error(
      "public/images is missing product images. Copy assets into public/images before build:pages.",
    )
  }

  console.log("Building static export for GitHub Pages...")
  run("npm", ["run", "build"], {
    GITHUB_PAGES: "1",
    NEXT_PUBLIC_STATIC_PAGES: "1",
  })

  if (!fs.existsSync(outDir)) {
    throw new Error("Build did not produce an out/ directory.")
  }

  const screenshotsDir = path.join(docsDir, "screenshots")
  const screenshotsBackup = path.join(projectRoot, ".pages-screenshots-backup")
  if (fs.existsSync(screenshotsDir)) {
    if (fs.existsSync(screenshotsBackup)) removeRecursive(screenshotsBackup)
    try {
      fs.renameSync(screenshotsDir, screenshotsBackup)
    } catch {
      copyRecursive(screenshotsDir, screenshotsBackup)
    }
  }

  console.log("Publishing build to docs/ for GitHub Pages (merge into docs/, no folder delete)...")
  fs.mkdirSync(docsDir, { recursive: true })
  copyRecursive(outDir, docsDir)
  fs.writeFileSync(path.join(docsDir, ".nojekyll"), "")

  if (fs.existsSync(screenshotsBackup)) {
    copyRecursive(screenshotsBackup, path.join(docsDir, "screenshots"))
    removeRecursive(screenshotsBackup)
  }

  removeRecursive(outDir)

  console.log("Done. Enable GitHub Pages: branch main, folder /docs")
} finally {
  for (const { src, backup, label } of dirsToBackup) {
    if (fs.existsSync(backup)) {
      if (!fs.existsSync(src)) copyRecursive(backup, src)
      removeRecursive(backup)
      console.log(`Restored ${label}`)
    }
  }
}
