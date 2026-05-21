import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const code = fs.readFileSync(path.join(root, "sync-shop-products.js"), "utf8")
const match = code.match(/const products = (\[[\s\S]*?\r?\n\])\s*\r?\n\r?\nasync function main/)
if (!match) {
  console.error("Could not parse products array from sync-shop-products.js")
  process.exit(1)
}

const localAsset = (p) => p
const webImage = (p) => `/Web/${p}`
const products = eval(match[1])

fs.mkdirSync(path.join(root, "data"), { recursive: true })
fs.writeFileSync(
  path.join(root, "data", "shop-product-seeds.json"),
  JSON.stringify(products, null, 2),
)
console.log(`Wrote ${products.length} products to data/shop-product-seeds.json`)
