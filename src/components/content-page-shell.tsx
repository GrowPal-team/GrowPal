import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"

export function ContentPageShell({
  title,
  subtitle,
  children,
  className,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fcfaf7]">
      <Navbar />
      <main
        className={cn(
          "mx-auto w-full max-w-3xl flex-1 px-4 py-12 lg:px-8",
          className
        )}
      >
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 text-lg text-muted-foreground">{subtitle}</p>
        ) : null}
        <div className="mt-10 space-y-6 text-base leading-relaxed text-foreground">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
