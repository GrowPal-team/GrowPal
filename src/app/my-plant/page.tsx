import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MyPlantExperience } from "@/components/my-plant/my-plant-experience"

export const metadata: Metadata = {
  title: "My Plant | GrowPal",
  description: "Grow a virtual plant with every order and earn sustainable rewards.",
}

export default async function MyPlantPage({
  searchParams,
}: {
  searchParams: Promise<{ reward?: string }>
}) {
  const sp = await searchParams
  const rewardHint = sp.reward === "1"

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-[#f3ecdf]">
        <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
          <MyPlantExperience rewardHint={rewardHint} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
