/**
 * Verifies all shop product images exist on disk and prints fixes.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const seeds = JSON.parse(fs.readFileSync(path.join(root, "data", "shop-product-seeds.json"), "utf8"))
const publicDir = path.join(root, "public")

function fileExists(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("/")) return false
  const rel = imageUrl.replace(/^\//, "").split("/").join(path.sep)
  return fs.existsSync(path.join(publicDir, rel))
}

let ok = 0
let bad = []

for (const p of seeds) {
  const exists = fileExists(p.imageUrl)
  if (exists) ok++
  else bad.push({ slug: p.slug, name: p.name, imageUrl: p.imageUrl })
}

console.log(`OK: ${ok}/${seeds.length}`)
if (bad.length) {
  console.log("MISSING:")
  for (const b of bad) console.log(`  ${b.slug}: ${b.imageUrl}`)
  process.exit(1)
}
