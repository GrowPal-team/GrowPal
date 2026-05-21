/**
 * Ensures public/ has Web, images, and videos for local dev and Next export.
 * Restores from docs/ when public assets are missing.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return 0
  fs.mkdirSync(dest, { recursive: true })
  let count = 0
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) count += copyRecursive(from, to)
    else {
      fs.copyFileSync(from, to)
      count++
    }
  }
  return count
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0
  let n = 0
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) n += countFiles(path.join(dir, entry.name))
    else n++
  }
  return n
}

const pairs = [
  { src: path.join(root, "docs", "Web"), dest: path.join(root, "public", "Web") },
  { src: path.join(root, "docs", "images"), dest: path.join(root, "public", "images") },
  { src: path.join(root, "docs", "videos"), dest: path.join(root, "public", "videos") },
]

let copied = 0
for (const { src, dest } of pairs) {
  const destCount = countFiles(dest)
  if (destCount < 3 && fs.existsSync(src)) {
    copied += copyRecursive(src, dest)
    console.log(`Synced ${src} → ${dest}`)
  }
}

if (copied === 0) {
  console.log("Public assets already present.")
} else {
  console.log(`Synced ${copied} files into public/.`)
}
