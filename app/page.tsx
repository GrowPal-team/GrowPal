import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ExpertHomeRedirect } from "@/components/expert-home-redirect"
import { HeroSection } from "@/components/home/hero-section"
import { HowItWorks } from "@/components/home/how-it-works"
import { FeaturedPackages } from "@/components/home/featured-packages"
import { SustainabilityImpact } from "@/components/home/sustainability-impact"
import { Testimonials } from "@/components/home/testimonials"
import { GrowingZone } from "@/components/home/growing-zone"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <ExpertHomeRedirect />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <FeaturedPackages />
        <SustainabilityImpact />
        <Testimonials />
        <GrowingZone />
      </main>
      <Footer />
    </div>
  )
}
