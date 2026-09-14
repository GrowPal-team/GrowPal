import Link from "next/link"

const linkClass =
  "cursor-pointer text-muted-foreground transition-colors hover:text-foreground"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="mb-10 border-b border-border pb-10 text-center md:text-left">
          <Link href="/" className="cursor-pointer font-serif text-xl font-bold text-foreground">
            GrowPal
          </Link>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground md:mx-0">
            Making greener living simpler, more practical, and more accessible.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Customer Service</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href="/faq" className={linkClass}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className={linkClass}>
                  Shipping &amp; handling
                </Link>
              </li>
              <li>
                <Link href="/our-impact" className={linkClass}>
                  Impact &amp; guarantee
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  Contact us
                </Link>
              </li>
              <li>
                <Link href="/feedback" className={linkClass}>
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Explore</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href="/shop" className={linkClass}>
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/our-story" className={linkClass}>
                  Our story
                </Link>
              </li>
              <li>
                <Link href="/climate-zones" className={linkClass}>
                  Find your plant &amp; zone
                </Link>
              </li>
              <li>
                <Link href="/plant-care" className={linkClass}>
                  Plant care library
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Your GrowPal</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href="/settings" className={linkClass}>
                  My account &amp; profile
                </Link>
              </li>
              <li>
                <Link href="/planner" className={linkClass}>
                  My Space
                </Link>
              </li>
              <li>
                <Link href="/cart" className={linkClass}>
                  Cart &amp; checkout
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className={linkClass}>
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} GrowPal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
